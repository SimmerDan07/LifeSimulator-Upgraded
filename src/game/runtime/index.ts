// Runtime shims for the Java / Kotlin / Android APIs used by the translated game code.
// The goal is behavioural fidelity with the original Android app, not completeness.
/* eslint-disable */

// ---------------------------------------------------------------- enums
export abstract class JEnum {
    private readonly _name: string;
    private readonly _ordinal: number;
    constructor(name: string, ordinal: number) {
        this._name = name;
        this._ordinal = ordinal;
    }
    name(): string { return this._name; }
    ordinal(): number { return this._ordinal; }
    toString(): string { return this._name; }
    compareTo(o: JEnum): number { return this._ordinal - o._ordinal; }
    toJSON(): string { return this._name; }
}

// ---------------------------------------------------------------- numbers
export class BigInteger {
    readonly v: bigint;
    constructor(v: bigint | number | string) {
        if (typeof v === "bigint") this.v = v;
        else if (typeof v === "number") this.v = BigInt(Math.trunc(Number.isFinite(v) ? v : 0));
        else this.v = BigInt(v);
    }
    static valueOf(n: number | bigint): BigInteger { return new BigInteger(typeof n === "bigint" ? n : n); }
    static readonly ZERO = new BigInteger(0n);
    static readonly ONE = new BigInteger(1n);
    static readonly TEN = new BigInteger(10n);
    add(o: BigInteger): BigInteger { return new BigInteger(this.v + o.v); }
    subtract(o: BigInteger): BigInteger { return new BigInteger(this.v - o.v); }
    multiply(o: BigInteger): BigInteger { return new BigInteger(this.v * o.v); }
    divide(o: BigInteger): BigInteger { return new BigInteger(this.v / o.v); }
    mod(o: BigInteger): BigInteger { const r = this.v % o.v; return new BigInteger(r < 0n ? r + o.v : r); }
    remainder(o: BigInteger): BigInteger { return new BigInteger(this.v % o.v); }
    pow(e: number): BigInteger { return new BigInteger(this.v ** BigInt(e)); }
    negate(): BigInteger { return new BigInteger(-this.v); }
    abs(): BigInteger { return new BigInteger(this.v < 0n ? -this.v : this.v); }
    signum(): number { return this.v > 0n ? 1 : this.v < 0n ? -1 : 0; }
    compareTo(o: BigInteger): number { return this.v > o.v ? 1 : this.v < o.v ? -1 : 0; }
    min(o: BigInteger): BigInteger { return this.v <= o.v ? this : o; }
    max(o: BigInteger): BigInteger { return this.v >= o.v ? this : o; }
    equals(o: any): boolean { return o instanceof BigInteger && o.v === this.v; }
    doubleValue(): number { return Number(this.v); }
    floatValue(): number { return Number(this.v); }
    longValue(): number { return Number(BigInt.asIntN(64, this.v)); }
    intValue(): number { return Number(BigInt.asIntN(32, this.v)); }
    toString(radix?: number): string { return this.v.toString(radix); }
    toJSON(): string { return this.v.toString(); }
}

export const JMath = {
    /** Java integer division (truncates toward zero). */
    idiv(a: number, b: number): number {
        if (b === 0) throw new ArithmeticException("/ by zero");
        return Math.trunc(a / b);
    },
    /** Java (int) cast of a double. */
    toInt(x: number): number {
        if (Number.isNaN(x)) return 0;
        if (x >= 2147483647) return 2147483647;
        if (x <= -2147483648) return -2147483648;
        return Math.trunc(x);
    },
};

export const Integer = {
    MAX_VALUE: 2147483647,
    MIN_VALUE: -2147483648,
    // Image ids are resource NAMES in this port ("vacation_park"): pass them through instead of turning them into NaN
    // (that bug hid every action row's picture). Numeric strings still parse.
    valueOf: (x: any) => (typeof x === "string" ? (/^\s*-?\d+\s*$/.test(x) ? parseInt(x, 10) : x) : x),
    parseInt: (s: string) => parseInt(s, 10),
    compare: (a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0),
    toString: (x: number) => String(x),
};
export const Long = { MAX_VALUE: Number.MAX_SAFE_INTEGER, MIN_VALUE: Number.MIN_SAFE_INTEGER, valueOf: (x: any) => x };
export const Float = { valueOf: (x: any) => x, MAX_VALUE: 3.4028235e38 };
export const Double = {
    MAX_VALUE: Number.MAX_VALUE,
    MIN_VALUE: Number.MIN_VALUE,
    valueOf: (x: any) => (typeof x === "string" ? parseFloat(x) : x),
    isNaN: (x: number) => Number.isNaN(x),
    isInfinite: (x: number) => !Number.isFinite(x) && !Number.isNaN(x),
    compare: (a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0),
    parseDouble: (s: string) => parseFloat(s),
};
const JBoolean = { valueOf: (x: any) => !!x, TRUE: true, FALSE: false };
export { JBoolean as Boolean };
export const Character = { isDigit: (c: string) => /[0-9]/.test(c), isLetter: (c: string) => /\p{L}/u.test(c), toUpperCase: (c: string) => c.toUpperCase() };

// ---------------------------------------------------------------- prototype polyfills (Java-style methods)
declare global {
    interface Number { intValue(): number; doubleValue(): number; longValue(): number; floatValue(): number; compareTo(o: number): number; }
    interface String { intValue(): any; contains(s: string): boolean; isEmpty(): boolean; compareTo(o: string): number; equalsIgnoreCase(o: string): boolean; }
    interface Boolean { booleanValue(): boolean; }
    interface StringConstructor { format(fmt: string, ...args: any[]): string; valueOf(x: any): string; }
    interface Array<T> { iterator(): Iterator<T>; }
}
function def(proto: any, name: string, fn: Function) {
    if (!Object.prototype.hasOwnProperty.call(proto, name))
        Object.defineProperty(proto, name, { value: fn, writable: true, configurable: true, enumerable: false });
}
def(Number.prototype, "intValue", function (this: number) { return JMath.toInt(this as any); });
def(Number.prototype, "doubleValue", function (this: number) { return +this; });
def(Number.prototype, "floatValue", function (this: number) { return +this; });
def(Number.prototype, "longValue", function (this: number) { return Math.trunc(+this); });
def(Number.prototype, "compareTo", function (this: number, o: number) { return +this < o ? -1 : +this > o ? 1 : 0; });
// Resource ids are names in this port; Java code calls Integer.intValue() on them.
def(String.prototype, "intValue", function (this: string) { return this.toString(); });
def(String.prototype, "contains", function (this: string, s: string) { return this.includes(s); });
def(String.prototype, "isEmpty", function (this: string) { return this.length === 0; });
def(String.prototype, "compareTo", function (this: string, o: string) { return this < o ? -1 : this > o ? 1 : 0; });
def(String.prototype, "equalsIgnoreCase", function (this: string, o: string) { return o != null && this.toLowerCase() === o.toLowerCase(); });
def(globalThis.Boolean.prototype, "booleanValue", function (this: boolean) { return !!this.valueOf(); });
def(Array.prototype, "iterator", function (this: any[]) { return new ArrayIter(this); });
(String as any).format = (fmt: string, ...args: any[]) => JString.format(fmt, ...args);
(String as any).valueOf = (x: any) => String(x);

export const JString = {
    format(fmt: string, ...args: any[]): string {
        if (args.length === 1 && Array.isArray(args[0]) && !(args[0] instanceof ArrayList)) args = args[0];
        let next = 0;
        return fmt.replace(/%(?:(\d+)\$)?([,\-0+ ]*)(\d+)?(?:\.(\d+))?([sdfxXn%])/g, (m, idx, flags, width, prec, conv) => {
            if (conv === "%") return "%";
            if (conv === "n") return "\n";
            const a = idx ? args[parseInt(idx, 10) - 1] : args[next++];
            let s: string;
            if (conv === "d") {
                const n = a instanceof BigInteger ? a.v : BigInt(Math.trunc(Number(a)));
                s = flags.includes(",") ? n.toLocaleString("en-US") : n.toString();
            } else if (conv === "f") {
                const n = Number(a);
                s = n.toFixed(prec != null ? parseInt(prec, 10) : 6);
                if (flags.includes(",")) s = Number(s).toLocaleString("en-US", { minimumFractionDigits: prec ? +prec : 6, maximumFractionDigits: prec ? +prec : 6 });
            } else if (conv === "x" || conv === "X") {
                s = Number(a).toString(16); if (conv === "X") s = s.toUpperCase();
            } else {
                s = a == null ? "null" : String(a);
            }
            if (width && s.length < +width) s = flags.includes("-") ? s.padEnd(+width) : s.padStart(+width, flags.includes("0") ? "0" : " ");
            return s;
        });
    },
};

// ---------------------------------------------------------------- collections
export interface Iterator<T> { hasNext(): boolean; next(): T; remove?(): void; }
class ArrayIter<T> implements Iterator<T> {
    private i = 0;
    constructor(private a: T[]) {}
    hasNext() { return this.i < this.a.length; }
    next() { if (this.i >= this.a.length) throw new NoSuchElementException(); return this.a[this.i++]; }
    remove() { this.a.splice(--this.i, 1); }
}

export class ArrayList<T = any> extends Array<T> {
    constructor(src?: any) {
        super();
        if (src != null && typeof src !== "number") {
            const it = src instanceof HashSet ? src.toArray() : src;
            for (const x of it) this.push(x);
        }
    }
    static get [Symbol.species]() { return Array; }
    add(a: any, b?: any): boolean {
        if (arguments.length === 2) { this.splice(a, 0, b); return true; }
        this.push(a); return true;
    }
    addAll(a: any, b?: any): boolean {
        if (arguments.length === 2) { this.splice(a, 0, ...toArr(b)); return true; }
        const arr = toArr(a); for (const x of arr) this.push(x); return arr.length > 0;
    }
    get(i: number): T { if (i < 0 || i >= this.length) throw new IndexOutOfBoundsException("Index: " + i); return this[i]; }
    set(i: number, v: T): T { const o = this[i]; this[i] = v; return o; }
    size(): number { return this.length; }
    isEmpty(): boolean { return this.length === 0; }
    contains(o: any): boolean { return this.some((x) => Intrinsics.areEqual(x, o)); }
    remove(o: any): boolean {
        const i = this.findIndex((x) => Intrinsics.areEqual(x, o));
        if (i >= 0) { this.splice(i, 1); return true; }
        return false;
    }
    removeAt(i: number): T { return this.splice(i, 1)[0]; }
    removeAll(c: any): boolean { let ch = false; for (const x of toArr(c)) while (this.remove(x)) ch = true; return ch; }
    clear(): void { this.length = 0; }
    toArray(_?: any): T[] { return Array.from(this); }
    getFirst(): T { if (!this.length) throw new NoSuchElementException(); return this[0]; }
    getLast(): T { if (!this.length) throw new NoSuchElementException(); return this[this.length - 1]; }
    addFirst(x: T): void { this.unshift(x); }
    addLast(x: T): void { this.push(x); }
    removeFirst(): T { if (!this.length) throw new NoSuchElementException(); return this.shift() as T; }
    removeLast(): T { if (!this.length) throw new NoSuchElementException(); return this.pop() as T; }
    peek(): T | null { return this.length ? this[0] : null; }
    poll(): T | null { return this.length ? (this.shift() as T) : null; }
    offer(x: T): boolean { this.push(x); return true; }
    subList(a: number, b: number): ArrayList<T> { return new ArrayList(this.slice(a, b)); }
    equals(o: any): boolean { return Array.isArray(o) && o.length === this.length && this.every((x, i) => Intrinsics.areEqual(x, o[i])); }
    toJSON(): any[] { return Array.from(this); }
    toString(): string { return "[" + this.join(", ") + "]"; }
}
function toArr(x: any): any[] {
    if (x == null) return [];
    if (Array.isArray(x)) return x;
    if (x instanceof HashSet) return x.toArray();
    if (typeof x[Symbol.iterator] === "function") return Array.from(x);
    throw new Error("not iterable: " + x);
}

export class Entry<K, V> {
    constructor(private k: K, private v: V, private m?: HashMap<K, V>) {}
    getKey(): K { return this.k; }
    getValue(): V { return this.v; }
    setValue(v: V): V { const o = this.v; this.v = v; this.m?.put(this.k, v); return o; }
    component1() { return this.k; }
    component2() { return this.v; }
}

function keyOf(k: any): any {
    if (k instanceof BigInteger) return "BI:" + k.v.toString();
    return k;
}
export class HashMap<K = any, V = any> {
    private m = new Map<any, [K, V]>();
    constructor(src?: any) {
        if (src instanceof HashMap) for (const e of src.entrySet()) this.put(e.getKey(), e.getValue());
    }
    put(k: K, v: V): V | null { const o = this.get(k); this.m.set(keyOf(k), [k, v]); return o; }
    get(k: K): V | null { const e = this.m.get(keyOf(k)); return e ? e[1] : null; }
    getOrDefault(k: K, d: V): V { return this.containsKey(k) ? (this.get(k) as V) : d; }
    containsKey(k: K): boolean { return this.m.has(keyOf(k)); }
    containsValue(v: V): boolean { for (const [, x] of this.m.values()) if (Intrinsics.areEqual(x, v)) return true; return false; }
    remove(k: K): V | null { const o = this.get(k); this.m.delete(keyOf(k)); return o; }
    size(): number { return this.m.size; }
    isEmpty(): boolean { return this.m.size === 0; }
    clear(): void { this.m.clear(); }
    keySet(): HashSet<K> { return new HashSet(Array.from(this.m.values(), (e) => e[0])); }
    values(): ArrayList<V> { return new ArrayList(Array.from(this.m.values(), (e) => e[1])); }
    entrySet(): ArrayList<Entry<K, V>> { return new ArrayList(Array.from(this.m.values(), (e) => new Entry(e[0], e[1], this))); }
    putAll(o: HashMap<K, V>): void { for (const e of o.entrySet()) this.put(e.getKey(), e.getValue()); }
    [Symbol.iterator]() { return this.entrySet()[Symbol.iterator](); }
}

export class HashSet<T = any> {
    private m = new Map<any, T>();
    constructor(src?: any) { if (src != null && typeof src !== "number") for (const x of toArr(src)) this.add(x); }
    add(x: T): boolean { const k = keyOf(x); if (this.m.has(k)) return false; this.m.set(k, x); return true; }
    addAll(c: any): boolean { let ch = false; for (const x of toArr(c)) ch = this.add(x) || ch; return ch; }
    contains(x: T): boolean { return this.m.has(keyOf(x)); }
    remove(x: T): boolean { return this.m.delete(keyOf(x)); }
    size(): number { return this.m.size; }
    isEmpty(): boolean { return this.m.size === 0; }
    clear(): void { this.m.clear(); }
    toArray(_?: any): T[] { return Array.from(this.m.values()); }
    iterator(): Iterator<T> { return new ArrayIter(this.toArray()); }
    [Symbol.iterator]() { return this.m.values(); }
}

export class Pair<A = any, B = any> {
    constructor(public first: A, public second: B) {}
    getFirst(): A { return this.first; }
    getSecond(): B { return this.second; }
    component1(): A { return this.first; }
    component2(): B { return this.second; }
    equals(o: any) { return o instanceof Pair && Intrinsics.areEqual(o.first, this.first) && Intrinsics.areEqual(o.second, this.second); }
    toString() { return `(${this.first}, ${this.second})`; }
}
export class Triple<A = any, B = any, C = any> {
    constructor(public first: A, public second: B, public third: C) {}
    getFirst() { return this.first; }
    getSecond() { return this.second; }
    getThird() { return this.third; }
}

export interface Function0<R = any> { invoke(): R; }
export interface Function1<P = any, R = any> { invoke(p: P): R; }
export interface Function2<P = any, Q = any, R = any> { invoke(p: P, q: Q): R; }
export interface Function3<P = any, Q = any, S = any, R = any> { invoke(p: P, q: Q, s: S): R; }
export interface Comparator<T = any> { compare(a: T, b: T): number; }
export const Unit = { INSTANCE: undefined as any };

export namespace Ref {
    export class ObjectRef<T = any> { element: T = null as any; }
    export class IntRef { element = 0; }
    export class DoubleRef { element = 0; }
    export class LongRef { element = 0; }
    export class FloatRef { element = 0; }
    export class BooleanRef { element = false; }
}

// ---------------------------------------------------------------- exceptions
export class RuntimeException extends Error { constructor(msg?: string) { super(msg); } }
export class NoWhenBranchMatchedException extends RuntimeException {}
export class TypeCastException extends RuntimeException {}
export class IllegalStateException extends RuntimeException {}
export class IllegalArgumentException extends RuntimeException {}
export class NullPointerException extends RuntimeException {}
export class UnsupportedOperationException extends RuntimeException {}
export class IndexOutOfBoundsException extends RuntimeException {}
export class NoSuchElementException extends RuntimeException {}
export class ArithmeticException extends RuntimeException {}
export class KotlinNothingValueException extends RuntimeException {}
export { RuntimeException as Exception };

// ---------------------------------------------------------------- Kotlin stdlib helpers
const rnd = () => Math.random();
function randInt(n: number) { return Math.floor(rnd() * n); }

export const Intrinsics = {
    checkParameterIsNotNull(_v: any, _n: string) {},
    checkExpressionValueIsNotNull(_v: any, _n: string) {},
    checkNotNull(v: any, _n?: string) {},
    checkNotNullExpressionValue(_v: any, _n: string) {},
    throwNpe(): never { throw new NullPointerException(); },
    throwUninitializedPropertyAccessException(n: string): never { throw new IllegalStateException("lateinit property " + n + " has not been initialized"); },
    areEqual(a: any, b: any): boolean {
        if (a === b) return true;
        if (a == null || b == null) return a == b;
        if (typeof a === "object" && typeof a.equals === "function") return a.equals(b);
        if (typeof a === "number" && typeof b === "number") return a === b;
        return false;
    },
    hashCode(a: any): number {
        const s = String(a); let h = 0;
        for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
        return h;
    },
    compare(a: number, b: number) { return a < b ? -1 : a > b ? 1 : 0; },
    androidStub(name: string): any {
        return new Proxy({}, { get: () => () => undefined });
    },
};

export const TuplesKt = { to: <A, B>(a: A, b: B) => new Pair(a, b) };

export const MapsKt = {
    mapOf(...pairs: any[]): HashMap {
        const m = new HashMap();
        const list = pairs.length === 1 && Array.isArray(pairs[0]) ? pairs[0] : pairs;
        for (const p of list) m.put(p.first, p.second);
        return m;
    },
    mutableMapOf(...pairs: any[]): HashMap { return MapsKt.mapOf(...pairs); },
    hashMapOf(...pairs: any[]): HashMap { return MapsKt.mapOf(...pairs); },
    mapCapacity(n: number) { return n; },
};

export const SetsKt = {
    setOf: (...xs: any[]) => new HashSet(xs.length === 1 && Array.isArray(xs[0]) ? xs[0] : xs),
    mutableSetOf: (...xs: any[]) => new HashSet(xs.length === 1 && Array.isArray(xs[0]) ? xs[0] : xs),
};

export const CollectionsKt = {
    addAll(dest: any, src: any): boolean { return dest.addAll(toArr(src)); },
    first(c: any, pred?: Function1<any, boolean>): any {
        const a = toArr(c);
        if (pred) { for (const x of a) if (pred.invoke(x)) return x; throw new NoSuchElementException("no match"); }
        if (!a.length) throw new NoSuchElementException("List is empty.");
        return a[0];
    },
    firstOrNull(c: any, pred?: Function1<any, boolean>): any {
        const a = toArr(c);
        if (pred) { for (const x of a) if (pred.invoke(x)) return x; return null; }
        return a.length ? a[0] : null;
    },
    last(c: any): any { const a = toArr(c); if (!a.length) throw new NoSuchElementException("List is empty."); return a[a.length - 1]; },
    lastOrNull(c: any): any { const a = toArr(c); return a.length ? a[a.length - 1] : null; },
    toCollection(c: any, dest: any): any { for (const x of toArr(c)) dest.add(x); return dest; },
    random(c: any, _r?: any): any {
        const a = toArr(c);
        if (!a.length) throw new NoSuchElementException("Collection is empty.");
        return a[randInt(a.length)];
    },
    shuffled(c: any): ArrayList { const a = [...toArr(c)]; for (let i = a.length - 1; i > 0; i--) { const j = randInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return new ArrayList(a); },
    sortedWith(c: any, cmp: Comparator): ArrayList { return new ArrayList([...toArr(c)].sort((x, y) => cmp.compare(x, y))); },
    sortWith(c: any, cmp: Comparator): void { const s = [...toArr(c)].sort((x, y) => cmp.compare(x, y)); for (let i = 0; i < s.length; i++) c[i] = s[i]; },
    sumOfDouble(c: any): number { let s = 0; for (const x of toArr(c)) s += Number(x); return s; },
    sumOfInt(c: any): number { return CollectionsKt.sumOfDouble(c); },
    mutableListOf(...xs: any[]): ArrayList { return new ArrayList(xs); },
    listOf(...xs: any[]): ArrayList { return new ArrayList(xs.length === 1 && Array.isArray(xs[0]) ? xs[0] : xs); },
    arrayListOf(...xs: any[]): ArrayList { return new ArrayList(xs); },
    emptyList(): ArrayList { return new ArrayList(); },
    collectionSizeOrDefault(c: any, d: number): number { return Array.isArray(c) ? c.length : d; },
    toList(c: any): ArrayList { return new ArrayList(toArr(c)); },
    toMutableList(c: any): ArrayList { return new ArrayList(toArr(c)); },
    reversed(c: any): ArrayList { return new ArrayList([...toArr(c)].reverse()); },
    getOrNull(c: any, i: number): any { const a = toArr(c); return i >= 0 && i < a.length ? a[i] : null; },
    getLastIndex(c: any): number { return toArr(c).length - 1; },
    joinToString(c: any, sep = ", "): string { return toArr(c).join(sep); },
    throwIndexOverflow(): never { throw new ArithmeticException("Index overflow has happened."); },
    distinct(c: any): ArrayList { return new ArrayList(new HashSet(toArr(c)).toArray()); },
    take(c: any, n: number): ArrayList { return new ArrayList(toArr(c).slice(0, n)); },
    minus(c: any, x: any): ArrayList { const r = new ArrayList(toArr(c)); r.remove(x); return r; },
    plus(c: any, x: any): ArrayList { const r = new ArrayList(toArr(c)); if (Array.isArray(x)) r.addAll(x); else r.add(x); return r; },
    contains(c: any, x: any): boolean { return toArr(c).some((y) => Intrinsics.areEqual(x, y)); },
    indexOf(c: any, x: any): number { return toArr(c).findIndex((y) => Intrinsics.areEqual(x, y)); },
};

export const ArraysKt = {
    random(a: any[], _r?: any): any { if (!a.length) throw new NoSuchElementException("Array is empty."); return a[randInt(a.length)]; },
    toCollection(a: any[], dest: any): any { for (const x of a) dest.add(x); return dest; },
    sortedWith(a: any[], cmp: Comparator): ArrayList { return new ArrayList([...a].sort((x, y) => cmp.compare(x, y))); },
    toMutableList(a: any[]): ArrayList { return new ArrayList(a); },
    toList(a: any[]): ArrayList { return new ArrayList(a); },
    reversedArray(a: any[]): any[] { return [...a].reverse(); },
    reversed(a: any[]): ArrayList { return new ArrayList([...a].reverse()); },
    indexOf(a: any[], x: any): number { return a.findIndex((y) => Intrinsics.areEqual(x, y)); },
    contains(a: any[], x: any): boolean { return a.some((y) => Intrinsics.areEqual(x, y)); },
    getOrNull(a: any[], i: number): any { return i >= 0 && i < a.length ? a[i] : null; },
    first(a: any[]): any { if (!a.length) throw new NoSuchElementException("Array is empty."); return a[0]; },
    last(a: any[]): any { if (!a.length) throw new NoSuchElementException("Array is empty."); return a[a.length - 1]; },
    getLastIndex(a: any[]): number { return a.length - 1; },
    contentDeepEquals(a: any[], b: any[]): boolean { return a.length === b.length && a.every((x, i) => Intrinsics.areEqual(x, b[i])); },
    asList(a: any[]): ArrayList { return new ArrayList(a); },
    filterNotNull(a: any[]): ArrayList { return new ArrayList(a.filter((x) => x != null)); },
    sum(a: number[]): number { return a.reduce((s, x) => s + x, 0); },
};

export const Arrays = {
    copyOf(a: any[], n: number): any[] { const r = a.slice(0, n); while (r.length < n) r.push(null); return r; },
    toString(a: any[]): string { return "[" + a.join(", ") + "]"; },
    asList(...a: any[]): ArrayList { return new ArrayList(a.length === 1 && Array.isArray(a[0]) ? a[0] : a); },
    fill(a: any[], v: any) { a.fill(v); },
};
export const Collections = {
    shuffle(a: any[]) { for (let i = a.length - 1; i > 0; i--) { const j = randInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } },
    emptyList: () => new ArrayList(),
    sort(a: any[], cmp?: Comparator) { a.sort(cmp ? (x, y) => cmp.compare(x, y) : undefined); },
};

export const ComparisonsKt = {
    compareValues(a: any, b: any): number {
        if (a === b) return 0;
        if (a == null) return -1;
        if (b == null) return 1;
        if (typeof a.compareTo === "function") return a.compareTo(b);
        return a < b ? -1 : a > b ? 1 : 0;
    },
};

export const StringsKt = {
    capitalize(s: string): string { return s.length ? s[0].toUpperCase() + s.slice(1) : s; },
    decapitalize(s: string): string { return s.length ? s[0].toLowerCase() + s.slice(1) : s; },
    trim(s: any): string { return String(s).trim(); },
    isBlank(s: string): boolean { return s == null || s.trim().length === 0; },
    contains(s: string, x: string, ignoreCase = false): boolean { return ignoreCase ? s.toLowerCase().includes(x.toLowerCase()) : s.includes(x); },
    replace(s: string, a: string, b: string, _ic = false): string { return s.split(a).join(b); },
    replace$default(s: string, a: string, b: string, _ic: boolean, _m: number, _o: any): string { return s.split(a).join(b); },
    split$default(s: string, delims: string[], _ic: boolean, _limit: number, _m: number, _o: any): ArrayList<string> {
        let parts = [s];
        for (const d of delims) parts = parts.flatMap((p) => p.split(d));
        return new ArrayList(parts);
    },
    toIntOrNull(s: string): number | null { const n = parseInt(s, 10); return Number.isNaN(n) ? null : n; },
    repeat(s: string, n: number) { return s.repeat(n); },
    startsWith$default(s: string, p: string) { return s.startsWith(p); },
    endsWith$default(s: string, p: string) { return s.endsWith(p); },
};

export const MathKt = {
    roundToInt(x: number): number { if (Number.isNaN(x)) throw new IllegalArgumentException("Cannot round NaN value."); return JMath.toInt(Math.round(x)); },
    truncate(x: number): number { return Math.trunc(x); },
    getSign(x: number): number { return Math.sign(x); },
};
export const RangesKt = {
    coerceIn(x: number, lo: number, hi: number) { return Math.min(Math.max(x, lo), hi); },
    coerceAtLeast(x: number, lo: number) { return Math.max(x, lo); },
    coerceAtMost(x: number, hi: number) { return Math.min(x, hi); },
};

/** kotlin.random.Random.Default */
export const Random = {
    INSTANCE: {
        nextInt(a?: number, b?: number): number {
            if (a == null) return (Math.random() * 4294967296) | 0;
            if (b == null) return randInt(a);
            return a + randInt(b - a);
        },
        nextDouble(): number { return Math.random(); },
        nextBoolean(): boolean { return Math.random() < 0.5; },
    },
};

export class StringBuilder {
    private s: string;
    constructor(init?: any) { this.s = init == null || typeof init === "number" ? "" : String(init); }
    append(x: any): StringBuilder { this.s += x == null ? "null" : String(x); return this; }
    insert(i: number, x: any): StringBuilder { this.s = this.s.slice(0, i) + String(x) + this.s.slice(i); return this; }
    get length(): number { return this.s.length; }
    setLength(n: number) { this.s = this.s.slice(0, n); }
    deleteCharAt(i: number) { this.s = this.s.slice(0, i) + this.s.slice(i + 1); return this; }
    reverse() { this.s = [...this.s].reverse().join(""); return this; }
    toString(): string { return this.s; }
}

export const System = { currentTimeMillis: () => Date.now(), nanoTime: () => Math.round(performance.now() * 1e6), out: { println: (x: any) => console.log(x), print: (x: any) => console.log(x) } };
export const UUID = {
    randomUUID() { const s = crypto.randomUUID(); return { toString: () => s }; },
    fromString(s: string) { return { toString: () => s }; },
};
export const Log = { d: (...a: any[]) => console.debug(...a), e: (...a: any[]) => console.error(...a), i: (...a: any[]) => console.info(...a), w: (...a: any[]) => console.warn(...a) };

// ---------------------------------------------------------------- Android resources & rich text
/** R.string.X -> "X", R.drawable.X -> "X", etc. Resource ids are their names in this port. */
const nameProxy = new Proxy({}, { get: (_t, k) => k });
export const R: any = new Proxy({}, { get: () => nameProxy });

export const Typeface = { NORMAL: 0, BOLD: 1, ITALIC: 2, BOLD_ITALIC: 3, DEFAULT: "default", DEFAULT_BOLD: "bold" };

export type SpanStyle =
    | { kind: "style"; style: number }
    | { kind: "color"; color: string }
    | { kind: "relsize"; size: number }
    | { kind: "abssize"; size: number }
    | { kind: "font"; font: string }
    | { kind: "icon"; image: string };
export class StyleSpan { readonly span: SpanStyle; constructor(style: number) { this.span = { kind: "style", style }; } }
export class ForegroundColorSpan { readonly span: SpanStyle; constructor(color: any) { this.span = { kind: "color", color: Color.toCss(color) }; } }
export class RelativeSizeSpan { readonly span: SpanStyle; constructor(size: number) { this.span = { kind: "relsize", size }; } }
export class AbsoluteSizeSpan { readonly span: SpanStyle; constructor(size: number) { this.span = { kind: "abssize", size }; } }
export class CustomTypefaceSpan { readonly span: SpanStyle; constructor(_family: string, font: any) { this.span = { kind: "font", font: String(font) }; } }
export class ImageSpan { readonly span: SpanStyle; constructor(_ctx: any, image: any) { this.span = { kind: "icon", image: String(image) }; } }

export interface Span { what: SpanStyle; start: number; end: number; }

/** Android SpannableStringBuilder: text + ranges of styles. Rendered to HTML by the UI. */
export class SpannableStringBuilder {
    text = "";
    spans: Span[] = [];
    constructor(init?: any) { if (init != null) this.append(init); }
    append(x: any, what?: any, _flags?: number): SpannableStringBuilder {
        const start = this.text.length;
        if (x instanceof SpannableStringBuilder) {
            this.text += x.text;
            for (const sp of x.spans) this.spans.push({ what: sp.what, start: sp.start + start, end: sp.end + start });
        } else {
            this.text += x == null ? "null" : String(x);
        }
        if (what) this.setSpan(what, start, this.text.length, 0);
        return this;
    }
    setSpan(what: any, start: number, end: number, _flags: number): void {
        const s: SpanStyle = what && what.span ? what.span : what;
        if (s) this.spans.push({ what: s, start, end });
    }
    insert(i: number, x: any): SpannableStringBuilder {
        const add = x instanceof SpannableStringBuilder ? x : new SpannableStringBuilder(String(x));
        const n = add.text.length;
        this.text = this.text.slice(0, i) + add.text + this.text.slice(i);
        for (const sp of this.spans) { if (sp.start >= i) sp.start += n; if (sp.end > i) sp.end += n; }
        for (const sp of add.spans) this.spans.push({ what: sp.what, start: sp.start + i, end: sp.end + i });
        return this;
    }
    get length(): number { return this.text.length; }
    clear(): void { this.text = ""; this.spans = []; }
    toString(): string { return this.text; }
    equals(o: any): boolean { return o instanceof SpannableStringBuilder && o.text === this.text; }
}
export { SpannableStringBuilder as SpannableString };

export const Color = {
    BLACK: "#000000", WHITE: "#ffffff", RED: "#ff0000", GREEN: "#00ff00", GRAY: "#888888", TRANSPARENT: "transparent",
    parseColor(s: string): string { return s; },
    rgb(r: number, g: number, b: number): string { return `rgb(${r},${g},${b})`; },
    argb(a: number, r: number, g: number, b: number): string { return `rgba(${r},${g},${b},${a / 255})`; },
    toCss(c: any): string {
        if (typeof c === "string") return c;
        if (typeof c === "number") { const u = c >>> 0; const a = (u >>> 24) & 255; return `rgba(${(u >>> 16) & 255},${(u >>> 8) & 255},${u & 255},${(a / 255).toFixed(3)})`; }
        return String(c);
    },
};

// Android plumbing the game logic touches but which is meaningless on desktop.
export const Uri = { parse: (s: string) => ({ url: s, toString: () => s }) };
export class Intent { constructor(public action?: any, public data?: any) {} putExtra(..._a: any[]) { return this; } setPackage(..._a: any[]) { return this; } addFlags(..._a: any[]) { return this; } setType(..._a: any[]) { return this; } }
export const ContextCompat = { startActivity: (_c: any, intent: any, _opts?: any) => { const url = intent?.data?.url; if (url) window.open(url, "_blank"); } };
export type Context = any;
export const StringCompanionObject = { INSTANCE: {} };
export const TypeIntrinsics = {
    asMutableCollection: (x: any) => x, asMutableList: (x: any) => x, asMutableMap: (x: any) => x,
    isMutableList: (x: any) => Array.isArray(x), isFunctionOfArity: (x: any, _n: number) => !!x && typeof x.invoke === "function",
};
export const Layout = { Alignment: { ALIGN_NORMAL: "left", ALIGN_CENTER: "center", ALIGN_OPPOSITE: "right" } };
/** Bug reporter SDK on Android; nothing to do on desktop. */
export const Buglife = { showReporter() {} };
