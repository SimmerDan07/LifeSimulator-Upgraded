import sys, os, re, glob
clean, smali = sys.argv[1], sys.argv[2]
def smali_val(v, t):
    v=v.strip()
    if t=="D" or t=="F":
        return v.rstrip("fF")
    if t in ("I","J","S","B"):
        neg = v.startswith("-"); v=v.lstrip("-").rstrip("L").rstrip("t").rstrip("s")
        n = int(v,16) if v.startswith("0x") else int(v)
        return str(-n if neg else n)
    if t=="Z": return v
    return v  # string literal already quoted
patched=0; left=[]
for f in glob.glob(os.path.join(clean,"**","*.java"), recursive=True):
    s=open(f).read()
    selfs = re.findall(r"static final [\w.<>\[\]]+ (\w+) = \1;", s)
    if not selfs: continue
    rel = os.path.relpath(f, clean)[:-5]  # e.g. Utils/Constants
    vals={}
    for sf in glob.glob(os.path.join(smali,"classes*",rel+".smali"))+glob.glob(os.path.join(smali,"classes*",rel+"$*.smali")):
        for m in re.finditer(r"\.field [^:\n]*?static final (\w+):(\S+) = (.+)", open(sf).read()):
            vals.setdefault(m.group(1), smali_val(m.group(3), m.group(2)))
    def rep(m):
        global patched
        name=m.group(1)
        if name in vals: patched+=1; return m.group(0)[:-len(name)-1]+vals[name]+";"
        left.append((rel,name)); return m.group(0)
    s=re.sub(r"static final [\w.<>\[\]]+ (\w+) = \1;", rep, s)
    # remove duplicate declarations produced by jadx (same line twice)
    lines=s.split("\n"); out=[]
    for i,l in enumerate(lines):
        if out and l.strip().startswith("private static final") and l==out[-1]: continue
        out.append(l)
    open(f,"w").write("\n".join(out))
print("patched",patched,"left",left[:20])
