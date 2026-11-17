import sys, os, re
src, dst = sys.argv[1], sys.argv[2]
pk = ["Adapters","Components","Controllers","Enums","Fragments","Managers","Models","Utils","misc","service"]
tot_in=tot_out=0
for p in pk:
    for root,_,files in os.walk(os.path.join(src,p)):
        for f in files:
            if not f.endswith(".java") or "$$serializer" in f: continue
            s=open(os.path.join(root,f),encoding="utf-8").read()
            tot_in+=s.count("\n")
            s=re.sub(r"^import .*\n","",s,flags=re.M)
            s=re.sub(r"^package .*\n","",s,flags=re.M)
            s=re.sub(r"@Metadata\(.*?\)\n","",s,flags=re.S)
            s=re.sub(r"^\s*/\* (compiled from|loaded from): .*\*/\n","",s,flags=re.M)
            s=re.sub(r"^\s*Intrinsics\.check(Parameter|Expression)Value(Is)?NotNull\(.*\);\n","",s,flags=re.M)
            s=re.sub(r"^\s*@(Override|NotNull|Nullable|JvmStatic)\b.*\n","",s,flags=re.M)
            # drop write$Self & synthetic serialization ctor bodies
            s=re.sub(r"\n    public static final void write\$Self\(.*?\n    }\n","\n",s,flags=re.S)
            s=re.sub(r"\n    @Deprecated\(.*?\n    }\n","\n",s,flags=re.S)
            s=re.sub(r"\n    public /\* synthetic \*/ \w+\(int i,[^\n]*SerializationConstructorMarker.*?\n    }\n","\n",s,flags=re.S)
            s=re.sub(r"\n\s*/\* renamed from: .*?\*/","",s)
            s=re.sub(r"\n{3,}","\n\n",s)
            out=os.path.join(dst,p,os.path.relpath(os.path.join(root,f),os.path.join(src,p)))
            os.makedirs(os.path.dirname(out),exist_ok=True)
            open(out,"w").write(s); tot_out+=s.count("\n")
print(tot_in, "->", tot_out)
