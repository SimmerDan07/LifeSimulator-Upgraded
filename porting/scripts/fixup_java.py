import sys, os, re, glob
root = sys.argv[1]
def match_brace(s, i):
    d = 0
    while i < len(s):
        if s[i] == "{": d += 1
        elif s[i] == "}":
            d -= 1
            if d == 0: return i + 1
        elif s[i] == '"':
            i += 1
            while s[i] != '"':
                if s[i] == "\\": i += 1
                i += 1
        i += 1
    return len(s)
def remove_blocks(s, rx):
    while True:
        m = re.search(rx, s)
        if not m: return s
        b = s.index("{", m.start()); e = match_brace(s, b)
        s = s[:m.start()] + s[e:]
n = 0
for f in glob.glob(os.path.join(root, "**", "*.java"), recursive=True):
    s = open(f).read(); o = s
    s = remove_blocks(s, r"\n[ \t]*(?:/\*[^\n]*\*/\s*)*public int hashCode\(\) \{")
    s = remove_blocks(s, r"\n[ \t]*public static final class \$serializer[^{]*\{")
    s = remove_blocks(s, r"\n[ \t]*public /\* synthetic \*/ \w+\(int i,[^)]*SerializationConstructorMarker[^)]*\) \{")
    s = remove_blocks(s, r"\n[ \t]*public final KSerializer<\w+> serializer\(\) \{")
    s = re.sub(r"\?\? (\w+) =", r"Object \1 =", s)
    if s != o: open(f, "w").write(s); n += 1
print("fixed", n, "files")
