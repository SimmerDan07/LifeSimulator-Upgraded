import sys, os, re, glob
import xml.etree.ElementTree as ET
clean, pubxml = sys.argv[1], sys.argv[2]
ids = {}
for p in ET.parse(pubxml).getroot().iter("public"):
    ids[int(p.get("id"), 16)] = (p.get("type"), p.get("name"))
n = 0; miss = set()
def rep(m):
    global n
    v = int(m.group(0), 0)
    if v in ids:
        n += 1
        t, name = ids[v]
        return f"R.{t}.{name}"
    if v != 2147483647: miss.add(m.group(0))
    return m.group(0)
for f in glob.glob(os.path.join(clean, "**", "*.java"), recursive=True):
    s = open(f).read()
    s2 = re.sub(r"(?<![\w.])(?:21[34]\d{7}|0x7f[0-9a-fA-F]{6})(?![\w.])", rep, s)
    if s2 != s: open(f, "w").write(s2)
print("restored", n, "resource refs; unmatched", sorted(miss)[:10])
