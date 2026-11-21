// v0.30.0 One-night stands (Love tab). Adults only, and only when the player chooses it.
// - You meet someone (18+, the sex you're attracted to) and choose: protection, no protection, or never mind.
// - A man and a woman can make a baby: 2% with protection, 15% without. Not if you're a vampire (dead), infertile,
//   already expecting, or the woman is over 45.
//   - You're the woman: you're pregnant (the game's own pregnancy; due in 40 weeks), and the father is on record.
//   - You're the man: a few weeks later she tracks you down; when the baby is born, they join your family.
// - With a partner it's cheating: they may find out (−40 relationship, upset, and maybe they leave you), and they
//   will be hurt again if a baby comes of it.
// - Famous? The tabloids notice.
import { R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Person } from "../Managers/Person";
import { Modifiers } from "../Managers/Modifiers";
import { LifeMoments } from "../Managers/LifeMoments";
import { Relationship } from "../Enums/Relationship";
import { Sex } from "../Enums/Sex";
import { Constants } from "../Utils/Constants";
import { Babies } from "./Babies";
import { Relationships } from "./Relationships";
import { SocialPerson } from "./SocialPerson";
import { Crime } from "../Crime/Crime";
import { Celebrity } from "../Lifepaths/Celebrity";
import { World as CelebWorld } from "../Lifepaths/CelebrityWorld";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const now = () => Relationships.now();
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const isMale = (s: any) => s === Sex.male;

export interface OneNightBaby { mother: string; motherLast: string; discover: number; due: number; told?: boolean }
export interface OneNightState { count: number; kids: number; pending: OneNightBaby[] }
export interface Stranger { first: string; last: string; sex: any; age: number }

export const OneNight = {
    chance: { protection: 0.02, none: 0.15 },
    /** The dice for "a baby?" and "they found out?" (tests can load them). */
    dice: (): number => Math.random(),
    cheatFoundOut: 0.35,

    state(p: any = player()): OneNightState {
        if (p.oneNight == null) p.oneNight = { count: 0, kids: 0, pending: [] };
        return p.oneNight;
    },
    /** Why you can't right now (null = you can). Under 18 it isn't shown at all. */
    lock(p: any = player()): string | null {
        if (p.getAgeInYears() < 18) return "Must be 18 or older";
        if (Crime.inJail(p)) return "Not while you're locked up";
        if (Relationships.away(p)) return "Not right now";
        return null;
    },
    /** Someone you're attracted to, 18 or older, around your age. */
    stranger(p: any = player()): Stranger {
        const sex = p.getSex().randomPartnerGender(p.getSexuality());
        const mine = p.getAgeInYears();
        const age = Math.max(18, Math.min(mine + 10, mine + rnd(-8, 8)));
        const sp = SocialPerson.make("friend", sex, null, age * WPY());
        return { first: sp.getFirstName(), last: sp.getLastName(), sex, age };
    },
    /** Can a baby come of it? A man and a woman, not a vampire, not infertile, not already expecting, she's 18–45. */
    canConceive(p: any, s: Stranger): boolean {
        if (p.getSex() === s.sex) return false;
        if (!Babies.biological(p) || Babies.infertile(p)) return false;
        const herAge = isMale(p.getSex()) ? s.age : p.getAgeInYears();
        if (herAge < 18 || herAge > 45) return false;
        if (!isMale(p.getSex()) && Babies.pregnant(p)) return false;
        return true;
    },

    /** The Love tab button: you choose what happens (this is a menu, so it always pops up). */
    open(p: any = player()) {
        if (OneNight.lock(p) != null) return;
        const s = OneNight.stranger(p);
        const partner = p.getFamilyState().getPartner();
        const cheating = partner != null && partner.getIsAlive();
        const text = `You meet ${s.first}, ${s.age}, at a bar. One thing leads to another…` +
            (cheating ? `\n\nYou're with ${partner.getFirstName()}. This would be cheating.` : "");
        LifeMoments.ask("One-Night Stand", text, R.drawable.love_nightclub, [
            ["Go home together (with protection)", () => OneNight.night(p, s, true)],
            ["Go home together (no protection)", () => OneNight.night(p, s, false)],
            ["Never mind", () => null],
        ]);
    },

    /** The night itself. Returns what happened (shown as the result). */
    night(p: any, s: Stranger, protection: boolean): string {
        const st = OneNight.state(p);
        st.count++;
        const lines: string[] = [`You spent the night with ${s.first}${protection ? "" : " (no protection)"}.`];
        const partner = p.getFamilyState().getPartner();
        const cheating = partner != null && partner.getIsAlive();
        p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, 6, cheating ? -4 : 1));

        // a baby?
        if (OneNight.canConceive(p, s) && OneNight.dice() < (protection ? OneNight.chance.protection : OneNight.chance.none)) {
            if (isMale(p.getSex())) {
                // she finds out in a few weeks and tracks you down (afterWeek)
                st.pending.push({ mother: s.first, motherLast: s.last, discover: now() + rnd(4, 8), due: now() + Constants.Time.INSTANCE.getPregnancyTimeInWeeks() });
            } else {
                const child: any = Babies.startPregnancy(p, "you");
                child.otherParent = { name: `${s.first} ${s.last}`, sex: "male", oneNight: true };
                lines.push(`\nA few weeks later: a positive pregnancy test. ${s.first} is the father. Your baby is due in ${Constants.Time.INSTANCE.getPregnancyTimeInWeeks()} weeks.`);
                if (cheating) OneNight.hurt(p, partner, 30, lines, `${partner.getFirstName()} knows the baby isn't theirs.`);
            }
        }
        // cheating
        if (cheating && partner.getIsAlive() && p.getFamilyState().getPartner() === partner && OneNight.dice() < OneNight.cheatFoundOut) {
            OneNight.hurt(p, partner, 40, lines, `${partner.getFirstName()} found out.`);
        }
        // famous: the tabloids notice
        try {
            if (Celebrity.fans(p) >= 10_000) {
                CelebWorld.news(p, cheating ? `${p.getFullName()} caught cheating with a stranger` : `${p.getFullName()} seen leaving a club with a stranger`);
                if (cheating) Celebrity.rep(p, -5);
            }
        } catch { /* not famous */ }
        try { p.applyWeekly(); } catch { /* no week in tests */ }
        return lines.join("\n");
    },

    /** Your partner is hurt; they may leave you. */
    hurt(p: any, partner: any, amount: number, lines: string[], why: string) {
        partner.setRelationshipProgress(Math.max(0, partner.getRelationshipProgress() - amount));
        Relationships.setMood(partner, "upset");
        if (partner.getRelationshipProgress() < 250 || OneNight.dice() < 0.3) {
            p.getFamilyState().breakUp();
            lines.push(`${why} They left you.`);
        } else lines.push(`${why} (−${amount} relationship)`);
    },

    /** Weekly: she tells you; the baby is born. (These happen on their own: random events.) */
    afterWeek(p: any) {
        const st = p.oneNight as OneNightState | undefined;
        if (st == null || !st.pending.length) return;
        const t = now();
        for (const b of [...st.pending]) {
            if (!b.told && t >= b.discover) {
                b.told = true;
                const lines = [`${b.mother} ${b.motherLast} tracked you down: she's pregnant, and it's yours. The baby is due in ${Math.max(1, b.due - t)} weeks.`];
                const partner = p.getFamilyState().getPartner();
                if (partner != null && partner.getIsAlive()) OneNight.hurt(p, partner, 30, lines, `${partner.getFirstName()} heard about it.`);
                LifeMoments.result("A Surprise", lines.join("\n"), R.drawable.alert_pregnant, { random: true });
            }
            if (t >= b.due) {
                st.pending.splice(st.pending.indexOf(b), 1);
                const child: any = new Person(Relationship.child, Sex.INSTANCE.getRandomSex(), p.getLastName(), 0);
                child.otherParent = { name: `${b.mother} ${b.motherLast}`, sex: "female", oneNight: true };
                p.getFamilyState().getFamilyMembers().add(child);
                st.kids++;
                LifeMoments.result("It's a " + (isMale(child.getSex()) ? "Boy" : "Girl"),
                    `${b.mother} had your baby: ${child.getFirstName()}. ${isMale(child.getSex()) ? "He's" : "She's"} part of your family now.`, R.drawable.alert_pregnant, { random: true });
            }
        }
    },
    /** For a child's details: "Jordan Lee (a one-night stand)". */
    otherParentText(child: any): string | null {
        const o = child?.otherParent;
        return o?.name ? `${o.name}${o.oneNight ? " (a one-night stand)" : ""}` : null;
    },
};
