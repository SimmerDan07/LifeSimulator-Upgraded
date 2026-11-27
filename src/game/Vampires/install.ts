// v0.35.0 "Vampires Reborn": wires the new layers into the Vampire lifepath (called from GameStateManager.init).
import { Vampire } from "../Lifepaths/Vampire";
import { LOVE_ACTIONS } from "../Social/LoveActions";
import { SUBSCRIPTIONS } from "../Managers/Subscriptions";
import { Generations } from "../Managers/Generations";
import { Reborn, img } from "./Reborn";
import { Becoming, setCourtRef } from "./Becoming";
import { Night, Court, addSupplies, supplyRate } from "./Night";
import { Bonds, NIGHT_LOVE_ACTIONS, setGenerationsRef } from "./Bonds";
import { lineOf } from "./VData";
import { WEATHER } from "./VData";

let installed = false;
export function installVampires() {
    if (installed) return;
    installed = true;
    setCourtRef(Court);
    addSupplies();
    const V: any = Vampire;
    V.hooks.tick = (p: any) => { const r = Reborn.peek(p); if (r) r.bloodAgeWeeks += p?.vampire?.inTorpor ? 0.5 : 1; };
    V.hooks.week = (p: any) => { Night.week(p); Bonds.week(p); };
    V.hooks.rate = (p: any, d: any, t: number) => supplyRate(p, d, t);
    V.hooks.fight = (p: any) => {
        const r = Reborn.peek(p);
        if (!r) return 0;
        return (r.line === "ironblood" ? 0.2 : 0) + (Vampire.has("wolfForm", p) ? 0.3 : 0) + (r.lair.includes("exit") ? 0.15 : 0) - (r.sunburnWeeks > 0 ? 0.2 : 0);
    };
    V.hooks.gain = () => Reborn.gainFactor();
    V.hooks.exposed = (p: any, outdoor: boolean, shift: boolean) => Reborn.exposed(p, outdoor, shift);
    V.hooks.sunNote = (p: any) => { const [h, v] = Reborn.sunCost(p); const w = WEATHER[Reborn.weather(p)].title; return h || v ? `Daytime (${w}): −${h} happiness, −${v} Vitality for a vampire\n` : `Daytime (${w}): safe for a vampire this week\n`; };
    V.hooks.torpor = (p: any, kind: any) => Reborn.torpor(p, kind);
    V.hooks.risen = (p: any) => { Reborn.converting = true; try { Reborn.st(p); } finally { Reborn.converting = false; } Becoming.risen(p); };
    Reborn.convertHook = (p: any) => Becoming.convert(p);
    V.hooks.human = (p: any) => Becoming.maybeDyingOffer(p);
    V.maybeStranger = (p: any, event: any) => Becoming.nightOut(p, event);
    V.tell = (p: any, t: any) => Bonds.tell(p, t);
    V.onFamilyDeath = (person: any) => Bonds.grief(person);
    const dating = V.datingMultiplier;
    V.datingMultiplier = () => dating() * Bonds.datingFactor();
    // the Love tab: the night's actions, and siring with its new rules
    for (const d of NIGHT_LOVE_ACTIONS) if (!LOVE_ACTIONS.some((x) => x.id === d.id)) LOVE_ACTIONS.push(d);
    const turn = LOVE_ACTIONS.find((x) => x.id === "turn");
    if (turn) {
        turn.lock = (t: any, p: any) => Bonds.turnLock(p, t);
        turn.note = (t: any) => `${t.getFirstName()} becomes your childe in the ${Reborn.line().title} bloodline and stops ageing. Costs ${Vampire.turnCost} blood power${t.getRelationshipProgress() < 500 && !Bonds ? "" : ""}. ${t.getRelationshipProgress() < 500 ? "They don't want this: turning them anyway costs Humanity and Standing.\n" : "\n"}`;
        turn.run = (t: any, p: any) => Bonds.turn(p, t);
    }
    // one place for blood: Blood Bank Delivery is now a blood supply (existing subscribers are moved over once)
    const bank = SUBSCRIPTIONS.find((d) => d.id === "bloodBank");
    if (bank) bank.show = () => false;
    if (!SUBSCRIPTIONS.some((d) => d.id === "spf999"))
        SUBSCRIPTIONS.push({ id: "spf999", group: "Lifepaths", title: "SPF-999 Sunscreen", image: img("icon_vamp_weather"), weekly: 60, mods: [0, 0, 0], minAge: 0,
            show: (p: any) => Vampire.isVampire(p), blurb: "Industrial-strength sunscreen, delivered: the sun hurts a vampire 30% less." } as any);
    Generations.heirHooks.push((parent: any, heir: any) => Bonds.heir(parent, heir));
    // play on as your childe when your vampire life ends
    setGenerationsRef(Generations);
    Generations.altHeirs.push({
        title: "Your Childer",
        list: (parent: any) => Bonds.heirs(parent),
        sub: (x: any, parent: any) => { const y = Bonds.childeYears(parent, x); return `${x.getAgeInYears()} forever · ${lineOf(Reborn.peek(parent)?.line).title} · ${y} year${y === 1 ? "" : "s"} of blood · keeps the bloodline, the court and the Vault`; },
        play: (x: any, parent: any) => Bonds.continueAsChilde(parent, x),
    });
}
