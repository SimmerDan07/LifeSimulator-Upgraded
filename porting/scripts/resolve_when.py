"""Resolve Kotlin WhenMappings ordinal tables in jadx output into real enum constants.

Each usage is matched to the WhenMappings block declared in the innermost enclosing
scope (or the explicitly prefixed class), mirroring Java name resolution.
"""
import sys, os, re

root = sys.argv[1]
smali_root = sys.argv[2]
import glob
SMALI = {}  # "Enums/RandomEvent$Companion" -> {N: {k: "Enum.CONST"}}
for sf in glob.glob(os.path.join(smali_root, "classes*", "**", "*$WhenMappings.smali"), recursive=True):
    cls = re.search(r"^\.class .*?L(.+?)\$WhenMappings;", open(sf).read(), re.M).group(1)
    regs = {}; tables = {}
    for line in open(sf):
        line = line.strip()
        m = re.match(r"sget-object (\w+), L[^;]+;->\$EnumSwitchMapping\$(\d+):\[I", line)
        if m: regs[m.group(1)] = ("T", m.group(2)); continue
        m = re.match(r"sget-object (\w+), L([^;]+);->(\w+):L", line)
        if m: regs[m.group(1)] = ("E", m.group(2).split("/")[-1].split("$")[-1] + "." + m.group(3)); continue
        m = re.match(r"invoke-virtual \{(\w+)\}, .*->ordinal\(\)I", line)
        if m: last = regs.get(m.group(1)); continue
        m = re.match(r"move-result (\w+)", line)
        if m: regs[m.group(1)] = last; continue
        m = re.match(r"const(?:/4|/16)? (\w+), (-?0x[0-9a-f]+|-?\d+)", line)
        if m: regs[m.group(1)] = ("I", str(int(m.group(2), 0))); continue
        m = re.match(r"aput (\w+), (\w+), (\w+)", line)
        if m:
            v, t, e = regs.get(m.group(1)), regs.get(m.group(2)), regs.get(m.group(3))
            if v and t and e and v[0] == "I" and t[0] == "T" and e[0] == "E":
                tables.setdefault(t[1], {})[v[1]] = e[1]
    SMALI[cls] = tables
pat_map = re.compile(r"\$EnumSwitchMapping\$(\d+)\[([\w.$]+?)\.(\w+)\.ordinal\(\)\] = (\d+);")
WM_DECL = re.compile(r"class WhenMappings \{")
ORD = r"\[(?:([^\[\]]*?)\.)?ordinal\(\)\]"
PREFIX = r"(?:([\w.]+)\.)?WhenMappings\.\$EnumSwitchMapping\$(\d+)"


def match_brace(s, i):
    """s[i] == '{' -> index after matching '}'"""
    depth = 0
    while i < len(s):
        c = s[i]
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0: return i + 1
        elif c == '"':
            i += 1
            while s[i] != '"':
                if s[i] == "\\": i += 1
                i += 1
        i += 1
    return len(s)


def parent_scope(s, pos):
    depth = 0; i = pos - 1
    while i >= 0:
        c = s[i]
        if c == "}": depth += 1
        elif c == "{":
            if depth == 0: return i, match_brace(s, i)
            depth -= 1
        i -= 1
    return 0, len(s)


def parent_name(s, start):
    m = list(re.finditer(r"\b(?:class|enum|interface)\s+(\w+)[^{;]*$", s[:start][-400:]))
    return m[-1].group(1) if m else None


files = [os.path.join(d, f) for d, _, fs in os.walk(root) for f in fs if f.endswith(".java")]
texts = {f: open(f).read() for f in files}
blocks = {}       # file -> list of (scope_start, scope_end, owner_name, {N: {k: const}})
global_by_owner = {}
missing_smali = []
for f, s in texts.items():
    bl = []
    for wm in WM_DECL.finditer(s):
        bstart = s.index("{", wm.start()); bend = match_brace(s, bstart)
        ps, pe = parent_scope(s, wm.start())
        owner = parent_name(s, ps)
        chain = []; q = wm.start()
        while True:
            a, b = parent_scope(s, q)
            if a == 0 and b == len(s): break
            nm = parent_name(s, a)
            if nm: chain.append(nm)
            q = a
        rel = os.path.relpath(f, root)[:-5]
        pkgdir = os.path.dirname(rel)
        cls = (pkgdir + "/" if pkgdir else "") + "$".join(reversed(chain))
        tables = {}
        for m in pat_map.finditer(s[bstart:bend]):
            n, enum, const, k = m.groups()
            tables.setdefault(n, {})[k] = f"{enum.split('.')[-1].split('$')[-1]}.{const}"
        for n, t in SMALI.get(cls, {}).items():
            tables[n] = t
        if cls not in SMALI: missing_smali.append(cls)
        bl.append((ps, pe, owner, tables))
        global_by_owner.setdefault(owner, tables)
    blocks[f] = bl


def current_spans(s):
    out = []
    for wm in WM_DECL.finditer(s):
        out.append(parent_scope(s, wm.start()))
    return out


def lookup(f, pos, prefix, n, s=None):
    if s is not None:
        spans = current_spans(s)
        blocks[f] = [(a, b, o, t) for (a, b), (_, _, o, t) in zip(spans, blocks[f])]
    if prefix:
        owner = prefix.split(".")[-1]
        for ps, pe, o, t in blocks[f]:
            if o == owner and n in t: return t[n]
        return global_by_owner.get(owner, {}).get(n, {})
    best = None
    for ps, pe, o, t in blocks[f]:
        if ps <= pos < pe and n in t and (best is None or pe - ps < best[1] - best[0]):
            best = (ps, pe, t)
    return best[2][n] if best else {}


stats = {"switch": 0, "decl": 0, "inline": 0, "unresolved": []}

SW = re.compile(r"switch \(" + PREFIX + ORD + r"\) \{")
DECL = re.compile(r"int (\w+) = " + PREFIX + ORD + ";")
ASSIGN = re.compile(r"\((\w+) = " + PREFIX + ORD + r"\) (==|!=) (\d+)")
INL = re.compile(PREFIX + ORD + r" (==|!=) (\d+)")


def const(mp, k):
    return mp.get(k, "UNKNOWN_" + k)


def replace_cases(body, mp):
    out = []; dep = 0; j = 0
    while j < len(body):
        c = body[j]
        if c == "{": dep += 1
        elif c == "}": dep -= 1
        if dep == 0 and body.startswith("case ", j):
            mm = re.match(r"case (\d+):", body[j:])
            if mm:
                out.append(f"case {const(mp, mm.group(1))}:"); j += mm.end(); continue
        out.append(c); j += 1
    return "".join(out)


for f in files:
    s = texts[f]
    # positions shift as we edit, so process one match at a time from the end
    for rx, kind in ((SW, "switch"), (DECL, "decl"), (ASSIGN, "assign"), (INL, "inline")):
        while True:
            ms = list(rx.finditer(s))
            if not ms: break
            m = ms[-1]
            if kind == "switch":
                prefix, n, expr = m.groups(); expr = expr or "this"
                mp = lookup(f, m.start(), prefix, n, s)
                bstart = m.end() - 1; bend = match_brace(s, bstart)
                body = replace_cases(s[bstart + 1:bend - 1], mp)
                s = s[:m.start()] + f"switch ({expr}) {{" + body + "}" + s[bend:]
                stats["switch"] += 1
            elif kind == "decl":
                var, prefix, n, expr = m.groups(); expr = expr or "this"
                mp = lookup(f, m.start(), prefix, n, s)
                etype = next(iter(mp.values())).split(".")[0] if mp else "Object"
                ps, pe = parent_scope(s, m.start())
                scope = s[m.end():pe - 1]
                scope = re.sub(rf"\b{var} (==|!=) (\d+)\b", lambda x: f"{var} {x.group(1)} {const(mp, x.group(2))}", scope)
                for sm in list(re.finditer(rf"switch \({var}\) \{{", scope))[::-1]:
                    bs = sm.end() - 1; be = match_brace(scope, bs)
                    scope = scope[:bs + 1] + replace_cases(scope[bs + 1:be - 1], mp) + scope[be - 1:]
                s = s[:m.start()] + f"{etype} {var} = {expr};" + scope + s[pe - 1:]
                stats["decl"] += 1
            elif kind == "assign":
                var, prefix, n, expr, op, k = m.groups(); expr = expr or "this"
                mp = lookup(f, m.start(), prefix, n, s)
                # (i = X) == 1 || i == 2 ...  -> keep var holding the enum
                ps, pe = parent_scope(s, m.start())
                tail = s[m.end():pe - 1]
                stmt_end = tail.find(";")
                seg = re.sub(rf"\b{var} (==|!=) (\d+)\b", lambda x: f"{var} {x.group(1)} {const(mp, x.group(2))}", tail[:stmt_end])
                s = s[:m.start()] + f"({var} = {expr}) {op} {const(mp, k)}" + seg + tail[stmt_end:] + s[pe - 1:]
                stats["inline"] += 1
            else:
                prefix, n, expr, op, k = m.groups(); expr = expr or "this"
                mp = lookup(f, m.start(), prefix, n, s)
                s = s[:m.start()] + f"{expr} {op} {const(mp, k)}" + s[m.end():]
                stats["inline"] += 1
    # drop WhenMappings classes
    while True:
        wm = re.search(r"\n\s*public final /\* synthetic \*/ class WhenMappings \{", s)
        if not wm: break
        s = s[:wm.start()] + s[match_brace(s, s.index("{", wm.start())):]
    s = re.sub(r"\n{3,}", "\n\n", s)
    texts[f] = s
    open(f, "w").write(s)

left = [(os.path.relpath(f, root), l.strip()[:90]) for f in files for l in texts[f].split("\n") if "EnumSwitchMapping" in l or "UNKNOWN_" in l]
print(stats["switch"], "switch,", stats["decl"], "decl,", stats["inline"], "inline")
print("smali classes", len(SMALI), "unmatched blocks", missing_smali[:10])
print("left:", len(left))
for x in left[:15]: print("  ", x)
