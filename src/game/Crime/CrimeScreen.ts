// v0.27.0 "The Crime Update": the Underworld screen (Lifepaths tab), the murder screen, the prison yard
// (Leisure tab in prison) and the prison job (Work tab in prison). Rules live in Crime.ts.
import { R } from "../runtime";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { LifeMoments } from "../Managers/LifeMoments";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { Appearance } from "../Social/Appearance";
import { Vampire, LifeActionDef, LifeActions } from "../Lifepaths/Vampire";
import { Relationships } from "../Social/Relationships";
import { Activities } from "../World/Activities";
import { CRIMES, CRIME_KINDS, CrimeDef, FRONTS, GANG_RESPECT, MAFIA_RESPECT, MURDER, MURDER_COLD_YEARS } from "./CrimeData";
import { Crime, money, LIFE_SENTENCE } from "./Crime";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const roll = (x: number) => Math.random() < x;
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const pct = (x: number) => `${Math.round(x * 100)}%`;
const show = (title: string, msg: string, image: any = R.drawable.police_badge) => { if (msg) LifeMoments.result(title, msg, image); };
const navigate = (key: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null);
const org = (p: any) => Crime.peek(p)?.org ?? null;
const respect = (p: any) => Crime.peek(p)?.respect ?? 0;

/** One crime as a row on the Underworld screen. */
const crimeRow = (d: CrimeDef): LifeActionDef => ({
    id: "crime_" + d.id, title: d.title, image: (R.drawable as any)[d.image], actionTitle: () => "Do It",
    lock: (p) => Crime.block(p) ?? Crime.needsBlock(p, d),
    note: () => {
        const p = player();
        const sent = d.sentence[1] === 0 ? `a ${money(d.fine ?? 300)} fine` : d.sentence[0] === 0 ? `a fine or up to ${Crime.years(d.sentence[1])}` : `${Crime.years(d.sentence[0])}–${Crime.years(d.sentence[1])}`;
        const take = d.take[1] > 0 ? `Take: ${money(d.take[0])}–${money(d.take[1])}. ` : "";
        return `${d.blurb}\n${take}Odds: ${pct(Crime.chance(p, d))} · Heat +${d.heat} · If convicted: ${sent}${d.crew ? (org(p) ? " · Crew: yours" : " · No crew (−15%)") : ""}\n`;
    },
    run: (p) => show(d.title, Crime.commit(p, d), (R.drawable as any)[d.image]),
});

// ---------------------------------------------------------------- staying out of trouble
const TROUBLE: LifeActionDef[] = [
    { id: "layLow", title: "Lay Low", image: R.drawable.vacation_take_week_off, mods: [0, -2, 1], lock: (p) => Crime.block(p) ?? (Crime.heat(p) <= 0 && !Crime.peek(p)?.fugitive ? "The police aren't interested in you" : null),
        note: () => "Stay home, keep your head down: heat −15 (fugitives are much harder to find this week).\n",
        run: (p) => { const s = Crime.state(p); s.heat = Math.max(0, s.heat - 15); } },
    { id: "bribeCop", title: "Bribe a Cop", image: R.drawable.police_badge, cost: () => 2000 + Math.round(Crime.heat(player()) * 150),
        lock: (p) => Crime.block(p) ?? (p.getAgeInYears() < 18 ? "From age 18" : Crime.heat(p) < 10 ? "Nobody's looking at you" : null),
        note: () => "Heat −25. 15% chance the cop is honest (bribery charge).\n",
        run: (p) => {
            if (roll(0.15)) { Crime.arrest(p, [{ crime: "bribery", title: "Bribery", week: 0, violent: false, sentence: [24, 96] }], "The cop you tried to bribe was wearing a wire."); return; }
            const s = Crime.state(p); s.heat = Math.max(0, s.heat - 25);
            show("Bribe a Cop", "An envelope changed hands. Reports went missing. (Heat −25)");
        } },
    { id: "launder", title: "Launder Money", image: R.drawable.bank_deposit, cost: () => 5000 + Math.round(Crime.heat(player()) * 300),
        lock: (p) => Crime.block(p) ?? (!ownsBusiness(p) && !org(p)?.fronts?.length ? "Needs a business you own (Work tab) or a family front" : Crime.heat(p) < 10 ? "Your money looks clean already" : null),
        note: () => "Run your cash through your business books: heat −35.\n", instant: true,
        run: (p) => { const s = Crime.state(p); s.heat = Math.max(0, s.heat - 35); show("Laundered", "Your cash came out the other side squeaky clean. (Heat −35)"); } },
    { id: "fakeId", title: "Buy a New Identity", image: R.drawable.possesion_passport, cost: 75000,
        lock: (p) => Crime.block(p) ?? (p.getAgeInYears() < 18 ? "From age 18" : respect(p) < 30 && !org(p) ? "Needs underworld connections (30 respect or a gang/family)" : !Crime.peek(p)?.fugitive && !Crime.peek(p)?.open?.length && !(Crime.peek(p)?.record?.length) ? "You don't need one" : null),
        note: () => "A new name and papers: you stop being a fugitive, minor open cases and your record disappear (murder cases stay open until they're closed).\n",
        run: (p) => {
            const s = Crime.state(p);
            const fresh = ["Novak", "Silva", "Hart", "Lindqvist", "Moreau", "Kane", "Doyle", "Vargas"][Math.floor(Math.random() * 8)];
            const old = p.getLastName();
            p.lastName = fresh;
            s.fugitive = false; s.record = []; s.open = s.open.filter((c) => c.murder); s.heat = Math.min(s.heat, 20);
            show("A New You", `${p.getFirstName()} ${old} doesn't exist any more. Meet ${p.getFirstName()} ${fresh}.`, R.drawable.possesion_passport);
        } },
];
const ownsBusiness = (p: any) => { try { return p.getBusinessState().getStates().some((b: any) => Number(b.getNumberOfBusinessUnits().toString()) > 0); } catch { return false; } };

// ---------------------------------------------------------------- gangs
const GANG: LifeActionDef[] = [
    { id: "joinGang", title: "Join a Gang", image: R.drawable.possession_gun, instant: true, show: (p) => org(p) == null,
        lock: (p) => Crime.block(p) ?? (p.getAgeInYears() < 14 ? "From age 14" : respect(p) < 5 ? "Nobody trusts you yet: commit a few crimes first (5 respect)" : null),
        note: () => "Start as a Prospect. Gang jobs pay, and the crew helps on heists. They take a 30% cut of heists.\n",
        run: (p) => show("Jumped In", Crime.joinGang(p), R.drawable.possession_gun) },
    { id: "startGang", title: "Start Your Own Gang", image: R.drawable.possession_gun, cost: 5000, instant: true, show: (p) => org(p) == null,
        lock: (p) => Crime.block(p) ?? (p.getAgeInYears() < 18 ? "From age 18" : respect(p) < 25 ? "Needs 25 respect" : null),
        note: () => "Six members and a block of turf. Turf pays every week; more turf, more heat.\n",
        run: (p) => show("Your Gang", Crime.startGang(p), R.drawable.possession_gun) },
    { id: "gangJob", title: "Do a Job for the Gang", image: R.drawable.hud_cash, show: (p) => org(p)?.kind === "gang" && !org(p)!.own,
        lock: (p) => Crime.block(p), note: () => { const o = org(player()); return o ? `Pays about ${money([200, 450, 900, 1600, 3000][o.rank])}; respect +${6 + o.rank}; heat +6; 12% chance it goes wrong.\n` : ""; },
        run: (p) => {
            const o = org(p)!;
            if (roll(0.12)) {
                if (roll(0.5)) { Crime.arrest(p, [{ crime: "gangActivity", title: "Gang Activity", week: 0, violent: true, sentence: [12, 96] }], "The job was a setup. The police were waiting."); return; }
                attr(p, -10, -3, -3); show("Gang Job", "The job went bad. You got hurt getting out (−10 health)."); return;
            }
            const pay = Math.round([200, 450, 900, 1600, 3000][o.rank] * (0.7 + Math.random() * 0.7));
            Crime.state(p).stats.earned += pay;
            Crime.earn(p, pay); Crime.addHeat(p, 6); Crime.state(p).respect += 2; Crime.orgPoints(p, 6 + o.rank);
            show("Gang Job", `Done. Your share: ${money(pay)}.`, R.drawable.hud_cash);
        } },
    { id: "defendTurf", title: "Defend the Turf", image: R.drawable.angry, show: (p) => org(p)?.kind === "gang",
        lock: (p) => Crime.block(p), note: () => `A fight with a rival crew. Win: respect +12. Odds ${pct(fightOdds(player()))} (martial arts and health help).\n`,
        run: (p) => {
            if (roll(fightOdds(p))) { Crime.state(p).respect += 4; Crime.orgPoints(p, 12); if (org(p)!.own) org(p)!.members++; Crime.addHeat(p, 5); show("Turf War", "You held the block. Word gets around. (+12 gang respect)"); return; }
            attr(p, roll(0.05) ? -35 : -15, -5, -5); Crime.addHeat(p, 5); show("Turf War", "You lost the fight and some blood.", R.drawable.angry);
        } },
    { id: "recruit", title: "Recruit Members", image: R.drawable.family, cost: 1000, show: (p) => org(p)?.kind === "gang" && org(p)!.own,
        lock: (p) => Crime.block(p), note: () => "+3 members. You need 5 members per block of turf to take more.\n",
        run: (p) => { org(p)!.members += 3; show("Recruiting", `Three new faces. The ${org(p)!.name} has ${org(p)!.members} members.`, R.drawable.family); } },
    { id: "takeTurf", title: "Take More Turf", image: R.drawable.possession_gun, show: (p) => org(p)?.kind === "gang" && org(p)!.own,
        lock: (p) => Crime.block(p) ?? (org(p)!.members < (org(p)!.turf + 1) * 5 ? `Needs ${(org(p)!.turf + 1) * 5} members` : null),
        note: () => { const o = org(player()); return o ? `Each block pays $600 a week (you have ${o.turf}). Odds ${pct(Math.min(0.85, 0.45 + o.members / 100 + Activities.fightBonus(player())))}. Heat +15.\n` : ""; },
        run: (p) => {
            const o = org(p)!;
            Crime.addHeat(p, 15);
            if (roll(Math.min(0.85, 0.45 + o.members / 100 + Activities.fightBonus(p)))) { o.turf++; show("New Turf", `The ${o.name} owns ${o.turf} blocks now.`); return; }
            o.members = Math.max(1, o.members - 2); attr(p, -10, -5, -3); show("Pushed Back", "The other crew held their ground. You lost two members (−10 health).");
        } },
    { id: "payCops", title: "Pay Off the Cops", image: R.drawable.police_badge, cost: () => 5000 + (org(player())?.turf ?? 0) * 1000, show: (p) => org(p)?.own === true && org(p)!.kind === "gang",
        lock: (p) => Crime.block(p), instant: true, note: () => "Heat −30, no questions.\n",
        run: (p) => { const s = Crime.state(p); s.heat = Math.max(0, s.heat - 30); show("Paid Off", "The patrols suddenly avoid your blocks. (Heat −30)"); } },
];
const fightOdds = (p: any) => Math.min(0.9, 0.5 + Activities.fightBonus(p) + (p.getAttributeState().getHealth() - 50) / 400 + (Vampire.isVampire(p) ? 0.2 : 0));

// ---------------------------------------------------------------- crime families
const FAMILY_JOBS: { id: string; title: string; rank: number; pay: number; heat: number; points: number; violent?: boolean; blurb: string; image: any }[] = [
    { id: "protection", title: "Collect Protection Money", rank: 0, pay: 1500, heat: 5, points: 8, blurb: "Shop owners pay for \"insurance\".", image: R.drawable.hud_cash },
    { id: "numbers", title: "Run a Gambling Racket", rank: 1, pay: 4000, heat: 6, points: 12, blurb: "Back-room card games and bookmaking.", image: R.drawable.bank_lottery },
    { id: "loanShark", title: "Loan Sharking", rank: 1, pay: 5000, heat: 7, points: 12, blurb: "Lend money at 50% a week. Collect.", image: R.drawable.bank_loan },
    { id: "smuggling", title: "Smuggle Goods Through the Port", rank: 2, pay: 15000, heat: 10, points: 20, blurb: "Containers that never went through customs.", image: R.drawable.possession_yacht },
    { id: "example", title: "Make an Example of Someone", rank: 1, pay: 2000, heat: 12, points: 25, violent: true, blurb: "Someone forgot who they owe. Remind them.", image: R.drawable.angry },
];
const FAMILY: LifeActionDef[] = [
    { id: "seekFamily", title: "Seek a Meeting with a Crime Family", image: R.drawable.possession_gun, instant: true, show: (p) => org(p)?.kind !== "mafia",
        lock: (p) => Crime.block(p) ?? (p.getAgeInYears() < 18 ? "From age 18" : respect(p) < 50 && !(org(p)?.kind === "gang" && org(p)!.rank >= 3) ? "Needs 50 respect (or to be a gang Lieutenant)" : null),
        note: () => "Start as an Associate. Rise to Soldier, Capo, Underboss… and one day, Don. You don't leave a family.\n",
        run: (p) => show("The Family", Crime.joinFamily(p), R.drawable.possession_gun) },
    ...FAMILY_JOBS.map((j): LifeActionDef => ({
        id: "fam_" + j.id, title: j.title, image: j.image, show: (p) => org(p)?.kind === "mafia" && !org(p)!.own,
        lock: (p) => Crime.block(p) ?? (org(p)!.rank < j.rank ? `Needs the rank of ${["Associate", "Soldier", "Capo", "Underboss"][j.rank]}` : null),
        note: () => `${j.blurb}\nAbout ${money(j.pay * (1 + (org(player())?.rank ?? 0) * 0.5))}; family respect +${j.points}; heat +${j.heat}.\n`,
        run: (p) => {
            const o = org(p)!;
            if (roll(j.violent ? 0.15 : 0.08)) { Crime.arrest(p, [{ crime: j.id, title: j.violent ? "Aggravated Assault" : "Racketeering", week: 0, violent: !!j.violent, sentence: j.violent ? [96, 480] : [48, 240] }], "The feds were watching."); return; }
            const pay = Math.round(j.pay * (1 + o.rank * 0.5) * (0.7 + Math.random() * 0.6));
            Crime.earn(p, pay); Crime.state(p).stats.earned += pay; Crime.addHeat(p, j.heat); Crime.state(p).respect += 3; Crime.orgPoints(p, j.points);
            show(j.title, `Done. The family's happy. Your share: ${money(pay)}.`, j.image);
        },
    })),
    { id: "takeOver", title: "Take Over the Family", image: R.drawable.skull, show: (p) => org(p)?.kind === "mafia" && org(p)!.rank === 3,
        lock: (p) => Crime.block(p) ?? (org(p)!.points < MAFIA_RESPECT[4] ? `Needs ${MAFIA_RESPECT[4]} family respect (you have ${org(p)!.points})` : null),
        confirm: () => "Move against the Don? If it fails, the family will punish you.",
        note: () => "Or wait: an Underboss with enough respect gets the job when the old Don retires.\n",
        run: (p) => {
            const o = org(p)!;
            if (roll(0.55 + Activities.fightBonus(p) + (Vampire.isVampire(p) ? 0.2 : 0))) { o.rank = 4; o.own = true; o.fronts = ["pizzeria"]; Crime.addHeat(p, 20); show("The New Don", `The old Don is gone. ${o.name} is yours.`, R.drawable.skull); return; }
            o.rank = 1; o.points = MAFIA_RESPECT[1]; attr(p, -40, -10, -10); show("It Failed", "The Don saw it coming. You were beaten and demoted to Soldier (−40 health).", R.drawable.skull);
        } },
    ...FRONTS.map((f): LifeActionDef => ({
        id: "front_" + f.id, title: `Buy a Front: ${f.title}`, image: (R.drawable as any)["icon_front_" + f.id.toLowerCase()], cost: f.price,
        show: (p) => org(p)?.kind === "mafia" && org(p)!.own && !org(p)!.fronts.includes(f.id), lock: (p) => Crime.block(p), instant: true,
        note: () => `A legitimate business: +${money(f.income)} a week and it launders your money (less heat every week).\n`,
        run: (p) => { org(p)!.fronts.push(f.id); show("New Front", `The family owns ${ExtensionsKt.aOrAn(f.title.toLowerCase())} now.`); },
    })),
    { id: "bribeChief", title: "Bribe the Police Chief", image: R.drawable.police_badge, cost: 250000, instant: true, show: (p) => org(p)?.kind === "mafia" && org(p)!.own,
        lock: (p) => Crime.block(p) ?? ((Crime.peek(p)?.bribeUntil ?? 0) > p.calendarWeeks() ? "Already on your payroll" : null),
        note: () => "For a year: heat cools twice as fast and every crime draws 40% less.\n",
        run: (p) => { Crime.state(p).bribeUntil = p.calendarWeeks() + 48; show("On the Payroll", "The chief of police works for you now."); } },
    { id: "bribeJudge", title: "Bribe a Judge", image: R.drawable.education_lawschool, cost: 500000, instant: true, show: (p) => org(p)?.kind === "mafia" && org(p)!.own,
        lock: (p) => Crime.block(p) ?? (Crime.peek(p)?.judgeBribed ? "A judge already owes you" : null),
        note: () => "Next time you're in court, call in the favour (80% the case is thrown out).\n",
        run: (p) => { Crime.state(p).judgeBribed = true; show("A Friend on the Bench", "A judge owes you one."); } },
    { id: "stepDown", title: "Step Down as Don", image: R.drawable.will, instant: true, show: (p) => org(p)?.kind === "mafia" && org(p)!.own,
        lock: (p) => Crime.block(p), confirm: () => "Hand the family to your Underboss and retire? You keep your money; the family keeps the fronts.",
        run: (p) => { const o = org(p)!; Crime.state(p).org = null; show("Retired", `You handed ${o.name} to your Underboss. A Don who retires is respected, not hunted.`); } },
];
const LEAVE: LifeActionDef = { id: "leaveOrg", title: () => (org(player())?.kind === "mafia" ? "Walk Away from the Family" : "Leave the Gang"), image: R.drawable.redx, instant: true,
    show: (p) => org(p) != null && !(org(p)!.kind === "mafia" && org(p)!.own), lock: (p) => Crime.block(p),
    confirm: () => (org(player())?.kind === "mafia" ? "Nobody walks away from a family. They'll come for you one day. Leave anyway?" : "Gangs don't like people leaving. Leave anyway?"),
    run: (p) => show("Out", Crime.leave(p)) };

// ---------------------------------------------------------------- prison (yard and job)
const PRISON: LifeActionDef[] = [
    { id: "prisonGym", title: "Prison Gym", image: R.drawable.health_workout, mods: [3, 2, 2], jail: true, note: () => "Get strong. Every session makes you better in a fight.\n",
        run: (p) => { const st = Activities.stats(p); st.martial = (st.martial ?? 0) + 1; } },
    { id: "prisonLibrary", title: "Prison Library", image: R.drawable.education_literature, mods: [0, 2, 6], jail: true, note: () => "Read everything. Good behaviour.\n",
        run: (p) => { const j = Crime.state(p).jail; if (j) j.behavior += 2; } },
    { id: "letters", title: "Write Letters Home", image: R.drawable.will, mods: [0, 3, 3], jail: true, instant: false, note: () => "Your family hears from you (+15 with everyone).\n",
        run: (p) => { for (const x of Relationships.familyPeople(p)) if (x.getIsAlive?.() && x.getPetType?.() == null) x.setRelationshipProgress(Math.min(1000, x.getRelationshipProgress() + 15)); } },
    { id: "prisonGang", title: "Join a Prison Gang", image: R.drawable.possession_gun, instant: true, jail: true, show: (p) => !Crime.peek(p)?.prisonGang,
        note: () => "Protection in the yard and riots, but the parole board notices.\n",
        run: (p) => { const s = Crime.state(p); s.prisonGang = true; s.respect += 5; if (s.jail) s.jail.behavior -= 10; show("Protected", "Nobody touches you now."); } },
    { id: "contraband", title: "Smuggle Contraband", image: R.drawable.health_pills, jail: true, note: () => "Cigarettes and phones are currency in here: $200–$800. 20% you're caught (+12 weeks).\n",
        run: (p) => {
            if (roll(0.2)) { Crime.addJailWeeks(p, 12); const j = Crime.state(p).jail; if (j) j.behavior -= 15; show("Caught", "A cell search found your stash. (+12 weeks)", R.drawable.jail); return; }
            const n = 200 + Math.round(Math.random() * 600); Crime.earn(p, n); show("Business Is Good", `You made ${money(n)} this week.`, R.drawable.health_pills);
        } },
    { id: "appeal", title: "Appeal Your Sentence", image: R.drawable.education_lawschool, cost: () => 10000 + Math.round((Crime.peek(player())?.jail?.weeks ?? 0) * 50), jail: true, instant: true,
        show: (p) => !Crime.peek(p)?.jail?.appealed, note: () => "A lawyer files an appeal: 15% your conviction is overturned, 30% your sentence is cut by 40%. One appeal per sentence.\n",
        run: (p) => {
            const j = Crime.state(p).jail!; j.appealed = true;
            const r = Math.random();
            if (r < 0.15) { Crime.release(p, "appeal"); return; }
            if (r < 0.45) { const cut = Math.round(j.weeks * 0.4); j.weeks -= cut; j.total -= cut; show("Appeal", `The court cut ${Crime.years(cut)} from your sentence.`); return; }
            show("Appeal Denied", "The court upheld your sentence.");
        } },
    { id: "feedCellmate", title: "Feed on a Cellmate", image: R.drawable.icon_vamp_bite, jail: true, show: (p) => Vampire.isVampire(p),
        note: () => "Hunger −40, Rumours +8. 15% the guards find out (+24 weeks).\n",
        run: (p) => {
            const v = Vampire.state(p); v.thirst = Math.max(0, v.thirst - 40); v.suspicion = Math.min(100, v.suspicion + 8);
            if (roll(0.15)) { Crime.addJailWeeks(p, 24); show("Caught", "A guard found your cellmate pale and dizzy. (+24 weeks)", R.drawable.jail); }
        } },
];
const PRISON_JOB: LifeActionDef[] = [
    { id: "prisonKitchen", title: "Work in the Prison Kitchen", image: R.drawable.diet_prisonfood, mods: [0, -1, -1], jail: true, note: () => "$20 a week and good behaviour.\n",
        run: (p) => { Crime.earn(p, 20); const j = Crime.state(p).jail; if (j) j.behavior += 2; } },
    { id: "licensePlates", title: "Make License Plates", image: R.drawable.possession_car, mods: [0, -2, -1], jail: true, note: () => "$35 a week. Mind-numbing. Good behaviour.\n",
        run: (p) => { Crime.earn(p, 35); const j = Crime.state(p).jail; if (j) j.behavior += 2; } },
];

export const CrimeScreen = {
    /** The Lifepaths tab row. */
    status(p: any = player()): string {
        const s = Crime.peek(p);
        if (Crime.inJail(p)) { const j = s!.jail!; return `In prison (${j.crime}): ${Crime.years(j.weeks)} left${j.total >= LIFE_SENTENCE ? " (life)" : ""}.`; }
        if (!s || (!s.stats.crimes && !s.record.length && !s.org && !s.pendingFamily)) return "Petty crime, robberies, heists, scams, gangs, crime families and worse. The police are watching. From age 13.";
        const bits = [`Heat: ${Crime.heatLabel(s.heat)} (${Math.round(s.heat)})`, `respect ${s.respect}`];
        if (s.org) bits.push(`${Crime.rankTitle(s.org)}, ${s.org.name}`);
        if (s.fugitive) bits.push("WANTED");
        return bits.join(" · ");
    },
    cells(p: any = player()): any[] {
        const out: any[] = [];
        const s = Crime.state(p);
        out.push(new HeaderTitleViewModel("The Underworld"));
        const rec = s.record.filter((r) => !r.juvenile || p.getAgeInYears() < 18);
        out.push(info(R.drawable.police_badge, s.fugitive ? "WANTED: Fugitive" : `Heat: ${Crime.heatLabel(s.heat)}`,
            `Respect ${s.respect} · ${s.stats.crimes} crime${s.stats.crimes === 1 ? "" : "s"} · ${money(s.stats.earned)} earned · ${s.stats.caught} arrest${s.stats.caught === 1 ? "" : "s"}${s.stats.kills ? ` · ${s.stats.kills} dead` : ""}\n` +
            `Record: ${rec.length ? rec.slice(-3).map((r) => `${r.title} (age ${r.age}${r.weeks ? `, ${Crime.years(r.weeks)}` : ", fine"}${r.juvenile ? ", sealed at 18" : ""})`).join("; ") : "clean"}` +
            (s.open.length ? `\nOpen cases against you: ${s.open.length}${s.open.some((c) => c.murder) ? ` (including murder: closed unsolved in ${Math.max(1, Math.ceil(Math.min(...s.open.filter((c) => c.murder).map((c) => MURDER_COLD_YEARS * 48 - (p.calendarWeeks() - c.week))) / 48))} years)` : ""}.` : "") +
            (Crime.recordBlock(p) ? `\n${Crime.recordBlock(p)}: careers with background checks won't hire you.` : "")));
        out.push(new MeterViewModel("Police heat", Math.round(s.heat), 100, s.heat >= 60 ? "red" : s.heat >= 30 ? "gold" : "green",
            s.heat >= 35 && s.open.length ? "With open cases and this much heat, a warrant could come any week." : "Heat cools by itself every week.", `${Math.round(s.heat)} / 100`));
        if (Crime.inJail(p)) {
            const j = s.jail!;
            out.push(new HeaderTitleViewModel("Prison"));
            out.push(info(R.drawable.jail, `Serving ${Crime.years(j.total)}: ${j.crime}`,
                `${Crime.years(j.weeks)} left. Behaviour: ${j.behavior >= j.served * 0.7 ? "good" : "poor"}. Parole possible after ${j.violent ? "85%" : "two thirds"} of your sentence with good behaviour.\nThe Leisure tab is the prison yard; the Work tab has prison jobs.`));
            return out;
        }
        if (s.pendingFamily) {
            const o = s.pendingFamily;
            out.push(new ActionCellSingleViewModel(R.drawable.will, "The Family Business", text(`Your parent ran the ${o.name}. It's yours if you want it.`),
                new ButtonViewModel("Decide", null, true, false, false, false, false, { invoke: () => {
                    LifeMoments.ask("The Family Business", `Your parent ran the ${o.name}. Take it over?`, R.drawable.will, [
                        ["Take over", () => Crime.takeOver(p, true)], ["Walk away", () => Crime.takeOver(p, false)]]);
                    return null; } }), null, null));
        }
        const block = Crime.block(p);
        if (block) { out.push(info(R.drawable.locked, "Crime", block)); return out; }
        // organisations
        const o = s.org;
        out.push(new HeaderTitleViewModel(o ? o.name : "Gangs & Crime Families"));
        if (o) {
            const th = Crime.thresholds(o);
            const next = o.own ? "" : o.rank + 1 < th.length ? ` · next rank at ${th[o.rank + 1]} respect` : "";
            const detail = o.kind === "gang"
                ? (o.own ? `${o.members} members · ${o.turf} block${o.turf === 1 ? "" : "s"} of turf ($${o.turf * 600 + o.members * 25}/week)` : `Gang respect ${o.points}${next}`)
                : (o.own ? `Fronts: ${o.fronts.map((f) => FRONTS.find((x) => x.id === f)?.title).join(", ") || "none"} · the family pays you every week` : `Family respect ${o.points}${next}`);
            out.push(info(R.drawable.possession_gun, `${Crime.rankTitle(o)}${o.own ? " (in charge)" : ""}`, detail));
        } else {
            out.push(info(R.drawable.possession_gun, "Organised Crime", `Gangs from 14 (5 respect), your own gang from 18 (25 respect), a crime family from 18 (50 respect). You have ${s.respect} respect.`));
        }
        for (const c of LifeActions.cells([...GANG, ...FAMILY, LEAVE], p)) out.push(c);
        // crimes
        for (const k of CRIME_KINDS) {
            const list = CRIMES.filter((d) => d.kind === k.id && (d.needs !== "police" || p.getJobState().getCurrentJob()?.name?.() === "police"));
            if (!list.length) continue;
            out.push(new HeaderTitleViewModel(k.title));
            for (const c of LifeActions.cells(list.map(crimeRow), p)) out.push(c);
            if (k.id === "violent") {
                out.push(new ActionCellSingleViewModel(R.drawable.skull, "Murder", text(`Someone in your life. Pick a person, then a method. They will really die. Detectives work an unsolved murder for ${MURDER_COLD_YEARS} years before the case is closed. From age 18.`),
                    new ButtonViewModel(p.getAgeInYears() < 18 ? "From 18" : "Choose", null, p.getAgeInYears() >= 18, false, p.getAgeInYears() < 18, false, false,
                        { invoke: () => { if (p.getAgeInYears() >= 18) navigate("crime-murder"); return null; } }), null, null));
            }
        }
        out.push(new HeaderTitleViewModel("Staying Out of Trouble"));
        for (const c of LifeActions.cells(TROUBLE, p)) out.push(c);
        return out;
    },
    murderCells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel("Who?")];
        out.push(info(R.drawable.skull, "Murder", `Methods: poison (70% it works), make it look like an accident (55%, hardest to trace), ambush (85%, easiest to trace), hire a hitman (${money(50000)}, 90%)${Vampire.isVampire(p) ? ", or drain them (95%)" : ""}. If it fails, they may go to the police.`));
        const victims = Crime.victims(p);
        if (!victims.length) out.push(info(R.drawable.family, "Nobody", "There's nobody in your life to kill (only adults can be chosen)."));
        for (const v of victims) {
            const kind = v.kind ?? v.getRelationship?.()?.name?.() ?? "";
            const title = typeof v.getTitle === "function" ? v.getTitle() : kind;
            out.push(new ActionCellSingleViewModel(Appearance.head(v), v.getFullName?.() ?? v.getFirstName(), text(`${title}, ${v.getAgeInYears()}`),
                new ButtonViewModel("Kill", null, true, false, false, false, false, { invoke: () => { CrimeScreen.chooseMethod(p, v); return null; } }), null, null));
        }
        return out;
    },
    chooseMethod(p: any, v: any) {
        const name = v.getFirstName();
        const opts: [string, () => string][] = [
            ["Poison", () => Crime.murder(p, v, "poison")],
            ["Make it look like an accident", () => Crime.murder(p, v, "accident")],
            ["Ambush", () => Crime.murder(p, v, "ambush")],
        ];
        if (Vampire.isVampire(p)) opts.push(["Drain them", () => Crime.murder(p, v, "drain")]);
        if (cash(p) >= 50000) opts.push([`Hire a hitman (${money(50000)})`, () => Crime.murder(p, v, "hitman")]);
        opts.push(["Change your mind", () => "You couldn't go through with it."]);
        LifeMoments.ask(`Kill ${name}?`, `How?`, R.drawable.skull, opts);
        try { p.applyWeekly(); } catch { /* ignore */ }
    },
    prisonYardCells(p: any = player()): any[] {
        const s = Crime.state(p);
        const out: any[] = [];
        const j = s.jail;
        if (j) out.push(info(R.drawable.jail, `${Crime.years(j.weeks)} left`, `Serving ${Crime.years(j.total)}: ${j.crime}. ${j.behavior >= j.served * 0.7 ? "Your behaviour is good: parole is possible." : "Behave and you could get out early."}`));
        out.push(new HeaderTitleViewModel("Inside"));
        for (const c of LifeActions.cells(PRISON, p)) out.push(c);
        return out;
    },
    prisonJobCells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel("Prison Jobs")];
        out.push(info(R.drawable.jail, "Prison", "No outside work until you're released. Prison jobs pay a little and count as good behaviour."));
        for (const c of LifeActions.cells(PRISON_JOB, p)) out.push(c);
        return out;
    },
};
void GANG_RESPECT; void MURDER;
