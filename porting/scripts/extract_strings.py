import sys, json, os, re, html
import xml.etree.ElementTree as ET
res, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def clean(s):
    if s is None: return ""
    s = s.strip()
    if len(s)>=2 and s[0]=='"' and s[-1]=='"': s=s[1:-1]
    s = s.replace("\\'", "'").replace('\\"','"').replace("\\n","\n").replace("\\@","@").replace("\\?","?")
    return s
def text_of(el):
    # include inner markup text (e.g. <b>, <xliff:g>)
    return "".join(el.itertext())
langs = {}
for d in sorted(os.listdir(res)):
    if not (d=="values" or re.fullmatch(r"values-[a-z]{2}(-r[A-Z]{2})?", d)): continue
    p = os.path.join(res, d, "strings.xml")
    if not os.path.exists(p): continue
    code = "default" if d=="values" else d[7:]
    tree = ET.parse(p)
    data = {e.get("name"): clean(text_of(e)) for e in tree.getroot().iter("string")}
    langs[code]=len(data)
    with open(os.path.join(out, f"{code}.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1, sort_keys=True)
print(json.dumps(langs, indent=0))
