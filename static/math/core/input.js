/* Math Ladder core: the answer box. Needs gen.js, tex.js and check.js (and core.css for the look).

   var box = MathLadder.input(container, spec, opts)
     spec   the problem's answer spec ({ t: 'num' | 'expr' | 'eq' | 'set' | 'tuple' | 'matrix' | 'interval' | 'ineq' | 'mc' |
            'tf' | 'text' | 'multi', … }); only its type and shape are used (sizes, variables, choices), never shown
     opts   { label: 'Your answer' (accessible name), placeholder, unit: 'cm' (shown after the box; may hold $…$),
              keypad: 'auto' (open on touch screens) | true | false,
              keys: ['pi', 'sqrt', …] (extra keypad keys), autofocus: false, choiceHtml: fn(text) -> html }
   box.el                 the wrapper (.ml-input); the app adds .ml-right / .ml-wrong to it for feedback
   box.value()            what the learner gave, in the form MathLadder.check(spec, value) takes:
                          a string (num, expr, eq, set, interval, ineq, text), an array of strings (tuple),
                          rows of strings (matrix), an array of part values (multi), an index or array of indexes
                          (mc; -1 or [] when nothing is picked), true / false / null (tf)
   box.set(v) box.clear() box.focus() box.disable() box.enable()
   box.onSubmit(fn)       fn(value) when the learner presses Enter (or the keypad's Enter key). With no onSubmit handler,
                          the keypad's Enter key and Enter on a choice send an Enter keydown from box.el, so a page that
                          listens for Enter (like the problem card) checks the answer.
   box.onChange(fn)       fn(value) on every change
   box.isEmpty()          true when nothing has been entered yet
   box.mark(result)       show a MathLadder.check result: adds .ml-right or .ml-wrong (per part for multi); mark(null) clears
   box.keypad(open)       open or close the keypad
   box.destroy()          remove it

   Text answers get a live MathML preview of what is typed (aria-hidden; a gentle "keep typing" while it can't be read),
   and a keypad (toggle) matched to the answer type: digits and operators, fraction, power, square root, pi, parentheses,
   the answer's variables, ≤ ≥ for inequalities, ∞ and ∪ for intervals, a comma for sets and lists, and
   "No solution" / "All real numbers" buttons for sets, intervals and inequalities.                                     */
(function (root) {
  'use strict';
  var ML = root.MathLadder = root.MathLadder || {};
  var D = root.document;
  var uid = 0;

  function h(tag, cls, attrs, text) {
    var e = D.createElement(tag); if (cls) e.className = cls;
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function coarse() { try { return root.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } }
  function str(x) { return x === null || x === undefined ? '' : String(x); }
  function htmlOf(text, opts) { // choice text with $…$ math, as HTML
    if (opts && opts.choiceHtml) return opts.choiceHtml(text);
    var s = str(text), escd = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return ML.html ? ML.html(escd) : escd;
  }

  // ---------------------------------------------------------------- keypad keys
  // [label, insert, aria, opts]  insert: text, or {fn: name}; '|' marks where the cursor goes
  var K = {
    '0': ['0', '0'], '1': ['1', '1'], '2': ['2', '2'], '3': ['3', '3'], '4': ['4', '4'], '5': ['5', '5'], '6': ['6', '6'], '7': ['7', '7'], '8': ['8', '8'], '9': ['9', '9'],
    dot: ['.', '.', 'decimal point'], neg: ['−', '-', 'minus'], plus: ['+', '+', 'plus'], times: ['×', '*', 'times'], div: ['÷', '/', 'divided by'],
    frac: ['a/b', '/', 'fraction bar', 'op'], pow: ['xⁿ', '^', 'power', 'op'], sq: ['x²', '^2', 'squared', 'op'], sqrt: ['√', 'sqrt(|)', 'square root', 'op'],
    pi: ['π', 'pi', 'pi', 'op'], e: ['e', 'e', 'e', 'op'], paren: ['( )', '(|)', 'parentheses', 'op'], lp: ['(', '(', 'open parenthesis', 'op'], rp: [')', ')', 'close parenthesis', 'op'],
    lb: ['[', '[', 'open bracket', 'op'], rb: [']', ']', 'close bracket', 'op'], comma: [',', ', ', 'comma', 'op'], space: ['␣', ' ', 'space (for mixed numbers like 2 1/2)', 'op'],
    eq: ['=', ' = ', 'equals', 'op'], lt: ['<', ' < ', 'less than', 'op'], gt: ['>', ' > ', 'greater than', 'op'], le: ['≤', ' <= ', 'less than or equal to', 'op'], ge: ['≥', ' >= ', 'greater than or equal to', 'op'],
    inf: ['∞', 'inf', 'infinity', 'op'], cup: ['∪', ' U ', 'union', 'op'], or: ['or', ' or ', 'or', 'op'], abs: ['|x|', 'abs(|)', 'absolute value', 'op'], pm: ['±', '±', 'plus or minus', 'op'],
    pct: ['%', '%', 'percent', 'op'], i: ['i', 'i', 'imaginary unit i', 'op'],
    sin: ['sin', 'sin(|)', 'sine', 'fn'], cos: ['cos', 'cos(|)', 'cosine', 'fn'], tan: ['tan', 'tan(|)', 'tangent', 'fn'], ln: ['ln', 'ln(|)', 'natural log', 'fn'], log: ['log', 'log(|)', 'log', 'fn'],
    left: ['◀', { move: -1 }, 'move left', 'nav'], right: ['▶', { move: 1 }, 'move right', 'nav'], back: ['⌫', { back: 1 }, 'delete', 'nav'], enter: ['↵', { enter: 1 }, 'check answer', 'enter']
  };
  function varsOf(spec) {
    if (spec.vars && spec.vars.length) return spec.vars.slice(0, 4);
    var s = str(Array.isArray(spec.v) ? spec.v.join(' ') : spec.v).replace(/\b(sqrt|cbrt|pi|sin|cos|tan|sec|csc|cot|ln|log|exp|abs|inf|infinity|or|and|all|none|asin|acos|atan|arcsin|arccos|arctan|sinh|cosh|tanh|floor|ceil)\b/g, ' ');
    var seen = [], m, re = /[a-zA-Zθα-ω]/g;
    while ((m = re.exec(s))) { var c = m[0]; if (c === 'e' || c === 'i' || c === 'U' || c === 'C' && /\+\s*C\b/.test(s)) continue; if (seen.indexOf(c) < 0) seen.push(c); }
    return seen.sort().slice(0, 4);
  }
  function uses(spec, re) { var v = spec.v; if (spec.t === 'multi') return false; return re.test(str(Array.isArray(v) ? JSON.stringify(v) : v)); }
  function keysFor(spec, opts) {
    var t = spec.t, ks = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'], ops = [], vars = [];
    var form = spec.form || '';
    if (t === 'num') {
      if (form !== 'int') ops.push(form === 'frac' || form === 'mixed' ? 'frac' : 'dot');
      ops.push('neg');
      if (form === 'mixed' || form === 'simplest' || form === 'any' || !form) { if (form !== 'dec' && spec.dp === undefined && form !== 'int') { if (ops.indexOf('frac') < 0) ops.push('frac'); if (form === 'mixed' || form === 'simplest') ops.push('space'); } }
      if (uses(spec, /sqrt|\^\(?1\/2/)) ops.push('sqrt');
      if (uses(spec, /pi/)) ops.push('pi');
      if (uses(spec, /\^/)) ops.push('pow');
      if (uses(spec, /\bi\b/)) ops.push('i');
      if (spec.pct) ops.push('pct');
    } else if (t === 'expr' || t === 'eq') {
      vars = varsOf(spec);
      ops = ['plus', 'neg', 'times', 'frac', 'sq', 'pow', 'paren', 'sqrt', 'dot'];
      if (t === 'eq') ops.unshift('eq');
      if (uses(spec, /pi/)) ops.push('pi');
      if (uses(spec, /(^|[^a-z])e([^a-z]|$)|exp/)) ops.push('e');
      ['sin', 'cos', 'tan', 'ln', 'log'].forEach(function (f) { if (uses(spec, new RegExp('\\b' + f + '\\b'))) ops.push(f); });
      if (uses(spec, /abs|\|/)) ops.push('abs');
    } else if (t === 'set') {
      ops = ['comma', 'neg', 'frac', 'dot'];
      if (uses(spec, /sqrt/)) ops.push('sqrt', 'pm');
      if (uses(spec, /pi/)) ops.push('pi');
      if (uses(spec, /\bi\b/)) ops.push('i');
    } else if (t === 'interval') {
      ops = ['lp', 'lb', 'inf', 'rp', 'rb', 'comma', 'neg', 'cup', 'frac', 'dot'];
      if (uses(spec, /sqrt/)) ops.push('sqrt');
    } else if (t === 'ineq') {
      vars = varsOf(spec);
      ops = ['lt', 'gt', 'le', 'ge', 'neg', 'frac', 'dot', 'or'];
    } else if (t === 'tuple' || t === 'matrix') {
      ops = ['neg', 'frac', 'dot'];
      vars = t === 'tuple' && spec.vars ? [] : varsOf({ v: spec.v });
      if (uses(spec, /sqrt/)) ops.push('sqrt'); if (uses(spec, /pi/)) ops.push('pi');
      if (vars.length) ops.push('plus', 'times', 'pow', 'paren');
    } else return null;
    (opts.keys || []).forEach(function (k) { if (K[k] && ops.indexOf(k) < 0) ops.push(k); });
    return { digits: ks, ops: ops, vars: vars, nav: ['left', 'right', 'back', 'enter'] };
  }

  // ---------------------------------------------------------------- preview
  function previewTex(type, s, unit) { // unit: the problem's unit word, so "12 cookies" previews as 12 cookies
    s = str(s).trim(); if (!s) return '';
    if (/^(no( real)? solutions?|none|∅|empty( set)?|\{\s*\})$/i.test(s)) return '\\text{No solution}';
    if (/^(all real numbers?|all reals?|ℝ|all|infinitely many( solutions)?)$/i.test(s)) return '\\text{All real numbers}';
    if (/^(dne|does not exist)$/i.test(s)) return '\\text{Does not exist}';
    if (type === 'interval' || (type === 'ineq' && /^[\[(]/.test(s) && /[\])]$/.test(s))) return intervalTex(s);
    if (type === 'tuple') s = s.replace(/^\s*</, '⟨').replace(/>\s*$/, '⟩');
    if (/±|\+\s*\/\s*-/.test(s) || (type === 'set' && /\+\s*-/.test(s))) s = s.replace(/\+\s*\/\s*-/g, '±').replace(type === 'set' ? /\+\s*-/g : /$^/, '±');
    if (type === 'num' && /^[-+]?\s*\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return s.replace(/,/g, '{,}');   // 3,000
    // a number with a unit after it ("24 cm^2", "45°", "3,000 g"), alone or in a list: the unit shows as words, as the
    // checker reads it (not as letters multiplied together)
    if (type === 'num' || type === 'set' || type === 'tuple') {
      var u = unitTex(s, unit); if (u) return u;
      if (type !== 'num') { var parts = splitTopCommas(s); if (parts.length > 1 && parts.some(function (p) { return unitTex(p, unit); })) return parts.map(function (p) { return unitTex(p, unit) || pmTex(p); }).join(',\\ '); }
    }
    return pmTex(s);
  }
  function pmTex(s) { // ± anywhere, even inside brackets: (-1 ± sqrt(13))/2 -> \frac{-1 \pm \sqrt{13}}{2}
    if (s.indexOf('±') < 0) return ML.plainToTex(s);
    var t = ML.plainToTex(s.replace(/±/g, '+Z_pmmark*'));
    return t.replace(/\+\s*Z_\{pmmark\}\s*(\\cdot\s*)?/g, '\\pm ').replace(/Z_\{pmmark\}\s*(\\cdot\s*)?/g, '\\pm ');
  }
  function unitTex(p, unit) {
    var du = ML._check && ML._check.dropUnit ? ML._check.dropUnit(str(p).trim(), typeof unit === 'string' ? unit : null) : null; if (!du) return null;
    var u = du.unit.replace(/\s*\^\s*\(?\s*2\s*\)?/, '²').replace(/\s*\^\s*\(?\s*3\s*\)?/, '³').replace(/[\\{}$%#&_^~]/g, '');
    var num = /^[-+]?\s*\d{1,3}(,\d{3})+(\.\d+)?$/.test(str(p).trim().slice(0, str(p).trim().length - du.unit.length).trim()) ? du.s.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') : ML.plainToTex(du.s);
    return num + (u === '°' ? '^{\\circ}' : '\\,\\text{' + u + '}');
  }
  function splitTopCommas(s) { var out = [], d = 0, cur = ''; for (var i = 0; i < s.length; i++) { var c = s[i]; if ('([{⟨'.indexOf(c) >= 0) d++; else if (')]}⟩'.indexOf(c) >= 0) d--; if (c === ',' && !d) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out.filter(function (x) { return x.trim(); }); }
  function intervalTex(s) {
    return s.split(/\s*(?:∪|\bU\b|\bu\b|\bor\b)\s*/i).map(function (piece) {
      var m = /^([(\[])\s*(.*?)\s*,\s*(.*?)\s*([)\]])$/.exec(piece.trim());
      if (!m) { if (/^[(\[]/.test(piece.trim())) { var mm = /^([(\[])\s*(.*?)\s*(,\s*(.*))?$/.exec(piece.trim()); return mm[1] + end(mm[2]) + (mm[3] !== undefined ? ', ' + end(mm[4] || '') : ''); } throw new Error('keep typing'); }
      return m[1] + end(m[2]) + ', ' + end(m[3]) + m[4];
    }).join(' \\cup ');
    function end(e) { e = e.trim(); if (!e) return '\\;'; if (/^\+?(inf|infinity|∞|oo)$/i.test(e)) return '\\infty'; if (/^-\s*(inf|infinity|∞|oo)$/i.test(e)) return '-\\infty'; return ML.plainToTex(e); }
  }

  // ---------------------------------------------------------------- the widget
  ML.input = function (container, spec, opts) {
    opts = opts || {}; spec = spec || { t: 'num' };
    var id = 'mlin' + (++uid), t = spec.t;
    var wrap = h('div', 'ml-input ml-in-' + t, { 'data-type': t });
    var submitFns = [], changeFns = [], fields = [], active = null, disabled = false, api;
    function emitChange() { var v = api.value(); changeFns.forEach(function (f) { try { f(v); } catch (e) { } }); }
    var relaying = false;
    function submit(native) { // native: a real Enter keypress on a text box, which bubbles up to any page handler by itself
      if (disabled) return;
      var v = api.value(); submitFns.forEach(function (f) { try { f(v, !!native); } catch (e) { } });
      if (!submitFns.length && !native && !relaying && !opts._sub) { // keypad ↵ or Enter on a choice: tell a page that listens for Enter
        relaying = true;
        try { wrap.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true })); } catch (e) { }
        relaying = false;
      }
    }

    // ---- a text field with its own preview
    function textField(parent, ptype, label, placeholder, small) {
      var row = h('div', 'ml-in-field' + (small ? ' ml-in-small' : ''));
      var inp = h('input', 'ml-in-box', { type: 'text', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': label, placeholder: placeholder || '', enterkeyhint: 'done' });
      var pv = h('div', 'ml-in-preview', { 'aria-hidden': 'true' });
      row.appendChild(inp);
      if (opts.unit && !small && typeof opts.unit === 'string') { var un = h('span', 'ml-in-unit'); un.innerHTML = htmlOf(opts.unit, opts); row.appendChild(un); inp.setAttribute('aria-label', label + ' (in ' + opts.unit.replace(/\$|\\text\{|\}/g, '') + ')'); }
      if (ptype !== 'text') row.appendChild(pv);
      parent.appendChild(row);
      var f = { input: inp, preview: pv, type: ptype, row: row };
      function upd() {
        var v = inp.value;
        if (ptype === 'text') return;
        if (!v.trim() || /^\s*-?\s*\d*\.?\d*\s*$/.test(v)) { pv.innerHTML = ''; pv.className = 'ml-in-preview'; return; }
        try { var tex = previewTex(ptype, v, opts.unit); pv.innerHTML = tex ? ML.tex(tex, { display: false }) : ''; pv.className = 'ml-in-preview ml-in-ok'; }
        catch (e) { pv.className = 'ml-in-preview ml-in-wait'; if (!pv.querySelector('.ml-in-note')) { var n = h('span', 'ml-in-note', null, 'keep typing…'); pv.appendChild(n); } }
      }
      inp.addEventListener('input', function () { upd(); wrap.classList.remove('ml-right', 'ml-wrong'); emitChange(); });
      inp.addEventListener('focus', function () { active = f; });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submit(true); } });
      f.update = upd;
      fields.push(f); if (!active) active = f;
      return f;
    }

    var keypad = null, toggle = null, kset = null, preferNoKeyboard = false;
    function buildKeypad(where) {
      kset = keysFor(spec, opts); if (!kset || opts.keypad === false) return;
      var kpId = id + '-kp';
      toggle = h('button', 'ml-kp-toggle', { type: 'button', 'aria-expanded': 'false', 'aria-controls': kpId, title: 'Math keypad' });
      toggle.innerHTML = '<span aria-hidden="true">±√</span><span class="ml-sr">Math keypad</span>';
      keypad = h('div', 'ml-kp', { id: kpId, role: 'group', 'aria-label': 'Math keypad' }); keypad.hidden = true;
      var digits = h('div', 'ml-kp-digits'), ops = h('div', 'ml-kp-ops'), nav = h('div', 'ml-kp-nav');
      kset.digits.forEach(function (k) { digits.appendChild(keyBtn(k)); });
      kset.vars.forEach(function (v) { ops.appendChild(keyBtn(null, [v, v, 'variable ' + v, 'var'])); });
      kset.ops.forEach(function (k) { ops.appendChild(keyBtn(k)); });
      kset.nav.forEach(function (k) { nav.appendChild(keyBtn(k)); });
      keypad.appendChild(digits); keypad.appendChild(ops); keypad.appendChild(nav);
      where.appendChild(keypad);
      toggle.addEventListener('click', function () { setKeypad(keypad.hidden); });
      var open = opts.keypad === true || (opts.keypad !== false && coarse());
      preferNoKeyboard = coarse();
      setKeypad(open);
    }
    function setKeypad(open) {
      if (!keypad) return;
      keypad.hidden = !open; toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); toggle.classList.toggle('on', open);
      fields.forEach(function (f) { if (preferNoKeyboard && open) f.input.setAttribute('inputmode', 'none'); else f.input.removeAttribute('inputmode'); });
    }
    function keyBtn(name, def) {
      def = def || K[name];
      var b = h('button', 'ml-key' + (def[3] ? ' ml-key-' + def[3] : ''), { type: 'button', 'aria-label': def[2] || def[0], tabindex: '-1' }, def[0]);
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); });
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { press(def[1]); });
      return b;
    }
    function press(ins) {
      if (disabled) return;
      var f = active || fields[0]; if (!f) return;
      var inp = f.input, s = inp.value, a = inp.selectionStart == null ? s.length : inp.selectionStart, b = inp.selectionEnd == null ? s.length : inp.selectionEnd;
      if (typeof ins === 'object') {
        if (ins.enter) { submit(); return; }
        if (ins.move) { var p = Math.max(0, Math.min(s.length, (ins.move < 0 ? Math.min(a, b) : Math.max(a, b)) + (a === b ? ins.move : 0))); setCaret(inp, p); return; }
        if (ins.back) { if (a === b && a > 0) { inp.value = s.slice(0, a - 1) + s.slice(b); setCaret(inp, a - 1); } else if (a !== b) { inp.value = s.slice(0, a) + s.slice(b); setCaret(inp, a); } inp.dispatchEvent(new Event('input', { bubbles: true })); return; }
      }
      var text = String(ins), caret = text.indexOf('|'); text = text.replace('|', '');
      if (/^ /.test(text) && /\s$/.test(s.slice(0, a))) text = text.slice(1);
      inp.value = s.slice(0, a) + text + s.slice(b);
      setCaret(inp, a + (caret >= 0 ? caret : text.length));
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function setCaret(inp, p) { try { if (D.activeElement !== inp && !preferNoKeyboard) inp.focus({ preventScroll: true }); else if (D.activeElement !== inp) inp.focus({ preventScroll: true }); inp.setSelectionRange(p, p); } catch (e) { } }

    var PH = { num: spec.form === 'mixed' ? 'like 2 1/2' : spec.form === 'frac' ? 'like 3/4' : spec.form === 'dec' || spec.dp !== undefined ? 'like 0.75' : spec.form === 'int' ? 'a whole number' : 'Type a number',
      expr: 'like 2x + 3', eq: 'like y = 2x + 1', set: 'like 3, -2', interval: 'like (-inf, 3]', ineq: 'like x < 3', text: 'Type a word' };

    // ---- build by type
    if (t === 'mc' || t === 'tf') {
      var multiple = t === 'mc' && Array.isArray(spec.v);
      var choices = t === 'tf' ? ['True', 'False'] : (spec.choices || []);
      var group = h('div', 'ml-choices' + (t === 'tf' ? ' ml-tf' : ''), { role: multiple ? 'group' : 'radiogroup', 'aria-label': opts.label || (multiple ? 'Choose all that apply' : 'Choose one') });
      var picked = [];
      var btns = choices.map(function (c, i) {
        var b = h('button', 'ml-choice', { type: 'button', role: multiple ? 'checkbox' : 'radio', 'aria-checked': 'false', 'data-i': i });
        var mark = h('span', 'ml-choice-mark', { 'aria-hidden': 'true' }); var body = h('span', 'ml-choice-text');
        body.innerHTML = t === 'tf' ? c : htmlOf(c, opts);
        b.appendChild(mark); b.appendChild(body);
        b.addEventListener('click', function () { if (disabled) return; pick(i); });
        b.addEventListener('keydown', function (e) {
          var n = btns.length, k = e.key;
          if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); btns[(i + 1) % n].focus(); if (!multiple) pick((i + 1) % n, true); }
          else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); btns[(i - 1 + n) % n].focus(); if (!multiple) pick((i - 1 + n) % n, true); }
          else if (k === 'Enter') { e.preventDefault(); if (!multiple) { if (picked.indexOf(i) < 0) pick(i, true); submit(); } else if (picked.length) submit(); else pick(i); }
        });
        group.appendChild(b); return b;
      });
      if (multiple) group.appendChild(h('p', 'ml-choices-note', null, 'Choose all that apply.'));
      function pick(i, only) {
        if (multiple && !only) { var k = picked.indexOf(i); if (k >= 0) picked.splice(k, 1); else picked.push(i); }
        else picked = [i];
        btns.forEach(function (b, j) { var on = picked.indexOf(j) >= 0; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.classList.toggle('on', on); b.tabIndex = multiple || on || (!picked.length && j === 0) ? 0 : -1; });
        wrap.classList.remove('ml-right', 'ml-wrong'); emitChange();
      }
      btns.forEach(function (b, j) { b.tabIndex = multiple || j === 0 ? 0 : -1; });
      wrap.appendChild(group);
      api = {
        value: function () { if (t === 'tf') return picked.length ? picked[0] === 0 : null; return multiple ? picked.slice().sort(function (a, b) { return a - b; }) : (picked.length ? picked[0] : -1); },
        set: function (v) { picked = []; if (t === 'tf') { if (v === true || v === false) picked = [v ? 0 : 1]; } else if (Array.isArray(v)) picked = v.slice(); else if (v !== null && v !== undefined && v >= 0) picked = [Number(v)]; btns.forEach(function (b, j) { var on = picked.indexOf(j) >= 0; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.classList.toggle('on', on); }); },
        focus: function () { var b = btns[picked.length ? picked[0] : 0]; if (b) b.focus(); },
        isEmpty: function () { return !picked.length; },
        _btns: btns
      };
    } else if (t === 'tuple') {
      var n = spec.v ? spec.v.length : 2, labels = spec.labels || spec.vars || null;
      var tupleRow = h('div', 'ml-tuple', { role: 'group', 'aria-label': opts.label || 'Your answer' });
      tupleRow.appendChild(h('span', 'ml-tuple-br', { 'aria-hidden': 'true' }, '('));
      for (var ti = 0; ti < n; ti++) {
        if (ti) tupleRow.appendChild(h('span', 'ml-tuple-comma', { 'aria-hidden': 'true' }, ','));
        var cell = h('div', 'ml-tuple-cell');
        if (labels && labels[ti]) { var lab = h('span', 'ml-tuple-lab', { 'aria-hidden': 'true' }); lab.innerHTML = htmlOf(/\$/.test(labels[ti]) ? labels[ti] : '$' + labels[ti] + '$', opts); cell.appendChild(lab); }
        textField(cell, 'num', (labels && labels[ti] ? str(labels[ti]).replace(/\$/g, '') : ordinal(ti + 1) + ' entry') + ' of ' + n, '', true);
        tupleRow.appendChild(cell);
      }
      tupleRow.appendChild(h('span', 'ml-tuple-br', { 'aria-hidden': 'true' }, ')'));
      wrap.appendChild(tupleRow);
    } else if (t === 'matrix') {
      var rows = spec.v ? spec.v.length : 2, cols = spec.v ? spec.v[0].length : 2;
      var grid = h('div', 'ml-matrix', { role: 'group', 'aria-label': (opts.label || 'Your answer') + ': a ' + rows + ' by ' + cols + ' matrix' });
      grid.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(3.2rem, 5.5rem))';
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) textField(grid, 'num', 'row ' + (r + 1) + ', column ' + (c + 1), '', true);
      var mwrap = h('div', 'ml-matrix-wrap'); mwrap.appendChild(grid); wrap.appendChild(mwrap);
    } else if (t === 'multi') {
      var parts = spec.parts || [], subs = [];
      var list = h('div', 'ml-multi');
      parts.forEach(function (p, pi) {
        var prow = h('div', 'ml-multi-part');
        var lab = h('label', 'ml-multi-label', { 'for': id + '-p' + pi }); lab.innerHTML = htmlOf(str(p.label || 'Part ' + (pi + 1)), opts);
        var holder = h('div', 'ml-multi-box');
        prow.appendChild(lab); prow.appendChild(holder); list.appendChild(prow);
        var sub = ML.input(holder, p.a, Object.assign({}, opts, { keypad: false, label: str(p.label || 'Part ' + (pi + 1)).replace(/\$/g, '').replace(/\s*=\s*$/, '') || 'Part ' + (pi + 1), _sub: true }));
        var firstInp = sub.el.querySelector('input'); if (firstInp) firstInp.id = id + '-p' + pi;
        sub.onSubmit(function (v, nat) { submit(nat); });
        sub.onChange(function () { emitChange(); });
        (sub._fields || []).forEach(function (f) { f.input.addEventListener('focus', function () { active = f; }); fields.push(f); });
        subs.push(sub);
      });
      wrap.appendChild(list);
      if (!active && fields.length) active = fields[0];
      api = {
        value: function () { return subs.map(function (s) { return s.value(); }); },
        set: function (v) { (v || []).forEach(function (x, i) { if (subs[i]) subs[i].set(x); }); },
        focus: function () { if (subs[0]) subs[0].focus(); },
        isEmpty: function () { return subs.every(function (s) { return s.isEmpty(); }); },
        _subs: subs
      };
      // a shared keypad built from the parts' needs
      var pseudo = { t: 'expr', v: parts.map(function (p) { return p.a && p.a.v !== undefined ? (Array.isArray(p.a.v) ? p.a.v.join(' ') : str(p.a.v)) : ''; }).join(' '), vars: [] };
      if (parts.every(function (p) { return p.a && (p.a.t === 'num' || p.a.t === 'set' || p.a.t === 'tuple'); })) pseudo.t = 'num';
      if (parts.some(function (p) { return p.a && (p.a.t === 'ineq'); })) pseudo.t = 'ineq';
      var savedSpec = spec; spec = pseudo;
      var kpHolder = h('div', 'ml-in-tools'); wrap.appendChild(kpHolder);
      buildKeypad(kpHolder); if (toggle) kpHolder.insertBefore(toggle, kpHolder.firstChild);
      spec = savedSpec;
    } else {
      // single text box: num expr eq set interval ineq text
      var box = h('div', 'ml-in-main');
      var f0 = textField(box, t, opts.label || 'Your answer', opts.placeholder || PH[t] || '');
      wrap.appendChild(box);
      if (t === 'set' || t === 'interval' || t === 'ineq') {
        var chips = h('div', 'ml-in-chips');
        [['No solution', 'no solution'], ['All real numbers', 'all real numbers']].forEach(function (pair) {
          var b = h('button', 'ml-chip', { type: 'button', 'aria-pressed': 'false' }, pair[0]);
          b.addEventListener('click', function () { if (disabled) return; var on = f0.input.value.trim().toLowerCase() === pair[1]; f0.input.value = on ? '' : pair[1]; f0.input.dispatchEvent(new Event('input', { bubbles: true })); });
          chips.appendChild(b);
        });
        f0.input.addEventListener('input', function () { [].forEach.call(chips.children, function (b) { var on = f0.input.value.trim().toLowerCase() === b.textContent.toLowerCase(); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('on', on); }); });
        box.appendChild(chips);
      }
    }
    // keypad for the text-entry types (multi builds its own)
    if (t !== 'mc' && t !== 'tf' && t !== 'multi' && t !== 'text' && !opts._sub) {
      var tools = h('div', 'ml-in-tools');
      wrap.appendChild(tools);
      buildKeypad(tools);
      if (toggle) { var mainRow = wrap.querySelector('.ml-in-field'); if (t === 'num' || t === 'expr' || t === 'eq' || t === 'set' || t === 'interval' || t === 'ineq') mainRow.insertBefore(toggle, mainRow.querySelector('.ml-in-preview')); else tools.insertBefore(toggle, tools.firstChild); }
    }

    if (!api) {
      api = {
        value: function () {
          if (t === 'tuple') return fields.map(function (f) { return f.input.value; });
          if (t === 'matrix') { var cols2 = spec.v ? spec.v[0].length : 2, out = []; fields.forEach(function (f, i) { if (i % cols2 === 0) out.push([]); out[out.length - 1].push(f.input.value); }); return out; }
          return fields[0] ? fields[0].input.value : '';
        },
        set: function (v) {
          if (t === 'tuple') (v || []).forEach(function (x, i) { if (fields[i]) fields[i].input.value = str(x); });
          else if (t === 'matrix') { var flat = [].concat.apply([], v || []); flat.forEach(function (x, i) { if (fields[i]) fields[i].input.value = str(x); }); }
          else if (fields[0]) fields[0].input.value = str(v);
          fields.forEach(function (f) { f.update(); f.input.dispatchEvent(new Event('input', { bubbles: true })); });
        },
        focus: function () { if (fields[0]) fields[0].input.focus(); },
        isEmpty: function () { return fields.every(function (f) { return !f.input.value.trim(); }); }
      };
    }
    api.el = wrap;
    api._fields = fields;
    api.clear = function () {
      if (api._subs) api._subs.forEach(function (s) { s.clear(); });
      else if (api._btns) api.set(null);
      else fields.forEach(function (f) { f.input.value = ''; f.update(); });
      wrap.classList.remove('ml-right', 'ml-wrong'); emitChange();
    };
    api.disable = function () {
      disabled = true; wrap.classList.add('ml-disabled');
      [].forEach.call(wrap.querySelectorAll('input,button'), function (e) { if (!e.classList.contains('ml-kp-toggle')) e.disabled = true; });
      if (api._subs) api._subs.forEach(function (s) { s.disable(); });
    };
    api.enable = function () {
      disabled = false; wrap.classList.remove('ml-disabled');
      [].forEach.call(wrap.querySelectorAll('input,button'), function (e) { e.disabled = false; });
      if (api._subs) api._subs.forEach(function (s) { s.enable(); });
    };
    api.mark = function (res) { // show a check result: .ml-right / .ml-wrong on the box (and on each part of a multi)
      wrap.classList.remove('ml-right', 'ml-wrong');
      if (!res) { if (api._subs) api._subs.forEach(function (s) { s.mark(null); }); return; }
      if (!res.invalid || res.ok) wrap.classList.add(res.ok ? 'ml-right' : 'ml-wrong');
      if (api._subs && res.parts) { wrap.classList.remove('ml-right', 'ml-wrong'); api._subs.forEach(function (s, i) { s.mark(res.parts[i]); }); if (res.ok) wrap.classList.add('ml-right'); }
    };
    api.onSubmit = function (fn) { submitFns.push(fn); return api; };
    api.onChange = function (fn) { changeFns.push(fn); return api; };
    api.keypad = function (open) { setKeypad(open === undefined ? keypad && keypad.hidden : !!open); };
    api.destroy = function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); submitFns = []; changeFns = []; };

    if (container) container.appendChild(wrap);
    if (opts.autofocus) setTimeout(function () { try { api.focus(); } catch (e) { } }, 0);
    return api;
  };
  function ordinal(n) { return n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th'); }
})(typeof window !== 'undefined' ? window : globalThis);
