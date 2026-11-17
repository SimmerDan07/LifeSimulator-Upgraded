"""Translate jadx-decompiled (Kotlin-origin) Java into TypeScript.

Design:
  * One TS module per Java file, same relative path.
  * Nested classes -> TS namespaces merged with the outer class (Outer.Inner works
    as both value and type). Static initializers of classes that own nested classes
    are deferred until after the namespace so nested classes exist.
  * Enums -> classes extending JEnum with static readonly constants.
  * Kotlin `object`s / companions keep their `INSTANCE` pattern unchanged.
  * Overloaded methods / constructors -> renamed impls + runtime arity/type dispatcher.
  * Java/Kotlin library calls are kept and served by a runtime shim (src/runtime).
"""
import sys, os, re, json
import javalang
from javalang import tree as T
sys.path.insert(0, os.path.dirname(__file__))
import jparse
from jparse import Parenthesized

PKGS = {"Enums", "Managers", "Models", "Controllers", "Utils", "misc", "Fragments", "Components", "Adapters", "service"}

INT_TYPES = {"int", "long", "short", "byte", "Integer", "Long", "Short", "Byte", "char"}
FLOAT_TYPES = {"double", "float", "Double", "Float"}
NUM_TYPES = INT_TYPES | FLOAT_TYPES | {"Number"}

# Runtime-provided names (src/runtime/index.ts exports)
RUNTIME = {
    "JEnum", "BigInteger", "ArrayList", "HashMap", "HashSet", "Pair", "Triple", "Intrinsics", "Unit",
    "CollectionsKt", "ArraysKt", "MapsKt", "SetsKt", "TuplesKt", "StringsKt", "MathKt", "RangesKt",
    "ComparisonsKt", "Ref", "JMath", "Integer", "Double", "Long", "Float", "Boolean", "JString",
    "StringBuilder", "SpannableStringBuilder", "SpannableString", "System", "R", "Function0", "Function1",
    "Function2", "Function3", "Comparator", "Iterator", "Map", "Collection", "Arrays", "Collections",
    "NoWhenBranchMatchedException", "TypeCastException", "IllegalStateException", "IllegalArgumentException",
    "RuntimeException", "Exception", "NullPointerException", "KotlinNothingValueException",
    "IndexOutOfBoundsException", "UnsupportedOperationException", "Character", "Log", "Random",
    "KotlinRandom", "UUID", "Calendar", "Date", "TimeUnit", "Typeface", "Color", "Html", "Spanned",
    "ForegroundColorSpan", "StyleSpan", "RelativeSizeSpan", "AbsoluteSizeSpan", "CustomTypefaceSpan", "ImageSpan",
    "LocalBroadcastManager", "Intent", "Bundle", "Context", "Uri", "Toast", "BigDecimal", "RoundingMode",
    "DecimalFormat", "NumberFormat", "Locale", "TextUtils", "Build", "MediaPlayer", "Handler", "Looper",
    "Entry", "LinkedHashMap", "MutableList", "List", "Set", "Iterable", "Sequence", "SequencesKt",
    "CharsKt", "ArrayIteratorKt", "Ranges", "IntRange", "Charsets", "Regex", "Object", "Number",
    "ActivityCompat", "ContextCompat", "StringCompanionObject", "Buglife", "TypeIntrinsics", "Layout", "ResourcesCompat", "DisplayMetrics", "Resources",
}

TYPE_MAP = {
    "int": "number", "long": "number", "short": "number", "byte": "number", "float": "number",
    "double": "number", "Integer": "number", "Long": "number", "Short": "number", "Byte": "number",
    "Float": "number", "Double": "number", "Number": "number", "char": "string", "Character": "string",
    "boolean": "boolean", "Boolean": "boolean", "String": "string", "CharSequence": "any",
    "Object": "any", "void": "void", "Unit": "any", "Void": "any",
    "List": "ArrayList", "MutableList": "ArrayList", "Collection": "ArrayList", "Iterable": "ArrayList",
    "Map": "HashMap", "LinkedHashMap": "HashMap", "MutableMap": "HashMap", "Set": "HashSet", "MutableSet": "HashSet",
    "Spannable": "SpannableStringBuilder", "StringCompanionObject": "any", "Iterator": "any", "ListIterator": "any", "Spanned": "any", "SpannedString": "any",
}
ANDROID_ANY = {"Context", "View", "ViewGroup", "Activity", "Fragment", "Intent", "Bundle", "Drawable",
               "Bitmap", "Uri", "Typeface", "LayoutInflater", "RecyclerView", "TextView", "ImageView",
               "Dialog", "AlertDialog", "SharedPreferences", "Resources", "Application", "Activity",
               "NavController", "NavDirections", "KSerializer", "SerialDescriptor", "Decoder", "Encoder",
               "CompositeEncoder", "CompositeDecoder", "ImageButton", "Button", "MainApplication",
               "MainGameActivity", "BaseActivity", "Toast", "Handler", "MediaPlayer", "SoundPool",
               "GoogleSignInAccount", "BillingClient", "Purchase", "SkuDetails", "RewardedAd", "FirebaseAnalytics",
               "Animator", "ValueAnimator", "Spanned", "SerializationConstructorMarker", "DefaultConstructorMarker",
               "Json", "JsonConfiguration", "File", "InputStream", "OutputStream", "BufferedReader",
               "FileInputStream", "FileOutputStream", "InputStreamReader", "Exception", "Throwable"}


class Registry:
    renamed_fields = set()
    def __init__(self):
        self.classes = {}      # "Pkg/Outer$Inner" -> ClassInfo
        self.by_simple = {}    # simple top-level name -> key
        self.enum_consts = {}  # const -> set(enum keys)
        self.method_rets = {}  # method name -> set(return type names)
        self.field_types = {}  # field name -> set(type names)


class ClassInfo:
    def __init__(self, key, node, module, outer):
        self.key = key; self.node = node; self.module = module; self.outer = outer
        self.name = key.split("/")[-1].split("$")[-1]
        self.kind = {"ClassDeclaration": "class", "EnumDeclaration": "enum",
                     "InterfaceDeclaration": "interface"}.get(type(node).__name__, "class")
        self.fields = {}; self.static_fields = set(); self.methods = {}; self.static_methods = set()
        self.nested = {}; self.consts = []
        self.extends = None; self.implements = []
        self.type_params = [tp.name for tp in (getattr(node, "type_parameters", None) or [])]


def tname(t):
    """javalang type -> simple name string (last segment)"""
    if t is None: return "void"
    n = t.name
    st = getattr(t, "sub_type", None)
    while st is not None:
        n = n + "." + st.name; st = getattr(st, "sub_type", None)
    return n


def build_registry(files):
    reg = Registry()
    asts = {}
    for path, module in files:
        src = open(path).read()
        try:
            cu = jparse.parse(src)
        except Exception as e:
            print("PARSE FAIL", path, e, file=sys.stderr); continue
        asts[module] = cu
        pkg = module.split("/")[0]

        def visit(node, key, outer):
            ci = ClassInfo(key, node, module, outer)
            reg.classes[key] = ci
            if outer is None: reg.by_simple[ci.name] = key
            if getattr(node, "extends", None):
                ext = node.extends
                if isinstance(ext, list): ci.implements += [tname(e) for e in ext]; ext = None
                if ext is not None: ci.extends = tname(ext)
            for im in (getattr(node, "implements", None) or []): ci.implements.append(tname(im))
            body = node.body
            decls = body.declarations if isinstance(body, T.EnumBody) else body
            if isinstance(body, T.EnumBody):
                for c in body.constants:
                    ci.consts.append(c.name)
                    reg.enum_consts.setdefault(c.name, set()).add(key)
            for d in decls or []:
                if isinstance(d, T.FieldDeclaration):
                    for v in d.declarators:
                        ci.fields[v.name] = tname(d.type)
                        reg.field_types.setdefault(v.name, set()).add(tname(d.type))
                        if "static" in d.modifiers: ci.static_fields.add(v.name)
                elif isinstance(d, T.MethodDeclaration):
                    ci.methods.setdefault(d.name, []).append(d)
                    reg.method_rets.setdefault(d.name, set()).add(tname(d.return_type) if d.return_type else "void")
                    if "static" in d.modifiers: ci.static_methods.add(d.name)
                elif isinstance(d, (T.ClassDeclaration, T.EnumDeclaration, T.InterfaceDeclaration)):
                    nk = key + "$" + d.name
                    ci.nested[d.name] = nk
                    visit(d, nk, ci)
        for td in cu.types:
            visit(td, pkg + "/" + td.name if td.name != module.split("/")[-1] else module, None)
    for ci in reg.classes.values():
        for f in list(ci.fields):
            if f in ci.methods: Registry.renamed_fields.add(f)
    reg.nested_by_simple = {}
    for k, ci in reg.classes.items():
        if ci.outer is not None: reg.nested_by_simple.setdefault(ci.name, []).append(k)
    return reg, asts


class Emitter:
    def __init__(self, reg, module, cu, hand_names):
        self.reg = reg; self.module = module; self.cu = cu
        self.out = []; self.imports = set(); self.runtime_imports = set()
        self.cls_stack = []      # ClassInfo stack
        self.scopes = []         # list of dict name->type
        self.hand = hand_names   # simple names provided by hand-written modules -> module path
        self.warnings = []
        self.in_static = False
        self.switch_enum = None
        self.lambda_depth = 0
        self.warnings_skipped = []

    # ---------------- helpers ----------------
    def w(self, s): self.out.append(s)

    def push(self): self.scopes.append({})
    def pop(self): self.scopes.pop()
    def declare(self, name, typ): self.scopes[-1][name] = typ
    def local(self, name):
        for s in reversed(self.scopes):
            if name in s: return s[name]
        return None
    def is_local(self, name):
        return any(name in s for s in self.scopes)

    @property
    def cls(self): return self.cls_stack[-1] if self.cls_stack else None

    def resolve_class_path(self, parts, use=True):
        """Resolve a dotted name list to (ts_expression, consumed_count, key) if it names a class."""
        if not parts: return None
        # strip package prefixes like Enums.X / Managers.X / com.mindvacation...
        start = 0
        if parts[0] in PKGS and len(parts) > 1:
            cand = parts[0] + "/" + parts[1]
            if cand in self.reg.classes:
                key = cand; i = 2
                while i < len(parts) and parts[i] in self.reg.classes[key].nested:
                    key = self.reg.classes[key].nested[parts[i]]; i += 1
                top = cand.split("/")[-1]
                alias = top
                if self.shadowed(top): alias = parts[0] + "_" + top
                if use: self.add_import(top, cand, alias)
                return (".".join([alias] + parts[2:i]), i, key)
        first = parts[0]
        # nested class visible from current class chain
        for ci in reversed(self.cls_stack):
            c = ci
            while c is not None:
                if first in c.nested:
                    key = c.nested[first]; i = 1
                    while i < len(parts) and parts[i] in self.reg.classes[key].nested:
                        key = self.reg.classes[key].nested[parts[i]]; i += 1
                    # build qualified path from top-level
                    chain = []; k = key
                    while k in self.reg.classes:
                        chain.append(self.reg.classes[k].name)
                        o = self.reg.classes[k].outer; k = o.key if o else None
                    chain.reverse()
                    return (".".join(chain), i, key)
                c = c.outer if hasattr(c, "outer") else None
            break
        # current or enclosing classes by name
        for ci in reversed(self.cls_stack):
            if ci.name == first:
                key = ci.key; i = 1
                while i < len(parts) and parts[i] in self.reg.classes[key].nested:
                    key = self.reg.classes[key].nested[parts[i]]; i += 1
                chain = []; k = key
                while k in self.reg.classes:
                    chain.append(self.reg.classes[k].name)
                    o = self.reg.classes[k].outer; k = o.key if o else None
                chain.reverse()
                return (".".join(chain), i, key)
        if first in self.reg.by_simple:
            key = self.reg.by_simple[first]; i = 1
            while i < len(parts) and parts[i] in self.reg.classes[key].nested:
                key = self.reg.classes[key].nested[parts[i]]; i += 1
            if use: self.add_import(first, self.reg.by_simple[first], first)
            return (".".join(parts[:i]), i, key)
        if first in self.hand:
            if use: self.add_import(first, self.hand[first], first)
            return (first, 1, None)
        if first in RUNTIME:
            if use: self.runtime_imports.add(first)
            return (first, 1, None)
        nks = getattr(self.reg, "nested_by_simple", {}).get(first)
        if nks and len(nks) == 1:
            key = nks[0]; chain = []; k = key
            while k in self.reg.classes:
                chain.append(self.reg.classes[k].name); o = self.reg.classes[k].outer; k = o.key if o else None
            chain.reverse()
            top = chain[0]
            if use: self.add_import(top, self.reg.by_simple[top], top)
            i = 1
            while i < len(parts) and parts[i] in self.reg.classes[key].nested:
                key = self.reg.classes[key].nested[parts[i]]; chain.append(parts[i]); i += 1
            return (".".join(chain), i, key)
        if first in RUNTIME:
            if use: self.runtime_imports.add(first)
            return (first, 1, None)
        return None

    def auto_import(self, code):
        code = re.sub(r'"(?:[^"\\]|\\.)*"', '""', code)
        code = re.sub(r"//.*", "", code)
        for ident in sorted(set(re.findall(r"(?<![\w.$])([A-Z][A-Za-z0-9_]*)\b", code))):
            if ident in ("R",) or ident in RUNTIME or ident in self.reg.by_simple or ident in self.hand:
                self.resolve_class_path([ident])

    def shadowed(self, name):
        # a nested class in the current chain with the same simple name as a top-level import
        for ci in self.cls_stack:
            c = ci
            while c:
                if name in c.nested and c.name != name: return True
                c = c.outer
        return False

    def add_import(self, name, key_or_module, alias):
        mod = key_or_module.split("$")[0]
        if mod == self.module: return
        self.imports.add((name, mod, alias))

    # ---------------- types ----------------
    def ts_type(self, t, generic_ok=True):
        if t is None: return "void"
        if isinstance(t, T.BasicType):
            base = TYPE_MAP.get(t.name, "any")
        else:
            parts = []
            x = t
            while x is not None:
                parts.append(x); x = getattr(x, "sub_type", None)
            names = [p.name for p in parts]
            full = ".".join(names)
            if len(names) == 1 and names[0] in TYPE_MAP:
                base = TYPE_MAP[names[0]]
                if base in RUNTIME: self.runtime_imports.add(base)
                args = parts[-1].arguments
                if base in ("ArrayList", "HashMap", "HashSet") and args and generic_ok:
                    base += "<" + ", ".join(self.ts_type_arg(a) for a in args) + ">"
            elif names[-1] == "Companion":
                base = "any"
            elif names[-1] in ANDROID_ANY and not self.resolve_class_path(names, use=False):
                base = "any"
            elif any(names[0] == tp for ci in self.cls_stack for tp in ci.type_params):
                base = names[0]
            elif len(names) == 1 and len(names[0]) == 1:
                base = "any"
            else:
                r = self.resolve_class_path(names)
                if r and r[2] is None and r[1] < len(names):
                    r = (".".join([r[0]] + names[r[1]:]), len(names), None)
                if r and r[1] == len(names):
                    base = r[0]
                    args = parts[-1].arguments
                    key = r[2]
                    if args and generic_ok:
                        tps = self.reg.classes[key].type_params if key in self.reg.classes else None
                        if tps is None or tps:
                            base += "<" + ", ".join(self.ts_type_arg(a) for a in args) + ">"
                    if base in ("Function0", "Function1", "Function2", "Function3", "Comparator", "Pair", "Triple", "Ref.ObjectRef") and args and generic_ok and "<" not in base:
                        base += "<" + ", ".join(self.ts_type_arg(a) for a in args) + ">"
                else:
                    base = "any"
        dims = len(getattr(t, "dimensions", None) or [])
        return base + "[]" * dims

    def ts_type_arg(self, a):
        if isinstance(a, T.TypeArgument):
            if a.type is None: return "any"
            return self.ts_type(a.type)
        return self.ts_type(a)

    # ---------------- type inference (light) ----------------
    def _merge(self, types):
        types = {t for t in types if t}
        if not types: return None
        if len(types) == 1: return next(iter(types))
        if all(t in INT_TYPES for t in types): return "int"
        if all(t in NUM_TYPES for t in types): return "double"
        return None

    def _field_type(self, name, owner_types=None):
        for ci in reversed(self.cls_stack):
            c = ci
            while c is not None:
                if name in c.fields: return c.fields[name]
                c = self.reg.classes.get(self.reg.by_simple.get(c.extends or "", ""), None) if c.extends else None
        return self._merge(self.reg.field_types.get(name, set()))

    def _method_type(self, name):
        if name in ("size", "ordinal", "length", "intValue", "roundToInt", "indexOf", "compareTo", "signum", "getLength"): return "int"
        if name in ("doubleValue", "random", "pow", "sqrt", "floor", "ceil", "nextDouble"): return "double"
        return self._merge(self.reg.method_rets.get(name, set()))

    def _follow(self, t, sels):
        for sel in sels or []:
            if isinstance(sel, T.ArraySelector):
                t = t[:-2] if t and t.endswith("[]") else None
            elif isinstance(sel, T.MethodInvocation):
                t = self._method_type(sel.member)
            elif isinstance(sel, T.MemberReference):
                t = "int" if sel.member == "length" else self._field_type(sel.member)
            else:
                t = None
        return t

    def expr_type(self, e):
        """Returns a rough java type name for division / cast decisions."""
        if isinstance(e, Parenthesized):
            return self._follow(self.expr_type(e.expression), e.selectors)
        if isinstance(e, T.Literal):
            v = e.value
            if v.startswith('"'): return "String"
            if v in ("true", "false"): return "boolean"
            if v == "null": return None
            if v.startswith("'"): return "char"
            if re.match(r"^-?[0-9]+[lL]?$", v) or re.match(r"^0[xX][0-9a-fA-F]+[lL]?$", v): return "int"
            return "double"
        if isinstance(e, T.Cast):
            return tname(e.type)
        if isinstance(e, T.This):
            if not e.selectors: return None
            return self._follow(self.cls.name if self.cls else None, e.selectors)
        if isinstance(e, T.MemberReference):
            if not e.qualifier:
                t = self.local(e.member)
                if t is None: t = self._field_type(e.member)
            else:
                t = "int" if e.member == "length" else self._field_type(e.member)
                if self.is_local(e.qualifier.split(".")[0]) and e.member == "length": t = "int"
            return self._follow(t, e.selectors)
        if isinstance(e, T.MethodInvocation):
            if e.qualifier == "Math" and e.member in ("max", "min", "abs"):
                ts = [self.expr_type(a) for a in e.arguments]
                t = "int" if all(x in INT_TYPES for x in ts) else "double"
            elif e.qualifier == "Math" and e.member in ("round",):
                t = "long"
            elif e.qualifier and e.qualifier.endswith("ExtensionsKt") and e.member == "keepWithinRange":
                ts = [self.expr_type(a) for a in e.arguments]
                t = "int" if all(x in INT_TYPES for x in ts) else "double"
            else:
                t = self._method_type(e.member)
            return self._follow(t, e.selectors)
        if isinstance(e, T.BinaryOperation):
            if e.operator in ("==", "!=", "<", ">", "<=", ">=", "&&", "||", "instanceof"): return "boolean"
            a, b = self.expr_type(e.operandl), self.expr_type(e.operandr)
            if e.operator == "+" and ("String" in (a, b)): return "String"
            if a in INT_TYPES and b in INT_TYPES: return "long" if "long" in (a, b) or "Long" in (a, b) else "int"
            if a in NUM_TYPES and b in NUM_TYPES: return "double"
            return None
        if isinstance(e, T.TernaryExpression):
            return self._merge({self.expr_type(e.if_true), self.expr_type(e.if_false)})
        if isinstance(e, T.Assignment):
            return self.expr_type(e.expressionl)
        return None

    def is_integral(self, e):
        return self.expr_type(e) in INT_TYPES

    # ---------------- expressions ----------------
    def prec_wrap(self, e):
        s = self.expr(e)
        if isinstance(e, (T.BinaryOperation, T.TernaryExpression, T.Assignment, T.LambdaExpression)) and not getattr(e, "selectors", None):
            return "(" + s + ")"
        if isinstance(e, T.Cast) and (" as " in s): return "(" + s + ")"
        return s

    def lit(self, v):
        if v.startswith('"'): return v
        if v.startswith("'"):
            return json.dumps(eval("'" + v[1:-1].replace('"', '\\"') + "'")) if "\\u" not in v else '"' + v[1:-1] + '"'
        if v in ("true", "false", "null"): return v
        v2 = re.sub(r"(?<=[0-9.])[dDfFlL]$", "", v)
        if re.match(r"^0[xX]", v): v2 = v.rstrip("lL")
        if re.match(r"^[0-9]+\.$", v2): v2 += "0"
        return v2

    def apply_ops(self, e, core):
        pre = "".join(getattr(e, "prefix_operators", None) or [])
        post = "".join(getattr(e, "postfix_operators", None) or [])
        if pre and pre[-1] in "+-" and core.startswith(pre[-1]): pre += " "
        return pre + core + post

    def selectors(self, base, sels, base_type=None):
        s = base
        for sel in sels or []:
            if isinstance(sel, T.ArraySelector):
                s += "[" + self.expr(sel.index) + "]"
            elif isinstance(sel, T.MethodInvocation):
                s = self.method_call(s, sel)
            elif isinstance(sel, T.MemberReference):
                if sel.member == "length": s += ".length"
                elif sel.member in Registry.renamed_fields: s += "._" + sel.member
                else: s += "." + sel.member
            elif isinstance(sel, T.ClassCreator):
                s += "." + self.expr(sel)
            else:
                s += "." + self.expr(sel)
        return s

    def args(self, args):
        return ", ".join(self.expr(a) for a in args or [])

    def method_call(self, target, mi):
        """target is the TS expression of the receiver (or None for unqualified)."""
        m = mi.member; a = mi.arguments or []
        if m == "launch$default" and target and "Builders" in target:
            # Kotlin coroutine that ran a store purchase; there is no store on desktop.
            self.add_import("InAppPurchaseManager", self.hand["InAppPurchaseManager"], "InAppPurchaseManager")
            return "InAppPurchaseManager.INSTANCE.purchasesUnavailable()"
        call = None
        recv = (target + ".") if target else ""
        if target is not None:
            if m == "equals" and len(a) == 1:
                self.runtime_imports.add("Intrinsics")
                call = f"Intrinsics.areEqual({target}, {self.expr(a[0])})"
            elif m == "length" and not a: call = f"{target}.length"
            elif m == "hashCode" and not a:
                self.runtime_imports.add("Intrinsics"); call = f"Intrinsics.hashCode({target})"
            elif m == "getClass" and not a: call = f"{target}.constructor"
            elif m == "clone" and not a: call = f"[...{target}]"
            elif m == "name" and not a: call = f"{target}.name()"
        if call is None and target and target.endswith(".Companion") and not m.endswith("$default"):
            recv = target[:-len("Companion")] + "INSTANCE."
        if call is None:
            call = f"{recv}{m}({self.args(a)})"
        return self.selectors(call, mi.selectors)

    def qualifier_expr(self, q):
        """Translate a dotted qualifier string (javalang) into TS."""
        parts = q.split(".")
        # local variable or field first
        first = parts[0]
        if self.is_local(first):
            return ".".join(parts)
        r = self.resolve_class_path(parts) if not self.member_of_this(first) else None
        if r:
            ts, n, key = r
            rest = parts[n:]
            return ".".join([ts] + rest)
        if first == "R" and len(parts) >= 2:
            self.runtime_imports.add("R"); return q
        # field of this / outer
        return self.implicit_member(first) + ("." + ".".join(parts[1:]) if len(parts) > 1 else "")

    def member_of_this(self, name):
        for ci in reversed(self.cls_stack):
            c = ci
            while c is not None:
                if name in c.fields or name in c.methods: return True
                c = self.reg.classes.get(self.reg.by_simple.get(c.extends or "", ""), None) if c.extends else None
        return False

    def find_member_owner(self, name, is_method):
        """returns (ClassInfo, is_static) for an unqualified member, searching class chain + supers."""
        for ci in reversed(self.cls_stack):
            c = ci
            while c is not None:
                has = name in (c.methods if is_method else c.fields)
                if has:
                    st = name in (c.static_methods if is_method else c.static_fields)
                    return ci, c, st
                sup = c.extends
                c = self.reg.classes.get(self.reg.by_simple.get(sup, ""), None) if sup else None
                if c is None and sup and self.cls_stack:
                    # nested super (e.g. extends BaseViewModel in same package)
                    pass
        return None, None, False

    def class_ref(self, ci):
        chain = []; k = ci.key
        while k in self.reg.classes:
            chain.append(self.reg.classes[k].name)
            o = self.reg.classes[k].outer; k = o.key if o else None
        return ".".join(reversed(chain))

    def implicit_member(self, name, is_method=False):
        if not is_method and self.is_local(name): return name
        if is_method and name in ("values", "valueOf"):
            for ci in reversed(self.cls_stack):
                if ci.kind == "enum": return self.class_ref(ci) + "." + name
        if not is_method and name in Registry.renamed_fields:
            lex, owner, st = self.find_member_owner(name, False)
            if owner is not None and name in owner.methods:
                return (self.class_ref(owner) if st else "this") + "._" + name
        lex, owner, st = self.find_member_owner(name, is_method)
        if owner is not None:
            if st: return self.class_ref(owner) + "." + name
            if lex is self.cls: return "this." + name
            # instance member of an outer class from an inner/anonymous context
            return "this." + name
        # enum constant used bare inside its enum
        for ci in reversed(self.cls_stack):
            if name in ci.consts: return self.class_ref(ci) + "." + name
        return name

    def expr(self, e):
        if e is None: return ""
        if isinstance(e, Parenthesized):
            core = "(" + self.expr(e.expression) + ")"
            core = self.selectors(core, e.selectors)
            return self.apply_ops(e, core)
        if isinstance(e, T.Literal):
            return self.apply_ops(e, self.selectors(self.lit(e.value), e.selectors))
        if isinstance(e, T.MemberReference):
            if e.qualifier:
                q = self.qualifier_expr(e.qualifier)
                mem = ("_" + e.member) if (e.member in Registry.renamed_fields and not q[:1].isupper()) else e.member
                core = q + "." + mem
            else:
                core = self.implicit_member(e.member)
            core = self.selectors(core, e.selectors)
            return self.apply_ops(e, core)
        if isinstance(e, T.MethodInvocation):
            if e.qualifier:
                q = self.qualifier_expr(e.qualifier)
                core = self.method_call(q, e)
            else:
                # unqualified call
                tgt = self.implicit_member(e.member, True)
                if "." in tgt:
                    recv, _, _ = tgt.rpartition(".")
                    core = self.method_call(recv, e)
                else:
                    core = self.method_call(None, e)
            return self.apply_ops(e, core)
        if isinstance(e, T.This):
            base = "this"
            qn = e.qualifier.split(".")[-1] if e.qualifier else None
            if e.qualifier and not any(ci.name == qn for ci in self.cls_stack):
                # jadx names a lambda's captured local `X.this`; bind to nearest variable of type X
                found = None
                for sc in reversed(self.scopes):
                    for vn, vt in reversed(list(sc.items())):
                        if vt and vt.split("<")[0].split(".")[-1] == qn:
                            found = vn; break
                    if found: break
                if found: base = found
                else: self.warnings.append(f"unbound {e.qualifier}.this in {self.cls.name}")
            elif e.qualifier and self.cls and qn != self.cls.name and self.lambda_depth == 0:
                self.warnings.append(f"Outer.this ({e.qualifier}) in {self.cls.name}")
            core = self.selectors(base, e.selectors)
            return self.apply_ops(e, core)
        if isinstance(e, T.SuperMethodInvocation):
            core = self.selectors(f"super.{e.member}({self.args(e.arguments)})", e.selectors)
            return self.apply_ops(e, core)
        if isinstance(e, T.SuperMemberReference):
            return self.apply_ops(e, self.selectors("super." + e.member, e.selectors))
        if isinstance(e, T.BinaryOperation):
            op = e.operator
            if op == "instanceof":
                t = self.ts_type(e.operandr, generic_ok=False)
                if t in ("string",): return f"(typeof {self.prec_wrap(e.operandl)} === 'string')"
                if t in ("number",): return f"(typeof {self.prec_wrap(e.operandl)} === 'number')"
                if t == "any": return "false /*instanceof android*/"
                return f"{self.prec_wrap(e.operandl)} instanceof {t}"
            l, r = self.prec_wrap(e.operandl), self.prec_wrap(e.operandr)
            if op in ("==", "!="):
                if r == "null" or l == "null":
                    return f"{l} {op} {r}"
                return f"{l} {op}= {r}"
            if op == "^" and ("boolean" in (self.expr_type(e.operandl), self.expr_type(e.operandr)) or l in ("true", "false") or r in ("true", "false")):
                return f"{l} !== {r}"
            if op == "/":
                ta, tb = self.expr_type(e.operandl), self.expr_type(e.operandr)
                if ta in INT_TYPES and tb in INT_TYPES:
                    self.runtime_imports.add("JMath")
                    return f"JMath.idiv({l}, {r})"
                if not (ta in FLOAT_TYPES or tb in FLOAT_TYPES):
                    DIV_LOG.append(f"{self.module}: {l} / {r}   [{ta} / {tb}]")
            return f"{l} {op} {r}"
        if isinstance(e, T.TernaryExpression):
            return f"{self.prec_wrap(e.condition)} ? {self.prec_wrap(e.if_true)} : {self.prec_wrap(e.if_false)}"
        if isinstance(e, T.Assignment):
            l = self.expr(e.expressionl); r = self.expr(e.value)
            if isinstance(e.value, T.Literal) and e.value.value.startswith("'") and self.expr_type(e.expressionl) in INT_TYPES:
                r = str(ord(eval(e.value.value)))
            if e.type == "/=" and self.is_integral(e.expressionl) and self.is_integral(e.value):
                self.runtime_imports.add("JMath")
                return f"{l} = JMath.idiv({l}, {r})"
            return f"{l} {e.type} {r}"
        if isinstance(e, T.Cast):
            tn = tname(e.type)
            inner = self.prec_wrap(e.expression) if not isinstance(e.expression, Parenthesized) else self.expr(e.expression)
            if isinstance(e.expression, T.Literal) and e.expression.value == "null":
                return "null"
            if isinstance(e.type, T.BasicType) or tn in NUM_TYPES:
                if isinstance(e.type, T.BasicType) and tn in ("int", "long", "short", "byte"):
                    if self.is_integral(e.expression): return inner
                    self.runtime_imports.add("JMath")
                    return f"JMath.toInt({self.expr(e.expression)})"
                return inner
            if tn in ("String",): return f"({inner} as string)"
            ty = self.ts_type(e.type)
            if ty == "any": return inner
            return f"({inner} as unknown as {ty})"
        if isinstance(e, T.ClassCreator):
            return self.apply_ops(e, self.selectors(self.class_creator(e), e.selectors))
        if isinstance(e, T.ArrayCreator):
            if e.initializer is not None:
                core = self.array_init(e.initializer)
            else:
                dim = e.dimensions[0] if e.dimensions else None
                tn = tname(e.type)
                fill = "0" if tn in NUM_TYPES else ("false" if tn == "boolean" else "null")
                if len(e.dimensions) > 1 and e.dimensions[1] is not None:
                    self.warnings.append("multi-dim array")
                core = f"new Array({self.expr(dim)}).fill({fill})" if dim is not None else "[]"
            return self.apply_ops(e, self.selectors(core, e.selectors))
        if isinstance(e, T.ArrayInitializer):
            return self.array_init(e)
        if isinstance(e, T.ClassReference):
            ty = self.ts_type(e.type) if e.type else "any"
            return self.selectors(ty, e.selectors)
        if isinstance(e, T.LambdaExpression):
            self.push()
            ps = []
            for p in e.parameters:
                n = p.name; ps.append(n); self.declare(n, None)
            self.lambda_depth += 1
            if isinstance(e.body, list):
                body = self.block_str(e.body)
                s = f"({', '.join(ps)}) => {body}"
            else:
                s = f"({', '.join(ps)}) => {self.expr(e.body)}"
            self.lambda_depth -= 1
            self.pop()
            return s
        if isinstance(e, T.MethodReference):
            return f"/*methodref*/ ((...a) => {self.expr(e.expression)}.{self.expr(e.method)}(...a))"
        if isinstance(e, T.ExplicitConstructorInvocation):
            return f"this.$init({self.args(e.arguments)})"
        if isinstance(e, T.SuperConstructorInvocation):
            return f"super({self.args(e.arguments)})"
        if isinstance(e, T.VariableDeclarator):
            return e.name
        self.warnings.append("unknown expr " + type(e).__name__)
        return f"/*?{type(e).__name__}*/"

    def array_init(self, init):
        return "[" + ", ".join(self.expr(x) for x in init.initializers or []) + "]"

    def class_creator(self, e):
        names = []
        x = e.type
        while x is not None:
            names.append(x.name); x = getattr(x, "sub_type", None)
        if e.body is not None:
            return self.anonymous(e, names)
        tn = ".".join(names)
        if tn in ("ArrayList", "LinkedList", "Vector", "CopyOnWriteArrayList"):
            self.runtime_imports.add("ArrayList")
            a = e.arguments or []
            if a and not self.is_integral(a[0]) and not (isinstance(a[0], T.MethodInvocation) and a[0].member == "collectionSizeOrDefault"):
                return f"new ArrayList({self.expr(a[0])})"
            return "new ArrayList()"
        if tn in ("HashMap", "LinkedHashMap", "TreeMap", "ConcurrentHashMap"):
            self.runtime_imports.add("HashMap")
            a = e.arguments or []
            if a and not self.is_integral(a[0]) and not (isinstance(a[0], T.MethodInvocation) and a[0].member in ("mapCapacity", "collectionSizeOrDefault")):
                return f"new HashMap({self.expr(a[0])})"
            return "new HashMap()"
        if tn in ("HashSet", "LinkedHashSet", "TreeSet"):
            self.runtime_imports.add("HashSet")
            a = e.arguments or []
            if a and not self.is_integral(a[0]) and not (isinstance(a[0], T.MethodInvocation) and a[0].member in ("mapCapacity", "collectionSizeOrDefault")):
                return f"new HashSet({self.expr(a[0])})"
            return "new HashSet()"
        if tn == "String":
            return f"String({self.args(e.arguments)})"
        r = self.resolve_class_path(names)
        if r and (r[1] == len(names) or r[2] is None):
            return f"new {'.'.join([r[0]] + names[r[1]:])}({self.args(e.arguments)})"
        if names[-1] in RUNTIME and names[0] in ("android", "java", "kotlin"):
            self.runtime_imports.add(f"{names[-1]} as rt_{names[-1]}")
            return f"new rt_{names[-1]}({self.args(e.arguments)})"
        if names[-1] in ANDROID_ANY:
            self.runtime_imports.add("Intrinsics")
            return f"Intrinsics.androidStub({json.dumps(tn)})"
        self.warnings.append("unknown class new " + tn)
        return f"new {tn}({self.args(e.arguments)})"

    def anonymous(self, e, names):
        """Anonymous class -> object literal of arrow functions (captures outer `this`)."""
        methods = [d for d in e.body if isinstance(d, T.MethodDeclaration)]
        fields = [d for d in e.body if isinstance(d, T.FieldDeclaration)]
        base = names[-1]
        chosen = {}
        if base.startswith("Function") or base in ("Comparator",):
            # Kotlin lambda: invoke (bridge) + invoke2 (real) / or typed invoke
            real = [m for m in methods if m.name == "invoke2"]
            if real:
                chosen["invoke"] = real[0]
            else:
                inv = [m for m in methods if m.name == "invoke"]
                def delegates(m):
                    body = m.body or []
                    return any(isinstance(n, T.MethodInvocation) and n.member in ("invoke", "invoke2") and not n.qualifier
                               for st in body for _, n in st)
                def score(m):
                    obj = sum(1 for p in m.parameters if tname(p.type) == "Object")
                    return (1 if delegates(m) else 0, obj)
                if inv: chosen["invoke"] = sorted(inv, key=score)[0]
                for m in methods:
                    if m.name not in ("invoke", "invoke2"):
                        if m.name in chosen:
                            if sum(1 for p in m.parameters if tname(p.type) == "Object") < sum(1 for p in chosen[m.name].parameters if tname(p.type) == "Object"):
                                chosen[m.name] = m
                        else: chosen[m.name] = m
        else:
            for m in methods:
                if m.name in chosen:
                    if sum(1 for p in m.parameters if tname(p.type) == "Object") < sum(1 for p in chosen[m.name].parameters if tname(p.type) == "Object"):
                        chosen[m.name] = m
                else: chosen[m.name] = m
        parts = []
        self.lambda_depth += 1
        for f in fields:
            for v in f.declarators:
                parts.append(f"{v.name}: {self.expr(v.initializer) if v.initializer else 'null'}")
        for name, m in chosen.items():
            self.push()
            ps = []
            for p in m.parameters:
                self.declare(p.name, tname(p.type)); ps.append(f"{p.name}: {self.ts_type(p.type)}")
            body = self.block_str(m.body or [])
            self.pop()
            parts.append(f"{name}: ({', '.join(ps)}) => {body}")
        self.lambda_depth -= 1
        ind = "    " * (self.indent + 1)
        return "{\n" + ",\n".join(ind + p for p in parts) + "\n" + "    " * self.indent + "}"

    # ---------------- statements ----------------
    indent = 0

    def block_str(self, stmts):
        saved = self.out; self.out = []
        self.indent += 1
        self.push()
        for s in stmts: self.stmt(s)
        self.pop()
        self.indent -= 1
        body = "\n".join(self.out); self.out = saved
        return "{\n" + body + ("\n" if body else "") + "    " * self.indent + "}"

    def line(self, s): self.out.append("    " * self.indent + s)

    def stmt(self, s):
        label = getattr(s, "label", None)
        prefix = (label + ": ") if label else ""
        if isinstance(s, T.LocalVariableDeclaration):
            tn = tname(s.type)
            decls = []
            for v in s.declarators:
                ty = self.ts_type(s.type)
                if tn == "char" and isinstance(v.initializer, T.Literal) and not (v.initializer.selectors or v.initializer.prefix_operators):
                    lv = v.initializer.value
                    code = ord(eval(lv)) if lv.startswith("'") else int(lv, 0)
                    self.declare(v.name, "int")
                    decls.append(f"{v.name}: number = {code}")
                    continue
                if v.initializer is not None:
                    init = self.expr(v.initializer)
                    if isinstance(v.initializer, T.ArrayInitializer): init = self.array_init(v.initializer)
                self.declare(v.name, tn + ("[]" * len(v.dimensions or [])))
                if v.initializer is not None:
                    if ty in ("any",) or "Object" == tn: decls.append(f"{v.name} = {init}")
                    else: decls.append(f"{v.name}: {ty} = {init}")
                else:
                    decls.append(f"{v.name}: {ty}")
            self.line(prefix + "let " + ", ".join(decls) + ";")
        elif isinstance(s, T.StatementExpression):
            self.line(prefix + self.expr(s.expression) + ";")
        elif isinstance(s, T.IfStatement):
            self.if_stmt(s, prefix)
        elif isinstance(s, T.BlockStatement):
            self.line(prefix + self.block_str(s.statements or []))
        elif isinstance(s, T.ReturnStatement):
            self.line(prefix + ("return " + self.expr(s.expression) + ";" if s.expression is not None else "return;"))
        elif isinstance(s, T.ThrowStatement):
            self.line(prefix + "throw " + self.expr(s.expression) + ";")
        elif isinstance(s, T.BreakStatement):
            self.line(prefix + "break" + (" " + s.goto if s.goto else "") + ";")
        elif isinstance(s, T.ContinueStatement):
            self.line(prefix + "continue" + (" " + s.goto if s.goto else "") + ";")
        elif isinstance(s, T.WhileStatement):
            self.line(prefix + f"while ({self.cond(s.condition)}) " + self.body_str(s.body))
        elif isinstance(s, T.DoStatement):
            self.line(prefix + f"do " + self.body_str(s.body) + f" while ({self.cond(s.condition)});")
        elif isinstance(s, T.ForStatement):
            self.push()
            c = s.control
            if isinstance(c, T.EnhancedForControl):
                v = c.var.declarators[0].name
                self.declare(v, tname(c.var.type))
                it = self.expr(c.iterable)
                self.line(prefix + f"for (const {v} of {it}) " + self.body_str(s.body))
            else:
                init = ""
                if isinstance(c.init, T.VariableDeclaration):
                    ds = []
                    for v in c.init.declarators:
                        self.declare(v.name, tname(c.init.type))
                        ds.append(f"{v.name} = {self.expr(v.initializer)}" if v.initializer else v.name)
                    init = "let " + ", ".join(ds)
                elif c.init:
                    init = ", ".join(self.expr(x) for x in (c.init if isinstance(c.init, list) else [c.init]))
                cond = self.expr(c.condition) if c.condition else ""
                upd = ", ".join(self.expr(x) for x in (c.update or []))
                self.line(prefix + f"for ({init}; {cond}; {upd}) " + self.body_str(s.body))
            self.pop()
        elif isinstance(s, T.SwitchStatement):
            self.switch_stmt(s, prefix)
        elif isinstance(s, T.TryStatement):
            res = ""
            body = self.block_str(s.block or [])
            txt = prefix + "try " + body
            for cc in s.catches or []:
                self.push(); self.declare(cc.parameter.name, None)
                txt += f" catch ({cc.parameter.name}) " + self.block_str(cc.block or [])
                self.pop()
            if s.finally_block is not None:
                txt += " finally " + self.block_str(s.finally_block)
            if not s.catches and s.finally_block is None: txt += " catch (_e) {}"
            self.line(txt)
        elif isinstance(s, T.SynchronizedStatement):
            self.line(prefix + self.block_str(s.block or []))
        elif isinstance(s, T.AssertStatement):
            pass
        elif isinstance(s, (T.ClassDeclaration,)):
            self.warnings.append("local class " + s.name)
            self.line(f"/* local class {s.name} omitted */")
        elif isinstance(s, T.Statement) and type(s) is T.Statement:
            self.line(prefix + ";")
        else:
            self.warnings.append("unknown stmt " + type(s).__name__)
            self.line(f"/* ?{type(s).__name__} */")

    def cond(self, c):
        if isinstance(c, Parenthesized) and not c.selectors and not c.prefix_operators and not c.postfix_operators:
            return self.expr(c.expression)
        return self.expr(c)

    def body_str(self, b):
        if isinstance(b, T.BlockStatement): return self.block_str(b.statements or [])
        return self.block_str([b])

    def if_stmt(self, s, prefix=""):
        txt = prefix + f"if ({self.cond(s.condition)}) " + self.body_str(s.then_statement)
        e = s.else_statement
        while e is not None:
            if isinstance(e, T.IfStatement) and not getattr(e, "label", None):
                txt += f" else if ({self.cond(e.condition)}) " + self.body_str(e.then_statement)
                e = e.else_statement
            else:
                txt += " else " + self.body_str(e); e = None
        self.line(txt)

    def switch_stmt(self, s, prefix=""):
        # bare enum-constant labels -> qualify with the enum that has all of them
        for case in s.cases:
            case.case = [T.MemberReference(member=c, qualifier="", selectors=[], prefix_operators=[], postfix_operators=[]) if isinstance(c, str) else c for c in case.case]
        labels = [c for case in s.cases for c in case.case if isinstance(c, T.MemberReference) and not c.qualifier]
        enum_key = None
        if labels:
            cands = None
            for l in labels:
                ks = self.reg.enum_consts.get(l.member, set())
                cands = ks if cands is None else (cands & ks)
            if cands:
                if len(cands) > 1:
                    # prefer enum of current class
                    cur = [k for k in cands if any(ci.key == k for ci in self.cls_stack)]
                    enum_key = cur[0] if cur else sorted(cands)[0]
                    if not cur: self.warnings.append(f"ambiguous switch enum {cands}")
                else: enum_key = next(iter(cands))
        txt = prefix + f"switch ({self.cond(s.expression)}) {{"
        self.line(txt)
        self.indent += 1
        for case in s.cases:
            if not case.case:
                self.line("default:")
            for c in case.case:
                if isinstance(c, T.MemberReference) and not c.qualifier and enum_key:
                    ci = self.reg.classes[enum_key]
                    r = self.resolve_class_path([ci.name]) if ci.outer is None else None
                    ref = r[0] if r else self.class_ref(ci)
                    self.line(f"case {ref}.{c.member}:")
                else:
                    self.line(f"case {self.expr(c)}:")
            self.indent += 1
            for st in case.statements: self.stmt(st)
            self.indent -= 1
        self.indent -= 1
        self.line("}")

    # ---------------- declarations ----------------
    def default_value(self, tn, dims):
        if dims: return "null"
        if tn in NUM_TYPES and tn[0].islower(): return "0"
        if tn == "boolean": return "false"
        if tn == "char": return '"\\0"'
        return "null"

    def emit_type(self, node, ci, out_lines, deferred):
        """Emit a class/enum/interface (+ its namespace of nested types)."""
        self.cls_stack.append(ci)
        name = ci.name
        kind = ci.kind
        nested = [d for d in (node.body.declarations if isinstance(node.body, T.EnumBody) else node.body)
                  if isinstance(d, (T.ClassDeclaration, T.EnumDeclaration, T.InterfaceDeclaration))]
        has_nested = bool(nested)
        tps = ("<" + ", ".join(ci.type_params) + ">") if ci.type_params else ""
        saved_out = self.out; self.out = []
        saved_indent = self.indent
        if kind == "interface":
            ext = ""
            if ci.implements or ci.extends:
                exts = [self.ts_type_from_name(n) for n in ([ci.extends] if ci.extends else []) + ci.implements]
                exts = [x for x in exts if x != "any"]
                if exts: ext = " extends " + ", ".join(exts)
            self.line(f"export interface {name}{tps}{ext} {{")
            self.indent += 1
            for d in node.body:
                if isinstance(d, T.MethodDeclaration):
                    self.push()
                    ps = ", ".join(f"{p.name}{'?' if False else ''}: {self.ts_type(p.type)}" for p in d.parameters)
                    self.pop()
                    self.line(f"{d.name}({ps}): {self.ts_type(d.return_type) if d.return_type else 'void'};")
            self.indent -= 1
            self.line("}")
        else:
            ext = ""
            if kind == "enum":
                self.runtime_imports.add("JEnum"); ext = " extends JEnum"
            elif ci.extends:
                et = self.ts_type_from_name(ci.extends)
                if et != "any": ext = " extends " + et
            impl = [self.ts_type_from_name(n) for n in ci.implements]
            impl = [x for x in impl if x not in ("any",) and not x.startswith("Comparable") and not x.startswith("Serializable")]
            iface_impl = []
            for n in impl:
                key = self.reg.by_simple.get(n.split("<")[0])
                if key and self.reg.classes[key].kind == "interface": iface_impl.append(n)
            impl_s = (" implements " + ", ".join(iface_impl)) if iface_impl else ""
            abstract = "abstract " if "abstract" in node.modifiers and kind == "class" else ""
            self.line(f"export {abstract}class {name}{tps}{ext}{impl_s} {{")
            self.indent += 1
            self.emit_members(node, ci, has_nested, deferred)
            self.indent -= 1
            self.line("}")
        cls_lines = self.out
        self.out = saved_out; self.indent = saved_indent
        out_lines.extend(cls_lines)
        if has_nested:
            out_lines.append(f"export namespace {name} {{")
            for d in nested:
                sub = []
                sub_def = []
                self.emit_type(d, self.reg.classes[ci.key + "$" + d.name], sub, sub_def)
                out_lines.extend("    " + l for l in sub)
                out_lines.extend("    " + l for l in sub_def)
            out_lines.append("}")
        self.cls_stack.pop()

    def ts_type_from_name(self, n):
        parts = n.split(".")
        if parts[-1] in ANDROID_ANY: return "any"
        r = self.resolve_class_path(parts)
        if r and r[1] == len(parts): return r[0]
        return "any"

    def method_sig_params(self, params):
        ps = []
        for p in params:
            self.declare(p.name, tname(p.type) + "[]" * len(p.type.dimensions or []))
            t = self.ts_type(p.type)
            if p.varargs: ps.append(f"...{p.name}: {t}[]")
            else: ps.append(f"{p.name}: {t}")
        return ", ".join(ps)

    def type_check(self, p, argname):
        tn = tname(p.type); dims = p.type.dimensions
        x = argname
        if dims: return f"({x} == null || Array.isArray({x}))"
        if tn in ("int", "long", "short", "byte"): return f"(typeof {x} === 'number' || typeof {x} === 'string')"
        if tn in ("Integer", "Long", "Short", "Byte"): return f"({x} == null || typeof {x} === 'number' || typeof {x} === 'string')"
        if tn in ("double", "float"): return f"typeof {x} === 'number'"
        if tn in ("Double", "Float", "Number"): return f"({x} == null || typeof {x} === 'number')"
        if tn == "boolean": return f"typeof {x} === 'boolean'"
        if tn == "Boolean": return f"({x} == null || typeof {x} === 'boolean')"
        if tn in ("String", "CharSequence"): return f"({x} == null || typeof {x} === 'string' || {x} instanceof Object)" if tn == "CharSequence" else f"({x} == null || typeof {x} === 'string')"
        t = self.ts_type(p.type, generic_ok=False)
        if t in ("any", "string", "number", "boolean") or "<" in t or t in ("ArrayList", "HashMap", "HashSet"):
            if t == "ArrayList": return f"({argname} == null || Array.isArray({argname}))"
            return "true"
        if t.startswith("Function") or t == "Comparator":
            return f"({argname} == null || typeof {argname} === 'object')"
        if t in RUNTIME or (self.reg.by_simple.get(t.split(".")[0]) and self.reg.classes[self.reg.by_simple[t.split('.')[0]]].kind != "interface"):
            return f"({argname} == null || {argname} instanceof {t})"
        return "true"

    def emit_members(self, node, ci, has_nested, deferred):
        name = ci.name
        is_enum = ci.kind == "enum"
        decls = node.body.declarations if isinstance(node.body, T.EnumBody) else node.body
        ctors = [d for d in decls if isinstance(d, T.ConstructorDeclaration)]
        # drop Kotlin serialization constructors
        ctors = [c for c in ctors if not any(tname(p.type) == "SerializationConstructorMarker" for p in c.parameters)]
        # ---- enum constants
        if is_enum:
            for i, c in enumerate(node.body.constants):
                a = self.args(c.arguments)
                self.line(f"static readonly {c.name}: {name} = new {name}({json.dumps(c.name)}, {i}{', ' + a if a else ''});")
                if c.body: self.warnings.append(f"enum constant body {name}.{c.name}")
            self.line(f"static values(): {name}[] {{ return [{', '.join(name + '.' + c.name for c in node.body.constants)}]; }}")
            self.line(f"static valueOf(n: string): {name} {{ return ({name} as any)[n]; }}")
        # ---- fields
        static_inits = []
        for d in decls:
            if isinstance(d, T.FieldDeclaration):
                st = "static" in d.modifiers
                for v in d.declarators:
                    if st and v.name == "INSTANCE" and tname(d.type) == "Companion":
                        pass
                    tn = tname(d.type); dims = (d.type.dimensions or []) + (v.dimensions or [])
                    fname = ("_" + v.name) if (v.name in Registry.renamed_fields and v.name in ci.methods) else v.name
                    ty = self.ts_type(d.type) + ("[]" * len(v.dimensions or []))
                    if v.initializer is not None:
                        self.push()
                        self.in_static = st
                        init = self.expr(v.initializer) if not isinstance(v.initializer, T.ArrayInitializer) else self.array_init(v.initializer)
                        self.in_static = False
                        self.pop()
                    else:
                        init = None
                    if st and (has_nested or is_enum) and init is not None and not (is_enum and False):
                        self.line(f"static {fname}: {ty};")
                        static_inits.append(("field", fname, init))
                    else:
                        pre = "static " if st else ""
                        val = init if init is not None else self.default_value(tn, dims)
                        self.line(f"{pre}{fname}: {ty} = {val};")
        # ---- constructors
        if ctors:
            self.emit_ctors(ci, ctors, is_enum)
        elif is_enum:
            self.line("constructor(name: string, ordinal: number) { super(name, ordinal); }")
        # ---- methods (group overloads)
        methods = [d for d in decls if isinstance(d, T.MethodDeclaration)]
        groups = {}
        VIEW_TYPES = {"View", "TextView", "ViewGroup", "ImageView", "Button", "SeekBar", "Switch", "EditText", "ImageButton",
                      "RecyclerView", "LinearLayout", "ConstraintLayout", "ViewHolder", "Context", "LayoutInflater", "CardView",
                      "ProgressBar", "FrameLayout", "Canvas", "Activity", "Fragment"}
        for m in methods:
            if any(tname(p.type).split(".")[-1] in VIEW_TYPES for p in m.parameters):
                self.warnings_skipped.append(f"{ci.name}.{m.name}")
                continue
            if m.name in ("hashCode",) and not m.parameters: continue
            if m.name == "write$Self": continue
            if is_enum and m.name in ("values", "valueOf") and "static" in m.modifiers: continue
            groups.setdefault((m.name, "static" in m.modifiers), []).append(m)
        for (mname, st), ms in groups.items():
            # drop exact duplicate signatures
            seen = {}; uniq = []
            for m in ms:
                sig = tuple(tname(p.type) + "[]" * len(p.type.dimensions or []) for p in m.parameters)
                if sig in seen: continue
                seen[sig] = 1; uniq.append(m)
            ms = uniq
            # drop bridges with Object params
            if len(ms) > 1:
                by_arity = {}
                for m in ms: by_arity.setdefault(len(m.parameters), []).append(m)
                keep = []
                for ar, lst in by_arity.items():
                    if len(lst) > 1:
                        # prefer non-Object signature; drop bridge-like duplicates whose body just delegates
                        nonobj = [m for m in lst if not all(tname(p.type) == "Object" for p in m.parameters) or not m.parameters]
                        keep += nonobj if nonobj else lst[:1]
                    else: keep += lst
                ms = keep
            if len(ms) == 1:
                self.emit_method(ms[0], mname)
            else:
                for i, m in enumerate(ms): self.emit_method(m, f"{mname}${i}")
                self.emit_dispatcher(mname, ms, st)
        # ---- static blocks / initializers
        for d in decls:
            if isinstance(d, jparse.Initializer) and not d.static:
                self.warnings.append(f"instance initializer in {name}")
            if isinstance(d, jparse.Initializer) and d.static:
                d.statements = d.statements or []
                self.in_static = True
                self.push()
                body = self.block_str(d.statements)
                self.pop()
                self.in_static = False
                if has_nested or is_enum:
                    static_inits.append(("block", None, body))
                else:
                    self.line("static " + body)
        extra = OVERRIDES.get(self.module, {}).get(self.class_ref(ci) + ".+extra")
        if extra:
            for l in extra.rstrip().split("\n"): self.line(l)
        if static_inits:
            # deferred until after namespace (nested classes exist)
            path = self.class_ref(ci)
            self.deferred_static.append((path, static_inits))

    def emit_ctors(self, ci, ctors, is_enum):
        name = ci.name
        has_super = bool(ci.extends) and self.ts_type_from_name(ci.extends) != "any"
        if len(ctors) == 1:
            c = ctors[0]
            self.push()
            ps = self.method_sig_params(c.parameters)
            if is_enum:
                ps = "name: string, ordinal: number" + (", " + ps if ps else "")
            body_stmts = list(c.body or [])
            saved = self.out; self.out = []
            self.indent += 1
            if is_enum: self.line("super(name, ordinal);")
            elif has_super and not any(isinstance(getattr(s, "expression", None), T.SuperConstructorInvocation) for s in body_stmts):
                self.line("super();")
            for s in body_stmts: self.stmt(s)
            self.indent -= 1
            body = "\n".join(self.out); self.out = saved
            self.pop()
            self.line(f"constructor({ps}) {{")
            self.out.append(body)
            self.line("}")
            return
        # multiple constructors -> $init dispatcher
        for i, c in enumerate(ctors):
            self.push()
            ps = self.method_sig_params(c.parameters)
            stmts = [s for s in (c.body or []) if not isinstance(getattr(s, "expression", None), T.SuperConstructorInvocation)]
            if any(isinstance(getattr(s, "expression", None), T.SuperConstructorInvocation) and s.expression.arguments for s in (c.body or [])):
                self.warnings.append(f"super(args) in overloaded ctor of {name}")
            body = self.block_str(stmts)
            self.pop()
            self.line(f"$init{i}({ps}): void {body}")
        pre = ("name: string, ordinal: number, " if is_enum else "")
        self.line(f"constructor({pre}...args: any[]) {{")
        self.indent += 1
        if is_enum: self.line("super(name, ordinal);")
        elif has_super: self.line("super();")
        self.line("this.$init(...args);")
        self.indent -= 1
        self.line("}")
        self.emit_dispatcher("$init", ctors, False, ctor=True)

    def emit_dispatcher(self, mname, ms, static, ctor=False):
        cands = sorted(enumerate(ms), key=lambda im: -len(im[1].parameters))
        pre = "static " if static else ""
        self.line(f"{pre}{mname}(...a: any[]): any {{")
        self.indent += 1
        for i, m in cands:
            n = len(m.parameters)
            if any(p.varargs for p in m.parameters):
                self.line(f"return (this as any).{mname if not ctor else '$init'}{i}(...a);"); continue
            conds = [f"a.length === {n}"] + [self.type_check(p, f"a[{k}]") for k, p in enumerate(m.parameters)]
            conds = [c for c in conds if c != "true"]
            target = f"{mname}{i}" if ctor else f"{mname}${i}"
            self.line(f"if ({' && '.join(conds)}) return ({'this' if not static else self.class_ref(self.cls)} as any).{target}(...a);")
        self.line(f"throw new Error('no overload for {mname} with ' + a.length + ' args');")
        self.indent -= 1
        self.line("}")

    def emit_method(self, m, name):
        ov = OVERRIDES.get(self.module, {}).get(self.class_ref(self.cls) + "." + m.name)
        if ov is not None:
            OVERRIDES_USED.add((self.module, self.class_ref(self.cls) + "." + m.name))
            self.auto_import(ov)
            if ov.strip():
                for l in ov.rstrip().split("\n"): self.line(l)
            return
        st = "static" in m.modifiers
        abstract = "abstract" in m.modifiers
        self.push()
        tps = ("<" + ", ".join(tp.name for tp in m.type_parameters) + ">") if m.type_parameters else ""
        if m.type_parameters:
            for tp in m.type_parameters: self.cls.type_params.append(tp.name)
        ps = self.method_sig_params(m.parameters)
        rt = self.ts_type(m.return_type) if m.return_type else "void"
        pre = ("static " if st else "") + ("abstract " if abstract else "")
        self.in_static = st
        if abstract or m.body is None:
            self.line(f"{pre}{name}{tps}({ps}): {rt};")
        else:
            body = self.block_str(m.body)
            self.line(f"{pre}{name}{tps}({ps}): {rt} {body}")
        self.in_static = False
        if m.type_parameters:
            for tp in m.type_parameters: self.cls.type_params.remove(tp.name)
        self.pop()

    def emit_module(self):
        lines = []
        self.deferred_static = []
        for td in self.cu.types:
            key = self.module if self.module.split("/")[-1] == td.name else self.module.split("/")[0] + "/" + td.name
            ci = self.reg.classes[key]
            self.emit_type(td, ci, lines, None)
        # deferred static initializers (after namespaces)
        for path, inits in self.deferred_static:
            for kind, nm, val in inits:
                if kind == "field": lines.append(f"{path}.{nm} = {val};")
                else: lines.append(f"(() => {self.static_block_this(val, path)})();")
        return lines

    def static_block_this(self, body, path):
        return body.replace("this.", path + ".")

    def header(self):
        hdr = ["// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.",
               "/* eslint-disable */"]
        depth = len(self.module.split("/")) - 1
        up = "../" * depth if depth else "./"
        rt_line_idx = len(hdr)
        extra_imp = OVERRIDES.get(self.module, {}).get("+imports")
        taken = set()
        if extra_imp:
            OVERRIDES_USED.add((self.module, "+imports"))
            lines = [l for l in extra_imp.strip().split("\n") if l.strip()]
            for l in lines:
                m = re.match(r"import \{([^}]*)\}", l)
                if m:
                    for part in m.group(1).split(","):
                        taken.add(part.strip().split(" as ")[-1].strip())
            self.runtime_imports -= taken
            hdr += lines
        for (name, mod, alias) in sorted(self.imports):
            if alias in taken: continue
            rel = os.path.relpath(mod, os.path.dirname(self.module) or ".")
            if not rel.startswith("."): rel = "./" + rel
            if name == alias: hdr.append(f"import {{ {name} }} from \"{rel}\";")
            else: hdr.append(f"import {{ {name} as {alias} }} from \"{rel}\";")
        if self.runtime_imports:
            hdr.insert(rt_line_idx, f"import {{ {', '.join(sorted(self.runtime_imports))} }} from \"{up}runtime\";")
        return hdr


OVERRIDES = {}
DIV_LOG = []
OVERRIDES_USED = set()
def load_overrides(d):
    import glob
    for f in glob.glob(os.path.join(d, "*.ts")):
        mod = os.path.basename(f)[:-3].replace("__", "/")
        cur = None; buf = []
        for line in open(f).read().split("\n") + ["//@@ END"]:
            if line.startswith("//@@ "):
                if cur: OVERRIDES.setdefault(mod, {})[cur] = "\n".join(buf)
                cur = line[5:].strip(); buf = []
            elif cur: buf.append(line)
        # extra members appended to a class: key "ClassPath.+extra"


def main():
    src_root, out_root, file_list, hand_json = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    hand = json.load(open(hand_json)) if os.path.exists(hand_json) else {}
    load_overrides(os.path.join(os.path.dirname(os.path.abspath(__file__)), "overrides"))
    rels = [l.strip() for l in open(file_list) if l.strip() and not l.startswith("#")]
    files = [(os.path.join(src_root, r), r[:-5]) for r in rels]
    # registry includes hand-written stubs' java too (for types), but we only emit listed files
    reg, asts = build_registry(files)
    total_warn = 0
    for path, module in files:
        if module not in asts: continue
        em = Emitter(reg, module, asts[module], hand)
        try:
            body = em.emit_module()
        except Exception as ex:
            import traceback; traceback.print_exc()
            print("EMIT FAIL", module, ex); continue
        txt = "\n".join(em.header() + [""] + body) + "\n"
        op = os.path.join(out_root, module + ".ts")
        os.makedirs(os.path.dirname(op), exist_ok=True)
        open(op, "w").write(txt)
        if em.warnings:
            total_warn += len(em.warnings)
            for wmsg in sorted(set(em.warnings))[:8]: print(f"  [{module}] {wmsg}")
    print("emitted", len(asts), "modules; warnings", total_warn)
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "divisions_unknown.txt"), "w").write("\n".join(DIV_LOG) + "\n")
    print("divisions with unknown operand types:", len(DIV_LOG))
    for mod, d in OVERRIDES.items():
        for k in d:
            if (mod, k) not in OVERRIDES_USED and not k.endswith("+extra"): print("UNUSED OVERRIDE", mod, k)


if __name__ == "__main__":
    main()
