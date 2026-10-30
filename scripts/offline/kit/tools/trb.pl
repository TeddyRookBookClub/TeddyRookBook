#!/usr/bin/perl
# Teddy Rook Book download kit, for Mac and Linux. Uses only what comes with the computer: Perl, curl and unzip.
#
#   perl trb.pl serve            serve the copy in ../site at http://localhost:8317 and open the browser
#   perl trb.pl update           choose sections, then download what is new or changed
#   perl trb.pl update --add math,homeschool --remove music --yes
#   perl trb.pl list             list the sections and what is saved
#
# How updates work: the website publishes a list of every file in each section with a short fingerprint
# (/offline/manifests/). The kit keeps the lists it last used in site/.trb/. An update fetches the new lists,
# compares, and downloads only files whose fingerprint changed, then deletes files no longer used.
# New sections come as one zip from the GitHub release when there is one (faster), and are then brought up to date.
use strict; use warnings;
use FindBin qw($Bin);
use File::Path qw(make_path);
use File::Basename qw(dirname);
use File::Temp qw(tempfile tempdir);
use IO::Socket::INET;
use JSON::PP;
use Digest::SHA qw(sha256_hex);
use Encode qw(decode encode);

my $KIT     = dirname($Bin);
my $SITEDIR = $ENV{TRB_DIR}     || "$KIT/site";
my $SITE    = $ENV{TRB_SITE}    || 'https://teddyrookbook.com';
my $RELEASE = $ENV{TRB_RELEASE} || 'https://github.com/TeddyRookBookClub/TeddyRookBook/releases/download/offline';
my $PORT    = $ENV{TRB_PORT}    || 8317;
$SITE =~ s{/+$}{}; $RELEASE =~ s{/+$}{};
my $META = "$SITEDIR/.trb";
my $J = JSON::PP->new->utf8->canonical;
$| = 1;


# ---------------------------------------------------------------- helpers
sub mb { my $n = shift || 0; return sprintf($n < 10485760 ? '%.1f MB' : '%.0f MB', $n / 1048576); }
sub slurp { my $f = shift; open(my $h, '<:raw', $f) or return undef; local $/; my $d = <$h>; close $h; return $d; }
sub spit { my ($f, $d) = @_; make_path(dirname($f)); open(my $h, '>:raw', "$f.tmp") or die "Cannot write $f: $!\n"; print $h $d; close $h; rename("$f.tmp", $f) or die "Cannot write $f: $!\n"; }
sub enc_path { my $p = shift; $p = encode('UTF-8', decode('UTF-8', $p)); $p =~ s{([^A-Za-z0-9\-._~/])}{sprintf('%%%02X', ord $1)}ge; return $p; }
sub curl_get {   # returns body or undef
  my ($url) = @_;
  my $out = `curl -fsSL --retry 2 --connect-timeout 20 -H "Cache-Control: no-cache" "$url" 2>/dev/null`;
  return $? == 0 ? $out : undef;
}
# The same fingerprint as scripts/offline/build-manifests.js: SHA-256 of the file with the "?v=123456" numbers and the
# copyright year blanked (they change on every build without changing anything that matters), first 12 hex digits.
sub fingerprint {
  my ($path, $data) = @_;
  if ($path =~ /\.(html?|css|js|mjs|json|xml|txt|svg|csv|md)$/i) {
    my $s = decode('UTF-8', $data);
    $s =~ s/\?v=\d{6,}/?v=/g;
    $s =~ s/(&copy;|\x{a9})(\s*)(?:19|20)\d\d/$1$2/g;
    $data = encode('UTF-8', $s);
  }
  return substr(sha256_hex($data), 0, 12);
}

sub get_index {
  my $raw = curl_get("$SITE/offline/manifests/index.json") or die "Could not reach $SITE. Check the internet connection and try again.\n";
  return $J->decode($raw);
}
sub load_state { my $d = slurp("$META/state.json"); return $d ? $J->decode($d) : { sections => {} }; }
sub saved_manifest { my $d = slurp("$META/m/$_[0].json"); return $d ? $J->decode($d) : undef; }

sub show_list {
  my ($ix, $st) = @_;
  my $n = 0; my @order;
  for my $g (@{ $ix->{groups} }) {
    print "\n  $g->{name}\n";
    for my $id (@{ $g->{items} }) {
      my $s = $ix->{sections}{$id};
      my $dup = grep { $_ eq $id } @order;
      push @order, $id unless $dup;
      my $num = $dup ? '  ' : sprintf('%2d', scalar @order);
      my $mark = $st->{sections}{$id} ? '[saved]' : '       ';
      my $title = encode('UTF-8', $s->{title});
      if ($s->{online}) { printf "   %s  %s %-36s %s\n", '  ', '       ', $title, 'online only'; next; }
      printf "   %s  %s %-36s %9s%s\n", $num, $mark, $title, mb($s->{bytes}), $dup ? '  (listed above)' : '';
    }
  }
  print "\n  Site basics (always included): " . mb($ix->{core}{bytes}) . "\n";
  return @order;
}

# ---------------------------------------------------------------- update
sub update {
  my @args = @_;
  my (%add, %rm, $yes, $all);
  while (@args) {
    my $a = shift @args;
    if ($a eq '--add') { $add{$_} = 1 for split /,/, (shift(@args) || ''); }
    elsif ($a eq '--remove') { $rm{$_} = 1 for split /,/, (shift(@args) || ''); }
    elsif ($a eq '--all') { $all = 1; }
    elsif ($a eq '--yes' || $a eq '-y') { $yes = 1; }
  }
  print "Teddy Rook Book: get or update sections\nChecking $SITE ...\n";
  my $ix = get_index();
  my $st = load_state();
  my %want = map { $_ => 1 } grep { $_ ne 'core' } keys %{ $st->{sections} };
  if (!%add && !%rm && !$all && !$yes && -t STDIN) {
    my @order = show_list($ix, $st);
    print "\nType the numbers of sections to add or remove (for example: 2 5 11), 'all' for everything,\n",
          "or just press Enter to update what you have: ";
    my $line = <STDIN>; $line = '' unless defined $line; chomp $line;
    if ($line =~ /^\s*all\s*$/i) { $all = 1; }
    else { for my $n ($line =~ /(\d+)/g) { my $id = $order[$n - 1] or next; if ($want{$id}) { $rm{$id} = 1 } else { $add{$id} = 1 } } }
  }
  if ($all) { $add{$_} = 1 for grep { !$ix->{sections}{$_}{online} } keys %{ $ix->{sections} }; }
  for (keys %add) { die "No section called '$_'. Run: perl trb.pl list\n" unless $ix->{sections}{$_}; }
  $want{$_} = 1 for grep { !$ix->{sections}{$_}{online} } keys %add;
  delete $want{$_} for keys %rm;
  delete $want{$_} for grep { !$ix->{sections}{$_} || $ix->{sections}{$_}{online} } keys %want;
  my @want = sort keys %want;
  unshift @want, 'core' if @want;
  if (!@want && !%{ $st->{sections} }) { print "Nothing chosen, so nothing to do.\n"; return; }

  # New sections: start from the release zip when there is one.
  my $tmp = tempdir(CLEANUP => 1);
  for my $id (@want) {
    next if $st->{sections}{$id};
    print "Getting the zip for " . ($id eq 'core' ? 'the site basics' : encode('UTF-8', $ix->{sections}{$id}{title})) . " ... ";
    my $zip = "$tmp/$id.zip";
    system('curl', '-fsSL', '--retry', '2', '-o', $zip, "$RELEASE/trb-$id.zip");
    if ($? == 0 && -s $zip) {
      make_path($SITEDIR);
      system('unzip', '-qn', $zip, '-d', $SITEDIR);   # -n: never replace a file that is already here (it may be newer)
      if ($? == 0 && -f "$SITEDIR/.trb/zip/$id.json") {
        make_path("$META/m"); rename("$SITEDIR/.trb/zip/$id.json", "$META/m/$id.json");
        $st->{sections}{$id} = { hash => 'zip' };
        print "done.\n"; unlink $zip; next;
      }
    }
    print "no zip, so the files come one by one.\n"; unlink $zip;
  }

  # Compare what is here with what the site lists now.
  my (%old, %new, %man);
  for my $id (keys %{ $st->{sections} }) {   # where two lists disagree about a shared file, fetch it again to be sure
    my $m = saved_manifest($id) or next;
    for (@{ $m->{files} }) { $old{ $_->[0] } = (defined $old{ $_->[0] } && $old{ $_->[0] } ne $_->[2]) ? 'x' : $_->[2]; }
  }
  for my $id (@want) {
    my $info = $id eq 'core' ? $ix->{core} : $ix->{sections}{$id};
    my $m = saved_manifest($id);
    if (!$m || $m->{hash} ne $info->{hash}) {
      my $raw = curl_get("$SITE/offline/manifests/$id.json?h=$info->{hash}") or die "Could not download the file list for $id. Try again later.\n";
      $m = $J->decode($raw);
    }
    $man{$id} = $m; $new{ $_->[0] } = $_ for @{ $m->{files} };
  }
  my (@get, @drop, $bytes);
  for my $p (sort keys %new) { my $f = $new{$p}; if (!defined $old{$p} || $old{$p} ne $f->[2] || !-e "$SITEDIR/$p") { push @get, $f; $bytes += $f->[1]; } }
  for my $p (sort keys %old) { push @drop, $p unless $new{$p}; }
  if (!@get && !@drop) { print "Everything is up to date.\n"; save_state($st, \%man, $ix); return; }
  printf "To download: %s in %d file%s. To remove: %d file%s.\n", mb($bytes), scalar @get, @get == 1 ? '' : 's', scalar @drop, @drop == 1 ? '' : 's';
  if (!$yes && -t STDIN && ($bytes || 0) > 200 * 1048576) { print "That is a lot. Go ahead? [Y/n] "; my $a = <STDIN>; return if defined $a && $a =~ /^\s*n/i; }

  # Download, many files per curl run (one connection, reused).
  my (@failed, @recheck);
  my $done = 0;
  while (my @batch = splice(@get, 0, 200)) {
    my ($fh, $cfg) = tempfile(DIR => $tmp);
    for my $f (@batch) {
      my $out = "$SITEDIR/$f->[0]"; $out =~ s/"/\\"/g;
      print $fh 'url = "' . $SITE . '/' . enc_path($f->[0]) . "\"\noutput = \"$out.part\"\n";
    }
    close $fh;
    system('curl', '-sSL', '--fail', '--retry', '2', '--create-dirs', '-H', 'Cache-Control: no-cache', '-K', $cfg);
    for my $f (@batch) {
      my $p = "$SITEDIR/$f->[0]"; my $d = slurp("$p.part");
      if (defined $d && fingerprint($f->[0], $d) eq $f->[2]) { rename("$p.part", $p); }
      elsif (defined $d && length $d) { rename("$p.part", $p); push @recheck, $f->[0]; } # changed on the site since its list was made: keep it, check again next time
      else { unlink "$p.part"; push @failed, $f->[0]; }
      $done += $f->[1];
    }
    printf "  %s of %s\n", mb($done), mb($bytes);
  }
  for my $p (@drop) { unlink "$SITEDIR/$p"; }
  # remove folders left empty
  my %dirs; for my $p (@drop) { my $d = dirname("$SITEDIR/$p"); while (length $d > length $SITEDIR) { $dirs{$d} = 1; $d = dirname($d); } }
  rmdir $_ for sort { length $b <=> length $a } keys %dirs;

  if (@failed || @recheck) {   # keep these marked as not yet downloaded so the next run tries them again
    my %f = map { $_ => 1 } @failed, @recheck;
    for my $m (values %man) { $_->[2] = 'missing' for grep { $f{ $_->[0] } } @{ $m->{files} }; $m->{hash} = 'partial'; }
    printf "%d file%s could not be downloaded. Run the update again later to finish.\n", scalar @failed, @failed == 1 ? '' : 's' if @failed;
  }
  save_state($st, \%man, $ix);
  print @failed ? "Done, except for those files.\n" : "Done. Everything is up to date.\n";
}

sub save_state {
  my ($st, $man, $ix) = @_;
  make_path("$META/m");
  for my $id (keys %{ $st->{sections} }) { unlink "$META/m/$id.json" unless $man->{$id}; }
  my %s = map { $_ => { hash => $man->{$_}{hash}, bytes => $man->{$_}{bytes}, title => ($_ eq 'core' ? 'Site basics' : $ix->{sections}{$_}{title}) } } keys %$man;
  spit("$META/m/$_.json", $J->encode($man->{$_})) for keys %$man;
  spit("$META/state.json", $J->encode({ v => 1, site => $SITE, updated => time, sections => \%s }));
}

# ---------------------------------------------------------------- local web server
my %TYPES = (html => 'text/html; charset=utf-8', htm => 'text/html; charset=utf-8', css => 'text/css; charset=utf-8', js => 'text/javascript; charset=utf-8',
  mjs => 'text/javascript; charset=utf-8', json => 'application/json; charset=utf-8', xml => 'application/xml; charset=utf-8', txt => 'text/plain; charset=utf-8',
  svg => 'image/svg+xml', png => 'image/png', jpg => 'image/jpeg', jpeg => 'image/jpeg', gif => 'image/gif', webp => 'image/webp', ico => 'image/x-icon',
  pdf => 'application/pdf', mp3 => 'audio/mpeg', m4a => 'audio/mp4', ogg => 'audio/ogg', wav => 'audio/wav', mp4 => 'video/mp4', webm => 'video/webm',
  woff => 'font/woff', woff2 => 'font/woff2', ttf => 'font/ttf', wasm => 'application/wasm', webmanifest => 'application/manifest+json', csv => 'text/csv; charset=utf-8');

sub serve {
  if (!-f "$SITEDIR/index.html") {
    print "No sections are saved yet. Let's choose some first.\n";
    update();
    die "Nothing was saved, so there is nothing to show yet.\n" unless -f "$SITEDIR/index.html";
  }
  my $srv = IO::Socket::INET->new(LocalAddr => '127.0.0.1', LocalPort => $PORT, Listen => 20, ReuseAddr => 1, Proto => 'tcp');
  my $url = "http://localhost:$PORT/";
  if (!$srv) { print "Teddy Rook Book seems to be running already. Opening $url\n"; open_browser($url); return; }
  print "Teddy Rook Book is running at $url\nKeep this window open while you use it. Close it (or press Ctrl+C) to stop.\n";
  open_browser($url) unless $ENV{TRB_NO_BROWSER};
  $SIG{PIPE} = 'IGNORE';
  while (my $c = $srv->accept) {
    eval { handle($c) };
    close $c;
  }
}
sub open_browser { my $u = shift; if ($^O eq 'darwin') { system('open', $u) } else { system("xdg-open '$u' >/dev/null 2>&1 &") } }

sub handle {
  my $c = shift;
  local $/ = "\r\n";
  my $req = <$c>; return unless defined $req;
  my ($method, $target) = $req =~ m{^(\S+)\s+(\S+)};
  while (my $h = <$c>) { last if $h eq "\r\n" || $h eq "\n"; }
  return unless $method && $target;
  if ($method ne 'GET' && $method ne 'HEAD') { reply($c, 405, 'text/plain', 'Method not allowed', $method); return; }
  my $p = $target; $p =~ s/[?#].*//; $p =~ s/%([0-9A-Fa-f]{2})/chr(hex $1)/ge;
  if ($p =~ m{(^|/)\.\.(/|$)} || $p =~ m{^/\.trb}) { reply($c, 404, 'text/plain', 'Not found', $method); return; }
  my $f = "$SITEDIR$p";
  if (-d $f) {
    if ($p !~ m{/$}) { print $c "HTTP/1.1 301 Moved\r\nLocation: $p/\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"; return; }
    $f .= 'index.html';
  }
  my $code = 200;
  if (!-f $f) { $code = 404; $f = "$SITEDIR/404.html"; }
  my $data = slurp($f); $data = 'Not found' unless defined $data;
  my ($ext) = $f =~ /\.([A-Za-z0-9]+)$/; $ext = lc($ext || '');
  my $type = $TYPES{$ext} || 'application/octet-stream';
  # Links in the pages point at the website; point them here instead.
  if ($type =~ /^text|json|xml|svg|manifest/) { $data =~ s{https?://(?:www\.)?teddyrookbook\.com/?}{/}g; $data =~ s{\Q$SITE\E/?}{/}g; }
  reply($c, $code, $type, $data, $method);
}
sub reply {
  my ($c, $code, $type, $data, $method) = @_;
  my %msg = (200 => 'OK', 404 => 'Not Found', 405 => 'Method Not Allowed');
  print $c "HTTP/1.1 $code $msg{$code}\r\nContent-Type: $type\r\nContent-Length: " . length($data) . "\r\nCache-Control: no-cache\r\nConnection: close\r\n\r\n";
  print $c $data unless $method eq 'HEAD';
}

# ---------------------------------------------------------------- main (last, so the tables above are filled in first)
my $cmd = shift(@ARGV) || 'serve';
if ($cmd eq 'serve') { serve(); }
elsif ($cmd eq 'update') { update(@ARGV); }
elsif ($cmd eq 'list') { my $ix = get_index(); show_list($ix, load_state()); }
else { die "Unknown command: $cmd (use serve, update or list)\n"; }
exit 0;
