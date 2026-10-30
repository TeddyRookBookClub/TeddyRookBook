# Teddy Rook Book download kit, for Windows. Uses only what comes with Windows 10 and 11 (PowerShell).
#
#   trb.ps1 serve            serve the copy in ..\site at http://localhost:8317 and open the browser
#   trb.ps1 update           choose sections, then download what is new or changed
#   trb.ps1 update --add math,homeschool --remove music --yes   (or -Add, -Remove, -Yes)
#   trb.ps1 list             list the sections and what is saved
#
# How updates work: the website publishes a list of every file in each section with a short fingerprint
# (/offline/manifests/). The kit keeps the lists it last used in site\.trb\. An update fetches the new lists,
# compares, and downloads only files whose fingerprint changed, then deletes files no longer used.
# New sections come as one zip from the GitHub release when there is one (faster), and are then brought up to date.
# Options may be written -Add or --add (the Mac and Linux spelling); section names are separated by commas or spaces.
$Command = 'serve'; $Add = @(); $Remove = @(); $All = $false; $Yes = $false
for ($i = 0; $i -lt $args.Count; $i++) {
  $a = [string]$args[$i]
  switch -regex ($a) {
    '^--?add$' { $i++; $Add += @($args[$i]); break }
    '^--?remove$' { $i++; $Remove += @($args[$i]); break }
    '^--?all$' { $All = $true; break }
    '^(--?yes|-y)$' { $Yes = $true; break }
    '^-' { Write-Host "Unknown option: $a"; exit 1 }
    default { $Command = $a }
  }
}
$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch { }

$Kit = Split-Path -Parent $PSScriptRoot
$SiteDir = if ($env:TRB_DIR) { $env:TRB_DIR } else { Join-Path $Kit 'site' }
$Site = if ($env:TRB_SITE) { $env:TRB_SITE } else { 'https://teddyrookbook.com' }
$Release = if ($env:TRB_RELEASE) { $env:TRB_RELEASE } else { 'https://github.com/TeddyRookBookClub/TeddyRookBook/releases/download/offline' }
$Port = if ($env:TRB_PORT) { [int]$env:TRB_PORT } else { 8317 }
$Site = $Site.TrimEnd('/'); $Release = $Release.TrimEnd('/')
$Meta = Join-Path $SiteDir '.trb'
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$Add = @($Add | ForEach-Object { [string]$_ -split '[,\s]+' } | Where-Object { $_ })
$Remove = @($Remove | ForEach-Object { [string]$_ -split '[,\s]+' } | Where-Object { $_ })

# ---------------------------------------------------------------- helpers
function MB([double]$n) { if ($n -lt 10485760) { '{0:0.0} MB' -f ($n / 1048576) } else { '{0:0} MB' -f ($n / 1048576) } }
function Get-Web([string]$url) {
  $wc = New-Object System.Net.WebClient; $wc.Headers.Add('Cache-Control', 'no-cache'); $wc.Encoding = $Utf8
  for ($i = 0; $i -lt 3; $i++) { try { return $wc.DownloadString($url) } catch { Start-Sleep -Milliseconds 500 } }
  return $null
}
function Read-Json([string]$file) { if (Test-Path -LiteralPath $file) { return [IO.File]::ReadAllText($file, $Utf8) | ConvertFrom-Json } return $null }
function Write-Text([string]$file, [string]$text) {
  $d = Split-Path -Parent $file; if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  [IO.File]::WriteAllText("$file.tmp", $text, $Utf8); Move-Item -LiteralPath "$file.tmp" -Destination $file -Force
}
$Sep = [IO.Path]::DirectorySeparatorChar
function Local-Path([string]$p) { return Join-Path $SiteDir ($p -replace '/', $Sep) }
function Enc-Path([string]$p) { return (($p -split '/') | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/' }
# The same fingerprint as scripts/offline/build-manifests.js: SHA-256 of the file with the "?v=123456" numbers and the
# copyright year blanked (they change on every build without changing anything that matters), first 12 hex digits.
$Sha = [Security.Cryptography.SHA256]::Create()
function Fingerprint([string]$path, [byte[]]$data) {
  if ($path -match '\.(html?|css|js|mjs|json|xml|txt|svg|csv|md)$') {
    $s = $Utf8.GetString($data)
    $s = [regex]::Replace($s, '\?v=\d{6,}', '?v=')
    $s = [regex]::Replace($s, '(&copy;|©)(\s*)(?:19|20)\d\d', '$1$2')
    $data = $Utf8.GetBytes($s)
  }
  return (-join ($Sha.ComputeHash($data) | ForEach-Object { $_.ToString('x2') })).Substring(0, 12)
}
function Get-Index {
  $raw = Get-Web "$Site/offline/manifests/index.json"
  if (-not $raw) { throw "Could not reach $Site. Check the internet connection and try again." }
  return $raw | ConvertFrom-Json
}
function Load-State { $s = Read-Json (Join-Path $Meta 'state.json'); if ($s) { return $s } return [pscustomobject]@{ sections = [pscustomobject]@{} } }
function Saved-Manifest([string]$id) { return Read-Json (Join-Path (Join-Path $Meta 'm') "$id.json") }
function Has([object]$obj, [string]$name) { return $null -ne $obj -and ($obj.PSObject.Properties.Name -contains $name) }
function Sec($ix, [string]$id) { return $ix.sections.PSObject.Properties[$id].Value }

function Show-List($ix, $st) {
  $order = New-Object System.Collections.ArrayList
  foreach ($g in $ix.groups) {
    Write-Host ''; Write-Host "  $($g.name)"
    foreach ($id in $g.items) {
      $s = Sec $ix $id; $dup = $order.Contains($id)
      if (-not $dup) { [void]$order.Add($id) }
      if (Has $s 'online') { Write-Host ('       {0,-7} {1,-36} online only' -f '', $s.title); continue }
      $num = if ($dup) { '  ' } else { '{0,2}' -f $order.Count }
      $mark = if (Has $st.sections $id) { '[saved]' } else { '' }
      $more = if ($dup) { '  (listed above)' } else { '' }
      Write-Host ('   {0}  {1,-7} {2,-36} {3,9}{4}' -f $num, $mark, $s.title, (MB $s.bytes), $more)
    }
  }
  Write-Host ''; Write-Host "  Site basics (always included): $(MB $ix.core.bytes)"
  return , $order
}

# ---------------------------------------------------------------- update
function Do-Update {
  Write-Host "Teddy Rook Book: get or update sections"; Write-Host "Checking $Site ..."
  $ix = Get-Index; $st = Load-State
  $want = @{}; foreach ($p in $st.sections.PSObject.Properties) { if ($p.Name -ne 'core') { $want[$p.Name] = 1 } }
  $addSet = @{}; $rmSet = @{}; foreach ($x in $script:Add) { $addSet[$x] = 1 }; foreach ($x in $script:Remove) { $rmSet[$x] = 1 }
  $doAll = [bool]$script:All
  if ($addSet.Count -eq 0 -and $rmSet.Count -eq 0 -and -not $doAll -and -not $script:Yes -and [Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
    $order = Show-List $ix $st
    Write-Host ''; Write-Host "Type the numbers of sections to add or remove (for example: 2 5 11), 'all' for everything,"
    $line = Read-Host "or just press Enter to update what you have"
    if ($line -match '^\s*all\s*$') { $doAll = $true }
    else { foreach ($m in [regex]::Matches([string]$line, '\d+')) { $n = [int]$m.Value; if ($n -ge 1 -and $n -le $order.Count) { $id = $order[$n - 1]; if ($want.ContainsKey($id)) { $rmSet[$id] = 1 } else { $addSet[$id] = 1 } } } }
  }
  if ($doAll) { foreach ($p in $ix.sections.PSObject.Properties) { if (-not (Has $p.Value 'online')) { $addSet[$p.Name] = 1 } } }
  foreach ($id in @($addSet.Keys)) { if (-not (Has $ix.sections $id)) { throw "No section called '$id'. Run: trb.ps1 list" }; if (-not (Has (Sec $ix $id) 'online')) { $want[$id] = 1 } }
  foreach ($id in @($rmSet.Keys)) { $want.Remove($id) }
  foreach ($id in @($want.Keys)) { if (-not (Has $ix.sections $id) -or (Has (Sec $ix $id) 'online')) { $want.Remove($id) } }
  $wantList = @($want.Keys | Sort-Object); if ($wantList.Count) { $wantList = @('core') + $wantList }
  if (-not $wantList.Count -and -not @($st.sections.PSObject.Properties).Count) { Write-Host 'Nothing chosen, so nothing to do.'; return }

  # New sections: start from the release zip when there is one.
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ('trb-' + [guid]::NewGuid().ToString('N')); New-Item -ItemType Directory -Path $tmp | Out-Null
  $isNew = @{}
  try {
    foreach ($id in $wantList) {
      if (Has $st.sections $id) { continue }
      $name = if ($id -eq 'core') { 'the site basics' } else { (Sec $ix $id).title }
      Write-Host -NoNewline "Getting the zip for $name ... "
      $zip = Join-Path $tmp "$id.zip"; $ok = $false
      try { (New-Object System.Net.WebClient).DownloadFile("$Release/trb-$id.zip", $zip); $ok = $true } catch { }
      if ($ok) {
        $x = Join-Path $tmp "x-$id"
        try { Expand-Archive -LiteralPath $zip -DestinationPath $x -Force } catch { $ok = $false }
        $zm = Join-Path (Join-Path (Join-Path $x '.trb') 'zip') "$id.json"
        if ($ok -and (Test-Path -LiteralPath $zm)) {
          # copy in, but never replace a file that is already here (it may be newer)
          Get-ChildItem -LiteralPath $x -Recurse -File -Force | Where-Object { $_.FullName.Substring($x.Length + 1) -notmatch '^\.trb[\\/]' } | ForEach-Object {
            $dest = Join-Path $SiteDir $_.FullName.Substring($x.Length + 1)
            if (-not (Test-Path -LiteralPath $dest)) { $dd = Split-Path -Parent $dest; if (-not (Test-Path -LiteralPath $dd)) { New-Item -ItemType Directory -Path $dd -Force | Out-Null }; Move-Item -LiteralPath $_.FullName -Destination $dest }
          }
          $md = Join-Path $Meta 'm'; if (-not (Test-Path -LiteralPath $md)) { New-Item -ItemType Directory -Path $md -Force | Out-Null }
          Copy-Item -LiteralPath $zm -Destination (Join-Path $md "$id.json") -Force
          $isNew[$id] = 1
          Write-Host 'done.'; Remove-Item -LiteralPath $x -Recurse -Force; continue
        }
      }
      Write-Host 'no zip, so the files come one by one.'
    }

    # Compare what is here with what the site lists now.
    $old = @{}; $new = @{}; $man = @{}
    $have = @($st.sections.PSObject.Properties | ForEach-Object { $_.Name }) + @($isNew.Keys)
    foreach ($id in $have) {   # where two lists disagree about a shared file, fetch it again to be sure
      $m = Saved-Manifest $id; if (-not $m) { continue }
      foreach ($f in $m.files) { $p = $f[0]; if ($old.ContainsKey($p) -and $old[$p] -ne $f[2]) { $old[$p] = 'x' } else { $old[$p] = $f[2] } }
    }
    foreach ($id in $wantList) {
      $info = if ($id -eq 'core') { $ix.core } else { Sec $ix $id }
      $m = Saved-Manifest $id
      if (-not $m -or $m.hash -ne $info.hash) {
        $raw = Get-Web "$Site/offline/manifests/$id.json?h=$($info.hash)"
        if (-not $raw) { throw "Could not download the file list for $id. Try again later." }
        $m = $raw | ConvertFrom-Json
      }
      $man[$id] = $m; foreach ($f in $m.files) { $new[$f[0]] = $f }
    }
    $get = New-Object System.Collections.ArrayList; $drop = New-Object System.Collections.ArrayList; [double]$bytes = 0
    foreach ($p in ($new.Keys | Sort-Object)) { $f = $new[$p]; if (-not $old.ContainsKey($p) -or $old[$p] -ne $f[2] -or -not (Test-Path -LiteralPath (Local-Path $p))) { [void]$get.Add($f); $bytes += $f[1] } }
    foreach ($p in ($old.Keys | Sort-Object)) { if (-not $new.ContainsKey($p)) { [void]$drop.Add($p) } }
    if (-not $get.Count -and -not $drop.Count) { Write-Host 'Everything is up to date.'; Save-State $man $ix; return }
    Write-Host ('To download: {0} in {1} files. To remove: {2} files.' -f (MB $bytes), $get.Count, $drop.Count)

    # Download, one connection reused.
    $wc = New-Object System.Net.WebClient
    $failed = @{}; [double]$done = 0; $i = 0
    foreach ($f in $get) {
      $p = $f[0]; $dest = Local-Path $p; $dd = Split-Path -Parent $dest
      if (-not (Test-Path -LiteralPath $dd)) { New-Item -ItemType Directory -Path $dd -Force | Out-Null }
      $data = $null
      for ($t = 0; $t -lt 3 -and $null -eq $data; $t++) { try { $wc.Headers['Cache-Control'] = 'no-cache'; $data = $wc.DownloadData("$Site/" + (Enc-Path $p)) } catch { Start-Sleep -Milliseconds 300 } }
      if ($null -eq $data) { $failed[$p] = 1 }
      else {
        [IO.File]::WriteAllBytes($dest, $data)
        if ((Fingerprint $p $data) -ne $f[2]) { $failed[$p] = 2 }   # changed on the site since its list was made: keep it, check again next time
      }
      $done += $f[1]; $i++
      if ($i % 200 -eq 0 -or $i -eq $get.Count) { Write-Host ('  {0} of {1}' -f (MB $done), (MB $bytes)) }
    }
    foreach ($p in $drop) { $lp = Local-Path $p; if (Test-Path -LiteralPath $lp) { Remove-Item -LiteralPath $lp -Force } }
    if ($failed.Count) {   # keep these marked as not yet downloaded so the next run tries them again
      foreach ($m in $man.Values) { $m.hash = 'partial'; foreach ($f in $m.files) { if ($failed.ContainsKey($f[0])) { $f[2] = 'missing' } } }
      $miss = @($failed.Values | Where-Object { $_ -eq 1 }).Count
      if ($miss) { Write-Host "$miss files could not be downloaded. Run the update again later to finish." }
    }
    Save-State $man $ix
    Write-Host 'Done.'
  } finally { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}

function Save-State($man, $ix) {
  $md = Join-Path $Meta 'm'; if (-not (Test-Path -LiteralPath $md)) { New-Item -ItemType Directory -Path $md -Force | Out-Null }
  Get-ChildItem -LiteralPath $md -Filter '*.json' | Where-Object { -not $man.ContainsKey($_.BaseName) } | Remove-Item -Force
  $secs = [ordered]@{}
  foreach ($id in ($man.Keys | Sort-Object)) {
    $m = $man[$id]
    Write-Text (Join-Path $md "$id.json") ($m | ConvertTo-Json -Depth 5 -Compress)
    $t = if ($id -eq 'core') { 'Site basics' } else { (Sec $ix $id).title }
    $secs[$id] = [ordered]@{ hash = $m.hash; bytes = $m.bytes; title = $t }
  }
  Write-Text (Join-Path $Meta 'state.json') ([ordered]@{ v = 1; site = $Site; updated = [int][double]::Parse((Get-Date -UFormat %s)); sections = $secs } | ConvertTo-Json -Depth 5 -Compress)
}

# ---------------------------------------------------------------- local web server
$Types = @{ html = 'text/html; charset=utf-8'; htm = 'text/html; charset=utf-8'; css = 'text/css; charset=utf-8'; js = 'text/javascript; charset=utf-8'; mjs = 'text/javascript; charset=utf-8';
  json = 'application/json; charset=utf-8'; xml = 'application/xml; charset=utf-8'; txt = 'text/plain; charset=utf-8'; svg = 'image/svg+xml'; png = 'image/png'; jpg = 'image/jpeg'; jpeg = 'image/jpeg';
  gif = 'image/gif'; webp = 'image/webp'; ico = 'image/x-icon'; pdf = 'application/pdf'; mp3 = 'audio/mpeg'; m4a = 'audio/mp4'; ogg = 'audio/ogg'; wav = 'audio/wav'; mp4 = 'video/mp4'; webm = 'video/webm';
  woff = 'font/woff'; woff2 = 'font/woff2'; ttf = 'font/ttf'; wasm = 'application/wasm'; webmanifest = 'application/manifest+json'; csv = 'text/csv; charset=utf-8' }

function Send($stream, [int]$code, [string]$type, [byte[]]$body, [bool]$head, [string]$extra) {
  $msg = @{ 200 = 'OK'; 301 = 'Moved'; 404 = 'Not Found'; 405 = 'Method Not Allowed' }[$code]
  $h = "HTTP/1.1 $code $msg`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n$extra`r`n"
  $hb = [Text.Encoding]::ASCII.GetBytes($h); $stream.Write($hb, 0, $hb.Length)
  if (-not $head -and $body.Length) { $stream.Write($body, 0, $body.Length) }
}
function Handle($client) {
  $stream = $client.GetStream(); $stream.ReadTimeout = 5000
  $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 8192, $true)
  $req = $reader.ReadLine(); if (-not $req) { return }
  while ($true) { $l = $reader.ReadLine(); if ($null -eq $l -or $l -eq '') { break } }
  $parts = $req -split ' '; $method = $parts[0]; $target = $parts[1]; $head = ($method -eq 'HEAD')
  if ($method -ne 'GET' -and -not $head) { Send $stream 405 'text/plain' ([Text.Encoding]::ASCII.GetBytes('Method not allowed')) $false ''; return }
  $p = ($target -split '[?#]')[0]; $p = [Uri]::UnescapeDataString($p)
  if ($p -match '(^|/)\.\.(/|$)' -or $p -match '^/\.trb' -or $p -match '[:\\]') { Send $stream 404 'text/plain' ([Text.Encoding]::ASCII.GetBytes('Not found')) $head ''; return }
  $f = Join-Path $SiteDir ($p.TrimStart('/') -replace '/', $Sep)
  if (Test-Path -LiteralPath $f -PathType Container) {
    if (-not $p.EndsWith('/')) { Send $stream 301 'text/plain' (New-Object byte[] 0) $head "Location: $p/`r`n"; return }
    $f = Join-Path $f 'index.html'
  }
  $code = 200
  if (-not (Test-Path -LiteralPath $f -PathType Leaf)) { $code = 404; $f = Join-Path $SiteDir '404.html' }
  $ext = [IO.Path]::GetExtension($f).TrimStart('.').ToLower()
  $type = $Types[$ext]; if (-not $type) { $type = 'application/octet-stream' }
  $body = if (Test-Path -LiteralPath $f) { [IO.File]::ReadAllBytes($f) } else { [Text.Encoding]::ASCII.GetBytes('Not found') }
  if ($type -match '^text|json|xml|svg|manifest') {   # links in the pages point at the website; point them here instead
    $body = $Utf8.GetBytes([regex]::Replace($Utf8.GetString($body), 'https?://(?:www\.)?teddyrookbook\.com/?|' + [regex]::Escape($Site) + '/?', '/'))
  }
  Send $stream $code $type $body $head ''
}
function Serve {
  if (-not (Test-Path -LiteralPath (Join-Path $SiteDir 'index.html'))) {
    Write-Host "No sections are saved yet. Let's choose some first."
    Do-Update
    if (-not (Test-Path -LiteralPath (Join-Path $SiteDir 'index.html'))) { Write-Host 'Nothing was saved, so there is nothing to show yet.'; return }
  }
  $url = "http://localhost:$Port/"
  $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $Port)
  try { $listener.Start() } catch { Write-Host "Teddy Rook Book seems to be running already. Opening $url"; Start-Process $url; return }
  Write-Host "Teddy Rook Book is running at $url"; Write-Host 'Keep this window open while you use it. Close it to stop.'
  if (-not $env:TRB_NO_BROWSER) { Start-Process $url }
  try {
    while ($true) {
      $c = $listener.AcceptTcpClient()
      try { Handle $c } catch { } finally { $c.Close() }
    }
  } finally { $listener.Stop() }
}

switch ($Command) {
  'serve' { Serve }
  'update' { Do-Update }
  'list' { $ix = Get-Index; [void](Show-List $ix (Load-State)) }
  default { Write-Host "Unknown command: $Command (use serve, update or list)" }
}
