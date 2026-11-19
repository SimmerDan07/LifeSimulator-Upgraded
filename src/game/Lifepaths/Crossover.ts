// Celebrity Life × Vampire cross content (v0.25.0). Installed once from GameStateManager.init (after every module has
// loaded, so the action lists exist):
//
// - Fake Your Death while famous: the world mourns your old name and your fans drop to a handful (at most 2,000; the
//   new you is a nobody).
//   Your brand, fan club, TV series and Legend status belonged to the old name. With 100K+ fans before, you can later
//   "Return from the Dead" ($250K, once): reveal who you were and win back ~40% of those fans (+30 suspicion).
// - Collapsing while famous: "missing star" headlines, then "found alive"; curiosity brings some fans back.
// - Every 5 vampire years while famous (100K+): "still looks the same" headlines (+2% fans).
// - Turning a celebrity partner: a "forever young" power-couple headline.
// - Feed on a Superfan (Rising Star+): −40 thirst, +5 suspicion, and sometimes they tell the tabloids.
// - Midnight Show (vampire with a celebrity career): a night crowd, +5% fans, no sunlight.
// Also in Celebrity.ts: Charm gives +20% fan gains; paparazzi sometimes catch a vampire on camera (+suspicion, +fans).
import { R } from "../runtime";
import { Vampire, FEEDING, LifeActionDef } from "./Vampire";
import { Celebrity, FAME, TIERS } from "./Celebrity";
import { World } from "./CelebrityWorld";
import { Relationships } from "../Social/Relationships";
import { GameStateManager } from "../Managers/GameStateManager";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const roll = (x: number) => Math.random() < x;
const fansText = (n: number) => Celebrity.fansText(n);
const collapseFans = new WeakMap<any, number>();

export const SUPERFAN: LifeActionDef = {
    id: "superfan", title: "Feed on a Superfan", image: R.drawable.icon_celeb_meetgreet, actionTitle: () => "Feed",
    show: (p) => Celebrity.tier(p) >= 2,
    note: () => "−40 thirst, +5 suspicion. They're thrilled to meet you… but 15% go to the tabloids.\n",
    run: (p) => {
        Vampire.feed(p, 40, 5);
        if (roll(0.15)) {
            Celebrity.rep(p, -8);
            World.news(p, `Superfan claims ${p.getFullName()} BIT them at a meet & greet`);
            Celebrity.banner("Kiss and Tell", "Your superfan told the tabloids you bit them. Most people think it's a weird publicity stunt. (−8 reputation)");
        } else Celebrity.addFans(p, 200);
    },
};

export const MIDNIGHT_SHOW: LifeActionDef = {
    id: "midnightShow", title: "Midnight Show", image: R.drawable.lifepath_vampire, mods: [0, 5, 0], actionTitle: () => "Go",
    show: (p) => Vampire.isVampire(p) && Celebrity.career(p) != null,
    lock: (p) => (Celebrity.tier(p) >= 1 ? null : `Needs ${TIERS[1].name} (${fansText(TIERS[1].min)} fans)`),
    note: () => "A show that starts at midnight: no sunlight, a crowd that loves the dark. +5% fans.\n",
    run: (p) => { Celebrity.grow(p, 0.05, 300); Celebrity.active(p); Celebrity.state(p).yearWork++; },
};

export const RETURN_FROM_DEAD: LifeActionDef = {
    id: "returnFromDead", title: "Return from the Dead", image: R.drawable.grave, cost: 250000,
    show: (p) => (Celebrity.peek(p)?.formerFans ?? 0) >= 100000 && !Celebrity.peek(p)?.returned,
    note: () => { const s = Celebrity.peek(player()); return `Reveal that you're really ${s?.formerName ?? "the star everyone mourned"}. Win back about 40% of your ${fansText(s?.formerFans ?? 0)} old fans. Vampire suspicion +30.\n`; },
    confirm: () => "Stage the comeback of the century? Everyone will know you didn't really die (and they'll wonder why you haven't aged).",
    run: (p) => {
        const s = Celebrity.state(p);
        s.returned = true;
        // v0.25.2: everything the dead star made and won is yours again
        const f = s.former;
        if (f) {
            s.works = [...(f.works ?? []), ...(s.works ?? [])]; s.awards = [...(f.awards ?? []), ...(s.awards ?? [])];
            for (const k of ["hits", "albums", "singles", "movies", "roles", "tours"]) (s as any)[k] = ((s as any)[k] ?? 0) + (f[k] ?? 0);
            s.walkOfFame = s.walkOfFame || f.walkOfFame; s.hallOfFame = s.hallOfFame || f.hallOfFame;
            s.foundation = s.foundation ?? f.foundation; s.memoir = s.memoir ?? f.memoir;
            s.former = null;
        }
        const back = Celebrity.addFans(p, s.formerFans * 0.4);
        Celebrity.rep(p, 5);
        const v = Vampire.peek(p);
        if (v?.isVampire) v.suspicion = Math.min(100, v.suspicion + 30);
        World.news(p, `${s.formerName} is ALIVE: the star everyone mourned returns as ${p.getFullName()}`);
        Celebrity.alert("Back from the Dead", `You walked on stage and told the world: you are ${s.formerName}. The internet broke. +${fansText(back)} fans.`, Celebrity.image);
    },
};

export const Crossover = {
    installed: false,
    install() {
        if (Crossover.installed) return;
        Crossover.installed = true;
        if (!FEEDING.includes(SUPERFAN)) FEEDING.push(SUPERFAN);
        if (!FAME.includes(MIDNIGHT_SHOW)) FAME.push(MIDNIGHT_SHOW, RETURN_FROM_DEAD);

        Vampire.hooks.fakeDeath = (p, oldName) => {
            const s = Celebrity.peek(p);
            if (s == null || s.fans < 100) return "";
            const before = s.fans;
            if (before > (s.formerFans ?? 0)) { s.formerFans = before; s.formerName = oldName; }
            s.returned = false;
            s.fans = Math.min(Math.round(before * 0.05), 2000);   // a few die-hards who think you look familiar
            s.tierShown = Celebrity.tierOf(s.fans);
            s.reputation = 50; s.cancelled = false; s.legend = false;
            s.brand = null; s.fanClub = false; s.series = null;
            // v0.25.2: the catalogue, awards and royalties belong to the dead star; rivals and celebrity friends mourn them
            const f = s.former ?? (s.former = { works: [], awards: [], hits: 0, albums: 0, singles: 0, movies: 0, roles: 0, tours: 0, walkOfFame: false, hallOfFame: false, foundation: null, memoir: null });
            f.works = [...(f.works ?? []), ...(s.works ?? [])]; f.awards = [...(f.awards ?? []), ...(s.awards ?? [])];
            for (const k of ["hits", "albums", "singles", "movies", "roles", "tours"]) { f[k] = (f[k] ?? 0) + ((s as any)[k] ?? 0); (s as any)[k] = 0; }
            f.walkOfFame = f.walkOfFame || s.walkOfFame; f.hallOfFame = f.hallOfFame || s.hallOfFame;
            f.foundation = f.foundation ?? s.foundation; f.memoir = f.memoir ?? s.memoir;
            s.works = []; s.awards = []; s.walkOfFame = false; s.hallOfFame = false; s.foundation = null; s.memoir = null;
            s.rivals = {}; s.friends = []; s.songs = 0;
            World.news(p, `${oldName} found dead at ${p.getAgeInYears()}. Fans hold candlelight vigils around the world`);
            return `\n\nThe world mourned ${oldName}. As ${p.getFullName()}, almost nobody knows who you are: ${fansText(before)} → ${fansText(s.fans)} fans.` +
                (before >= 100000 ? " (One day you could stage a comeback: Celebrity Life › Fame › Return from the Dead.)" : "");
        };
        Vampire.forgetCelebPartner = (p) => { const s = Celebrity.peek(p); if (s) { s.partnerId = null; s.weddingNews = false; } };
        Vampire.hooks.collapseStart = (p) => {
            const f = Celebrity.fans(p);
            collapseFans.set(p, f);
            const cs = Celebrity.peek(p);
            if (cs?.series) cs.series = null;   // v0.25.2: the show can't go on without its star
            if (f >= 1000) World.news(p, `${p.getFullName()} has vanished. Police search for the missing star`);
        };
        Vampire.hooks.collapseEnd = (p, years) => {
            const before = collapseFans.get(p) ?? 0;
            collapseFans.delete(p);
            if (before < 1000) return "";
            const mid = Celebrity.fans(p);
            Celebrity.addFans(p, before * 0.1);
            World.news(p, `FOUND ALIVE: missing star ${p.getFullName()} turns up after ${years} years, \"not a day older\"`);
            return `\n\nYou were famous when you disappeared. While you were gone your fans moved on (${fansText(before)} → ${fansText(mid)}), but the "found alive" story brought some back (now ${fansText(Celebrity.fans(p))}).`;
        };
        Vampire.hooks.yearly = (p, years) => {
            const s = Celebrity.peek(p);
            if (s == null || s.fans < 100000 || years % 5 !== 0) return;
            Celebrity.addFans(p, s.fans * 0.02);
            World.news(p, `${p.getFullName()} at ${p.getTrueAgeInYears()}: still looks ${p.getAgeInYears()}. What's the secret?`);
        };
        const turn = Vampire.turn;
        Vampire.turn = (p: any, person: any) => {
            turn(p, person);
            try {
                if (Relationships.meta(person, p).celeb != null && Celebrity.fans(p) >= 1000) {
                    World.news(p, `Forever young: ${p.getFullName()} and ${person.getFullName()} haven't aged a day, and fans are obsessed`);
                    Celebrity.addFans(p, Celebrity.fans(p) * 0.03);
                }
            } catch { /* ignore */ }
        };
    },
};
