// Hand-ported from Utils/Utils.java (Android plumbing replaced by the desktop UI bridge).
import { ArrayList, BigInteger, Pair, SpannableStringBuilder, Intent, JMath } from "../runtime";
import strings from "../data/strings.json";
import colors from "../data/colors.json";
import { ExtensionsKt } from "./ExtensionsKt";
import { Constants } from "./Constants";
import type { IProbableEvent } from "../Enums/IProbableEvent";
import type { GenericListType } from "../Fragments/GenericListType";
import { UIBridge } from "../ui/bridge";

const STR: Record<string, string> = strings as any;
const COL: Record<string, string> = colors as any;

export class Utils {
    /** jadx refers to Kotlin companion statics as Utils.Companion.x */
    static get Companion(): typeof Utils { return Utils; }
    static INSTANCE: Utils;

    returnFirstIfTrue<T>(truth: boolean, first: T, second: T): T {
        return truth ? first : second;
    }
    /** R.string.X ids are the string names in this port. */
    getString(id: any): string {
        const s = STR[id];
        if (s === undefined) {
            console.warn("missing string", id);
            return String(id);
        }
        return s;
    }
    /** R.color.X -> CSS colour. */
    getColor(id: any): string {
        return COL[id] ?? (typeof id === "string" && id.startsWith("#") ? id : "#2b2b2b");
    }
    min(first: BigInteger, second: BigInteger): BigInteger {
        return first.compareTo(second) < 0 ? first : second;
    }
    max(first: BigInteger, second: BigInteger): BigInteger {
        return first.compareTo(second) > 0 ? first : second;
    }
    broadcastIntent(intent: Intent): void {
        UIBridge.broadcast(String(intent?.action ?? ""));
    }
    reloadGenericList(type: GenericListType): void {
        UIBridge.reloadGenericList(type);
    }
    getScreenShot(_view: any): any {
        return null;
    }
    static navigateTo$default(companion: Utils, action: GenericListType, key: string | null, animated: boolean, mask: number, _o: any): void {
        if ((mask & 2) !== 0) key = null;
        if ((mask & 4) !== 0) animated = true;
        companion.navigateTo(action, key, animated);
    }
    navigateTo(action: GenericListType, activityKey: string | null, animated: boolean): void {
        UIBridge.navigateTo(action, activityKey ?? "", animated);
    }
    navigationBackToMainGame(): void {
        UIBridge.backToMainGame();
    }
    triggerNewGameStart(): void {
        this.navigationBackToMainGame();
        Utils.navigateTo$default(this, UIBridge.GenericListType().scenarioSelection, null, false, 2, null);
    }
}

export namespace Utils {
    export class Strings {
        static INSTANCE: Strings;
        static get Companion(): any { return Strings; }
        formatWithDash(name: string, value: string): string { return name + " - " + value; }
        formatWithColon(name: string, value: string): string { return name + ": " + value; }
        formatWithPerWeek(value: string): string { return value + "/" + Utils.INSTANCE.getString("Common_Week"); }
        getRequiresString(value: string): string { return this.formatWithColon(Utils.INSTANCE.getString("Job_Action_Requires"), value); }
    }

    export class Random {
        static INSTANCE: Random;
        static get Companion(): any { return Random; }
        randomValueWithinRange(min: number, max: number): number {
            return min + JMath.toInt(Math.random() * (max - min));
        }
        chooseFromPool(pool: ArrayList<IProbableEvent>, numberToChoose?: number): any {
            if (numberToChoose === undefined) {
                const r = this.chooseFromPool(pool, 1) as ArrayList<IProbableEvent>;
                if (r.length === 0) throw new Error("chooseFromPool: empty result");
                return r[0];
            }
            const pairs: Pair<IProbableEvent, number>[] = [];
            for (const e of pool) pairs.push(new Pair(e, e.getRelativeProbability()));
            return this.chooseFromPoolWithProbability(pairs, numberToChoose);
        }
        /**
         * Weighted pick. The decompiled original looped forever if the roll missed every
         * bucket; with integer rolls that can't happen except via float edge cases, so we
         * fall back to the last bucket instead of hanging.
         */
        chooseFromPoolWithProbability(pool: Pair<IProbableEvent, number>[], numberToChoose: number): ArrayList<IProbableEvent> {
            const out = new ArrayList<IProbableEvent>();
            let total = 0;
            for (const p of pool) total += p.getSecond();
            const max = JMath.toInt(total);
            for (let n = 0; n < numberToChoose; n++) {
                const roll = this.randomValueWithinRange(0, max);
                let acc = 0;
                let picked: IProbableEvent | null = null;
                for (const p of pool) {
                    if (roll >= acc && roll <= acc + p.getSecond()) { picked = p.getFirst(); break; }
                    acc += p.getSecond();
                }
                if (picked == null && pool.length) picked = pool[pool.length - 1].getFirst();
                if (picked != null) out.add(picked);
            }
            return out;
        }
        rollWithProbability(probability: number): boolean {
            return Math.random() < probability;
        }
    }

    export class ViewModel {
        static INSTANCE: ViewModel;
        static get Companion(): any { return ViewModel; }
        getPropertyListViewModel(properties: Pair<string, string>[]): any {
            const sb = new SpannableStringBuilder("");
            properties.forEach((pair, i) => {
                ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(sb, pair.first + ": ", null, null, null, 14, null), pair.second, null, null, null, 14, null);
                if (i < properties.length - 1) ExtensionsKt.appendNewline(sb);
            });
            return UIBridge.makePropertyList(sb);
        }
    }

    export class IntentUtils {
        static INSTANCE: IntentUtils;
        static get Companion(): any { return IntentUtils; }
        isIntentAvailable(_c: any, _i: any): boolean { return true; }
        getOpenURLIntent(url: string): Intent { return new Intent("android.intent.action.VIEW", { url, toString: () => url }); }
        getShareTextIntent(text: string): Intent { return new Intent("share", { text }); }
        getShareAppIntent(): Intent { return new Intent("share", { text: "" }); }
    }

    export class Storage {
        static INSTANCE: Storage;
        static get Companion(): any { return Storage; }
        saveImageToDisk(_b: any, _n: string): any { return null; }
        readFile(_c: any, fileName: string): string | null { return UIBridge.readFile(fileName); }
        writeFile(_c: any, text: string, fileName: string): void { UIBridge.writeFile(fileName, text); }
    }

    export class Screen {
        static INSTANCE: Screen;
        static get Companion(): any { return Screen; }
        hasNotchOrRoundedScreen(_v: any): boolean { return false; }
        getNotchHeight(_v: any): number { return 0; }
        convertDpToPixel(dp: number): number { return dp; }
    }

    export class Share {
        static INSTANCE: Share;
        static get Companion(): any { return Share; }
        shareCurrentScreenOnInstagram(): void {}
        shareCurrentScreenshot(_t: string): void {}
    }

    export class Time {
        static INSTANCE: Time;
        static get Companion(): any { return Time; }
        currentUnixTimestamp(): number { return Math.floor(Date.now() / 1000); }
    }

    export class MathExtension {
        static INSTANCE: MathExtension;
        static get Companion(): any { return MathExtension; }
        min(a: BigInteger, b: BigInteger): BigInteger { return a.compareTo(b) < 0 ? a : b; }
        max(a: BigInteger, b: BigInteger): BigInteger { return a.compareTo(b) > 0 ? a : b; }
    }
}

Utils.INSTANCE = new Utils();
Utils.Strings.INSTANCE = new Utils.Strings();
Utils.Random.INSTANCE = new Utils.Random();
Utils.ViewModel.INSTANCE = new Utils.ViewModel();
Utils.IntentUtils.INSTANCE = new Utils.IntentUtils();
Utils.Storage.INSTANCE = new Utils.Storage();
Utils.Screen.INSTANCE = new Utils.Screen();
Utils.Share.INSTANCE = new Utils.Share();
Utils.Time.INSTANCE = new Utils.Time();
Utils.MathExtension.INSTANCE = new Utils.MathExtension();
void Constants;
