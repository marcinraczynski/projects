#!/usr/bin/env python3
"""Wstawia twarde spacje (&nbsp;) po krótkich polskich słowach w tekście HTML.
Użycie: python3 tools/sieroty.py index.html [en/index.html]
Działa w miejscu i jest idempotentny. Pomija <script>, <style>, <template>-y nie, atrybuty i komentarze."""
import re, sys
WORDS = r"a|i|o|u|w|z|we|ze|od|do|na|po|się|nie|że|A|I|O|U|W|Z|We|Ze|Od|Do|Na|Po|Nie|Że"
RX = re.compile(r"(?<![\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ&;])(" + WORDS + r") (?=\S)")
def fix_text(t):
    prev = None
    while prev != t:
        prev, t = t, RX.sub(r"\1&nbsp;", t)
    return t
def run(path):
    src = open(path, encoding="utf-8").read()
    out, i = [], 0
    for m in re.finditer(r"<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->|<[^>]+>", src, re.S):
        out.append(fix_text(src[i:m.start()])); out.append(m.group(0)); i = m.end()
    out.append(fix_text(src[i:]))
    open(path, "w", encoding="utf-8").write("".join(out))
for p in sys.argv[1:]: run(p)
