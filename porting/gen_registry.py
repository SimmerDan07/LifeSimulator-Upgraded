import os, re, sys
root = sys.argv[1]
mods = []
for d, _, fs in os.walk(root):
    for f in fs:
        if f.endswith(".ts") and f != "registry.ts" and not d.endswith("ui") and "runtime" not in d and "save" not in d:
            mods.append(os.path.relpath(os.path.join(d, f), root)[:-3])
mods.sort()
print("// AUTO-GENERATED: every class the save system may need to rebuild.")
print('import * as RT from "./runtime";')
for i, m in enumerate(mods):
    print(f'import * as M{i} from "./{m}";')
print("export const CLASSES: Record<string, any> = Object.assign({},")
print("    { ArrayList: RT.ArrayList, HashMap: RT.HashMap, HashSet: RT.HashSet, Pair: RT.Pair, Triple: RT.Triple, BigInteger: RT.BigInteger, SpannableStringBuilder: RT.SpannableStringBuilder },")
for i, m in enumerate(mods):
    print(f"    M{i},")
print(");")
