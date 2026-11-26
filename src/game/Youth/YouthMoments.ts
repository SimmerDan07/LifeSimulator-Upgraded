// v0.32.0 "Childhood & Teen Years": random school and home moments for ages 5–17.
// They're Life Moments (LifeMoments.MOMENTS), so they share its pace, its cooldowns and the pop-up switches:
// with weekly pop-ups quiet they go to News with a sensible choice made for you.
import { R } from "../runtime";
import { MOMENTS, Moment } from "../Managers/LifeMoments";
import { Relationships } from "../Social/Relationships";
import { Youth, attr, bond, bondParents, Parent, parentWord, parentsOf, earn, pay, cashOf, money, are } from "./Youth";
import { ACTIVITIES } from "./YouthData";

const roll = (x: number) => Math.random() < x;
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const alive = (x: any) => x != null && (x.getIsAlive?.() ?? true);
const friends = (p: any): any[] => { try { return Relationships.friends(p).filter(alive); } catch { return []; } };
const siblings = (p: any): any[] => { try { return Relationships.siblings(p).filter(alive); } catch { return []; } };
const pets = (p: any): any[] => { try { return (Array.from(p.getFamilyState().getPets() as any) as any[]).filter(alive); } catch { return []; } };
const y = (p: any) => Youth.state(p);
const G = (p: any, n: number) => Youth.grades(p, n);
const Rp = (p: any, n: number) => Youth.rep(p, n);
const P = (p: any, pts: any) => Youth.addPoints(p, pts);
const hasParents = (p: any) => parentsOf(p).length > 0;
const joinedKind = (p: any, kind: string) => Youth.joined(p).some((d) => d.kind === kind);
const joinedAny = (p: any) => Youth.joined(p).length > 0;
const caught = (p: any) => roll(Youth.catchChance(p));
const friendName = (p: any) => { const f = Youth.bestFriend(p) ?? pick(friends(p)); return f ? f.getFirstName() : null; };

export const YOUTH_MOMENTS: Moment[] = [
    // ------------------------------------------------------------------ school days (5–12)
    { id: "y_newKid", min: 5, max: 13, title: "The New Kid", image: "icon_youth_bestfriend", make: (p) => ({
        text: "A new kid is sitting alone at lunch, picking at their sandwich.",
        options: [
            ["Invite them to your table", () => { attr(p, 0, 5, 2); P(p, { kind: 3, social: 1 }); const f = Relationships.makeFriend("school", p); return f ? `${f.getFirstName()} talks a mile a minute once they get going. A new friend.` : "They smiled the whole lunch. You made someone's day."; }],
            ["Leave them be", () => { attr(p, 0, 0, -1); return "You meant to say hi tomorrow. Tomorrow they were sitting with someone else."; }],
        ] }) },
    { id: "y_showTell", min: 5, max: 8, title: "Show and Tell", image: "icon_youth_school", make: (p) => {
        const pet = pets(p)[0];
        return { text: "It's your turn for show and tell tomorrow. What do you bring?",
            options: [
                [pet ? `Your ${String(pet.getPetType?.()?.getTitle?.() ?? "pet").toLowerCase()}` : "A rock that looks like a face", () => { attr(p, 0, 7, 1); Rp(p, 4); P(p, { social: 2 }); return pet ? "The whole class wanted to pet it. You're famous until at least Thursday. (+4 reputation)" : "Everyone agreed: it really does look like a face. (+4 reputation)"; }],
                ["Something you made yourself", () => { attr(p, 0, 5, 2); P(p, { creative: 3 }); return "The teacher put it on the windowsill for a whole week."; }],
                ["Forget all about it", () => { attr(p, 0, -2, 0); return "You showed the class your lunchbox. Nobody clapped."; }],
            ] };
    } },
    { id: "y_recess", min: 5, max: 10, title: "Recess", image: R.drawable.childaction_playground, make: (p) => ({
        text: "The bell rings. Twenty minutes of freedom. What's the plan?",
        options: [
            ["Tag on the field", () => { attr(p, 2, 5, 1); P(p, { athlete: 2 }); return "You were \"it\" for exactly four seconds. Undefeated."; }],
            ["Four square with everybody", () => { attr(p, 1, 5, 1); Rp(p, 2); P(p, { social: 2 }); return "You made up a rule called \"lightning round\" and now everyone uses it. (+2 reputation)"; }],
            ["Read under the big tree", () => { attr(p, 0, 3, 4); P(p, { bookworm: 2 }); return "You finished a whole chapter book. The ending made you gasp out loud."; }],
        ] }) },
    { id: "y_dogHomework", min: 6, max: 12, when: (p) => pets(p).length > 0, title: "The Dog Ate It", image: R.drawable.pet_dog, make: (p) => ({
        text: "Your pet actually chewed up your homework. Really. There are teeth marks.",
        options: [
            ["Bring in the chewed-up pages", () => { if (roll(0.6)) { attr(p, 0, 5, 0); return "The teacher laughed so hard she gave you an extra day."; } G(p, -1); return "\"That's the oldest excuse in the book.\" Half credit."; }],
            ["Redo it all overnight", () => { attr(p, 0, -1, -2); G(p, 1); P(p, { bookworm: 2, hardWorker: 1 }); return "Your hand hurts, but it's done (and neater this time)."; }],
        ] }) },
    { id: "y_classPet", min: 5, max: 9, title: "The Class Hamster", image: R.drawable.pet_guineapig, make: (p) => ({
        text: "You get to take the class hamster, Professor Nibbles, home for the weekend!",
        options: [
            ["Yes! Best weekend ever", () => { attr(p, 0, 8, 2); P(p, { kind: 2 }); if (roll(0.2)) return "Professor Nibbles escaped on Saturday and was found Sunday inside a slipper. Nobody at school needs to know."; return "You built him a cardboard castle. He seemed impressed."; }],
            ["Let someone else", () => { P(p, { kind: 1 }); return "Your friend took him home and sent you a hundred photos."; }],
        ] }) },
    { id: "y_hallMonitor", min: 7, max: 12, title: "Hall Monitor", image: "icon_youth_teacher", make: (p) => ({
        text: "Your teacher asks you to be hall monitor. You'd get a sash and everything.",
        options: [
            ["Wear the sash proudly", () => { attr(p, 0, 3, 1); P(p, { leader: 3, golden: 1 }); Rp(p, -1); return "You wrote up three kids for running. Power suits you."; }],
            ["No thanks", () => { Rp(p, 1); return "You stayed one of the gang."; }],
        ] }) },
    { id: "y_bdayParty", min: 6, max: 12, when: (p) => hasParents(p), title: "Your Birthday Party", image: R.drawable.achievement_happy, make: (p) => ({
        text: `${Parent(p)} ask${parentsOf(p).length === 1 ? "s" : ""} what kind of birthday party you want this year.`,
        options: [
            ["Invite the whole class", () => { attr(p, 0, 10, 0); Rp(p, 6); P(p, { social: 3 }); bondParents(p, 10); return "A bouncy castle, a piñata and 24 sugared-up kids. Legendary. (+6 reputation)"; }],
            ["Just your best friends", () => { attr(p, 0, 8, 3); friends(p).forEach((f) => bond(f, 30)); return "Pizza, a sleepover and the best birthday yet."; }],
            ["A trip somewhere instead", () => { attr(p, 0, 8, 2); bondParents(p, 20); P(p, { golden: 1 }); return "A day at the aquarium with your family. You saw a shark up close."; }],
        ] }) },
    { id: "y_reading", min: 6, max: 12, title: "Reading Challenge", image: "icon_youth_homework", make: (p) => ({
        text: "The library has a summer reading challenge: read 20 books, get a medal and your name on the wall.",
        options: [
            ["Read all 20", () => { attr(p, 0, 3, 5); G(p, 2); P(p, { bookworm: 4 }); Youth.book(p, "Finished the library reading challenge."); return "20 books! Your name is on the wall in gold marker."; }],
            ["Read a few good ones", () => { attr(p, 0, 3, 3); P(p, { bookworm: 1 }); return "You read four, and one of them was the best book ever written."; }],
            ["Summer is for being outside", () => { attr(p, 2, 4, 0); P(p, { athlete: 1 }); return "Bikes, creeks and grass stains."; }],
        ] }) },
    { id: "y_schoolFight", min: 8, max: 14, title: "A Kid Picks a Fight", image: R.drawable.angry, make: (p) => ({
        text: "A kid in your class shoves you in the hallway and calls you a name. Everyone is watching.",
        options: [
            ["Shove back", () => { attr(p, -3, 2, -2); Rp(p, 3); return "It turned into a scuffle. A teacher pulled you apart." + Youth.detention(p); }],
            ["Walk away", () => { attr(p, 0, -2, 3); P(p, { resilient: 2 }); return "Your face was burning, but you kept walking. Later, a few kids said that was the coolest thing you could've done."; }],
            ["Tell a teacher", () => { attr(p, 0, 0, 2); P(p, { golden: 1 }); return "The other kid got detention. You got a nod from the principal."; }],
        ] }) },
    { id: "y_parentsArgue", min: 6, max: 17, when: (p) => parentsOf(p).length >= 2, title: "Raised Voices", image: R.drawable.family, make: (p) => ({
        text: "Your parents have been arguing a lot lately. You can hear them through the wall again.",
        options: [
            ["Ask them if everything's OK", () => { bondParents(p, 25); attr(p, 0, -1, 2); P(p, { kind: 2 }); return "They sat you down and said it's grown-up stuff, and that it's not your fault. It helped to hear it."; }],
            ["Put your headphones on", () => { attr(p, 0, -2, -1); P(p, { resilient: 3 }); return "You turned the music up and waited for it to pass. It did, this time."; }],
        ] }) },
    { id: "y_moving", min: 6, max: 16, weight: 0.4, when: (p) => hasParents(p), title: "Moving House", image: R.drawable.housing_family_home, make: (p) => ({
        text: `${Parent(p)} got a new job across town. You're moving, and changing schools.`,
        options: [
            ["Throw a goodbye party", () => { attr(p, 0, 2, -3); y(p).crowd = null; Rp(p, -(y(p).rep - 20)); P(p, { resilient: 4, social: 1 }); friends(p).forEach((f) => bond(f, 20)); Youth.book(p, "Moved to a new school."); return "Everyone signed your T-shirt. At the new school nobody knows you yet: a fresh start."; }],
            ["Promise to keep in touch", () => { attr(p, 0, -3, -2); y(p).crowd = null; Rp(p, -(y(p).rep - 20)); P(p, { resilient: 4, kind: 1 }); Youth.book(p, "Moved to a new school."); return "You call your old friends every Sunday. The new school is... different."; }],
        ] }) },
    { id: "y_grandparent", min: 5, max: 12, title: "Grandparents' House", image: R.drawable.childaction_visit, make: (p) => ({
        text: "You're spending the weekend with your grandparents.",
        options: [
            ["Bake cookies together", () => { attr(p, 0, 6, 3); P(p, { kind: 2, golden: 1 }); return "The secret family recipe is yours now. (It's extra butter.)"; }],
            ["Listen to their old stories", () => { attr(p, 0, 3, 5); P(p, { bookworm: 1, kind: 1 }); return "Turns out Grandpa once got lost in a cornfield for a whole day. Twice."; }],
            ["Watch TV all weekend", () => { attr(p, 0, 4, 1); return "They let you stay up until 10. Legends."; }],
        ] }) },
    { id: "y_gameNight", min: 5, max: 15, when: (p) => hasParents(p), title: "Family Game Night", image: R.drawable.random, make: (p) => ({
        text: "It's family game night. You're losing at Monopoly. Badly.",
        options: [
            ["Play it out", () => { attr(p, 0, 4, 2); bondParents(p, 20); P(p, { resilient: 1, golden: 1 }); return "You lost, but you made a comeback with Park Place that everyone will be talking about for years."; }],
            ["Flip the board", () => { attr(p, 0, 2, -1); bondParents(p, -10); P(p, { rebel: 2 }); return "Little houses everywhere. Game night is suspended until further notice."; }],
        ] }) },
    { id: "y_roadTrip", seasons: ["summer"], min: 5, max: 15, when: (p) => hasParents(p), title: "Family Road Trip", image: R.drawable.childaction_familyvacation, make: (p) => ({
        text: "Eight hours in the back seat on the way to the beach.",
        options: [
            ["Play car games the whole way", () => { attr(p, 0, 8, 3); bondParents(p, 30); return "You found 46 license plates and everyone sang the whole way."; }],
            ["Sleep with your face on the window", () => { attr(p, 1, 4, 2); return "You woke up with a window print on your cheek, at the beach."; }],
        ] }) },
    { id: "y_siblingFight", min: 6, max: 16, when: (p) => siblings(p).length > 0, title: "Sibling War", image: R.drawable.angry, make: (p) => {
        const s = pick(siblings(p));
        return { text: `${s.getFirstName()} read your diary out loud at dinner.`,
            options: [
                ["Make up", () => { bond(s, 30); attr(p, 0, 1, 3); P(p, { kind: 2 }); return `You and ${s.getFirstName()} ended up laughing about it. Mostly.`; }],
                ["Get revenge", () => { bond(s, -20); attr(p, 0, 5, 0); P(p, { troublemaker: 2 }); return `You put salt in ${s.getFirstName()}'s cereal. War has been declared.`; }],
                ["Tell on them", () => { bond(s, -10); attr(p, 0, 2, 1); return `${s.getFirstName()} lost their phone for a week. You won this round.`; }],
            ] };
    } },
    { id: "y_siblingCover", min: 10, max: 17, when: (p) => siblings(p).length > 0, title: "Cover for Me?", image: R.drawable.family, make: (p) => {
        const s = pick(siblings(p));
        return { text: `${s.getFirstName()} is sneaking out tonight and asks you to cover for them.`,
            options: [
                ["Cover for them", () => { bond(s, 40); P(p, { rebel: 1, kind: 1 }); if (caught(p)) { bondParents(p, -20); return "You both got caught." + Youth.ground(p, "covering for a sibling"); } return `You told ${parentWord(p)} they were asleep. ${s.getFirstName()} owes you big.`; }],
                ["Refuse", () => { bond(s, -15); P(p, { golden: 1 }); return `${s.getFirstName()} called you a goody-goody. You'll survive.`; }],
            ] };
    } },
    { id: "y_lostPet", min: 6, max: 15, when: (p) => pets(p).length > 0, title: "Missing Pet", image: R.drawable.pet_abandon, make: (p) => ({
        text: "Your pet slipped out the back door and didn't come home last night.",
        options: [
            ["Search the whole neighbourhood", () => { attr(p, 1, roll(0.8) ? 8 : -6, 2); P(p, { kind: 1, resilient: 1 }); return roll(0.8) ? "You found them asleep under the neighbours' porch. Never leaving you again." : "Still missing. You put up posters everywhere."; }],
            ["Make posters and wait", () => { attr(p, 0, roll(0.65) ? 6 : -5, 0); return roll(0.65) ? "Someone called the number on the poster. Home safe!" : "No calls yet. You leave the porch light on."; }],
        ] }) },
    { id: "y_camp", seasons: ["summer"], min: 7, max: 15, title: "Summer Camp", image: R.drawable.possesion_campingtent, make: (p) => ({
        text: "Which summer camp do you want to go to?",
        options: [
            ["Sports camp", () => { attr(p, 4, 6, 2); P(p, { athlete: 4 }); const d = Youth.joined(p).find((a) => a.kind === "sport"); if (d) Youth.actState(d.id, p).xp = Math.min(100, Youth.actState(d.id, p).xp + 5); return `Two weeks of drills and lake swims. You came back ${d ? `a better ${d.title.toLowerCase()} player` : "faster and browner"}.`; }],
            ["Science camp", () => { attr(p, 0, 5, 3); G(p, 2); P(p, { brainiac: 4 }); return "You built a rocket that went 300 feet up. And landed in the lake."; }],
            ["Art camp", () => { attr(p, 0, 6, 4); P(p, { creative: 4 }); return "Pottery, painting and a mural with your name in the corner."; }],
            ["Stay home", () => { attr(p, 0, 3, 3); return "A lazy summer of cartoons and popsicles."; }],
        ] }) },
    { id: "y_mathComp", min: 9, max: 14, when: (p) => y(p).grades >= 85, title: "Math Competition", image: R.drawable.skill_financialliteracy, make: (p) => ({
        text: "You've been picked for the district math competition.",
        options: [
            ["Practise every night", () => { P(p, { brainiac: 3, bookworm: 2 }); if (roll(0.55)) { attr(p, 0, 10, 2); Rp(p, 3); Youth.book(p, "Won the district math competition."); return "You won! There's a picture of you holding a giant calculator in the school newsletter. (+3 reputation)"; } attr(p, 0, 2, 1); return "Third place. Respectable."; }],
            ["Wing it", () => { P(p, { brainiac: 1 }); return roll(0.25) ? "You won anyway. Nobody can explain it." : "Seventh place. Fractions are hard."; }],
        ] }) },
    { id: "y_talentShow", min: 7, max: 17, title: "The Talent Show", image: R.drawable.vacation_concert, make: (p) => ({
        text: "Sign-ups for the school talent show close today.",
        options: [
            ["Sing", () => { P(p, { musical: 3 }); if (roll(0.55 + (joinedKind(p, "music") ? 0.2 : 0))) { attr(p, 0, 10, 2); Rp(p, 6); Youth.book(p, "Wowed everyone at the talent show."); return "Goosebumps. The gym went silent, then loud. (+6 reputation)"; } attr(p, 0, -4, -2); Rp(p, -2); return "Your voice cracked on the high note. You finished anyway, and that took guts."; }],
            ["Stand-up comedy", () => { P(p, { social: 3 }); if (roll(0.5)) { attr(p, 0, 10, 1); Rp(p, 7); return "Your impression of the principal brought the house down. (+7 reputation)"; } attr(p, 0, -4, -1); return "Crickets. One kid laughed. You'll always remember that kid."; }],
            ["Magic tricks", () => { P(p, { creative: 3 }); attr(p, 0, 6, 1); Rp(p, 3); return "The rabbit trick didn't work, but the card trick blew everyone's minds. (+3 reputation)"; }],
            ["Watch from the crowd", () => { attr(p, 0, 2, 2); return "You cheered the loudest."; }],
        ] }) },
    { id: "y_bakeSale", min: 6, max: 12, title: "Bake Sale", image: R.drawable.diet_maplepancakes, make: (p) => ({
        text: "Your class is raising money for a field trip with a bake sale.",
        options: [
            ["Bake three dozen cupcakes", () => { attr(p, 0, 5, 2); P(p, { hardWorker: 2, kind: 2 }); return "They sold out in ten minutes. The trip is paid for."; }],
            ["Sell everyone else's", () => { attr(p, 0, 4, 0); P(p, { social: 2 }); Rp(p, 2); return "You could sell sand at the beach. Record sales. (+2 reputation)"; }],
            ["Eat the merchandise", () => { attr(p, -1, 6, 0); return "\"Quality control.\""; }],
        ] }) },
    { id: "y_notes", min: 9, max: 14, title: "Caught Passing Notes", image: "icon_youth_homework", make: (p) => ({
        text: "The teacher catches you passing a note and threatens to read it out loud.",
        options: [
            ["Grab it back", () => { if (roll(0.5)) { Rp(p, 3); P(p, { troublemaker: 1 }); return "Lightning reflexes. The note is safe. (+3 reputation)"; } return "You knocked over a desk." + Youth.detention(p); }],
            ["Let them read it", () => { if (roll(0.5)) { Rp(p, 4); attr(p, 0, 4, 0); return "It was a drawing of the teacher as a superhero. Even she laughed. (+4 reputation)"; } Rp(p, -3); attr(p, 0, -6, -2); P(p, { resilient: 2 }); return "It was about your crush. You'd like to move to another country now."; }],
        ] }) },
    { id: "y_photoDay", min: 5, max: 12, title: "Picture Day", image: R.drawable.achievement_happy, make: (p) => ({
        text: "School picture day. The photographer says \"cheese\".",
        options: [
            ["Your best smile", () => { attr(p, 0, 3, 0); bondParents(p, 10); return `${Parent(p)} ordered the extra-large print.`; }],
            ["A silly face", () => { Rp(p, 3); attr(p, 0, 5, 0); P(p, { rebel: 1 }); return "It's in the yearbook forever. Your friends love it. (+3 reputation)"; }],
        ] }) },
    { id: "y_election", min: 9, max: 12, title: "Class President", image: "icon_youth_council", make: (p) => ({
        text: "Elections for class president are next week.",
        options: [
            ["Run with promises of longer recess", () => { P(p, { leader: 3, social: 1 }); if (roll(0.3 + y(p).rep / 150)) { attr(p, 0, 10, 0); Rp(p, 5); Youth.book(p, "Elected class president."); return "You won in a landslide! Recess is the same length, but nobody's checking. (+5 reputation)"; } attr(p, 0, -3, 0); return "You lost by two votes. Recount? No recount."; }],
            ["Be someone's campaign manager", () => { P(p, { leader: 2, kind: 1 }); return "Your friend won, and you get to be vice-president of snacks."; }],
            ["Stay out of politics", () => "You voted for the kid who promised a pizza party."],
        ] }) },
    { id: "y_standUp", min: 9, max: 17, title: "Someone's Being Picked On", image: R.drawable.angry, make: (p) => ({
        text: "A group of kids is making fun of a classmate until they're close to tears.",
        options: [
            ["Step in", () => { P(p, { kind: 4, leader: 1 }); if (roll(0.7)) { attr(p, 0, 6, 4); Rp(p, 3); Youth.book(p, "Stood up for a classmate."); return "\"Leave them alone.\" They did. Your classmate texted you thank you that night. (+3 reputation)"; } attr(p, 0, -3, 0); Rp(p, -2); return "They turned on you instead for a while. You'd still do it again."; }],
            ["Tell a teacher", () => { P(p, { kind: 2, golden: 1 }); attr(p, 0, 1, 2); return "The teacher handled it quietly. Nobody knows it was you."; }],
            ["Look away", () => { attr(p, 0, -1, -3); return "You think about it more than you'd like to."; }],
        ] }) },
    { id: "y_foodFight", min: 8, max: 15, title: "Food Fight!", image: R.drawable.diet_fastfood, make: (p) => ({
        text: "Someone throws a meatball across the cafeteria. Chaos begins.",
        options: [
            ["Join in", () => { attr(p, 0, 8, 0); Rp(p, 4); P(p, { rebel: 1, troublemaker: 1 }); if (roll(0.35)) return "You were mid-throw when the principal walked in." + Youth.detention(p); return "You hit three people with one mashed potato. Legend. (+4 reputation)"; }],
            ["Duck under the table", () => { attr(p, 0, 3, 1); return "You stayed spotless. Smartest kid in the room."; }],
        ] }) },
    { id: "y_mentor", min: 11, max: 17, title: "A Teacher Believes in You", image: "icon_youth_teacher", make: (p) => ({
        text: "Your teacher keeps you after class: \"You're smarter than your grades show. I'd like to help.\"",
        options: [
            ["Take the extra help", () => { G(p, 6); attr(p, 0, 3, 4); P(p, { bookworm: 3, golden: 1 }); Youth.book(p, "Found a teacher who believed in them."); return "Lunchtimes in her classroom. Things started to click. (+6 grades)"; }],
            ["Say you're fine", () => { attr(p, 0, 0, 0); return "\"The door's always open,\" she said."; }],
        ] }) },
    { id: "y_volunteer", min: 12, max: 17, title: "Volunteer Day", image: "icon_youth_volunteer", make: (p) => ({
        text: "The animal shelter needs volunteers this Saturday.",
        options: [
            ["Spend the day with the dogs", () => { attr(p, 1, 8, 5); P(p, { kind: 4 }); return "You walked eleven dogs. One of them chose you, and you think about him a lot."; }],
            ["Sleep in", () => { attr(p, 0, 2, 1); return "Saturdays are sacred."; }],
        ] }) },

    // ------------------------------------------------------------------ teens (13–17)
    { id: "y_rumor", min: 13, max: 17, title: "A Rumour", image: R.drawable.angry, make: (p) => ({
        text: "Someone started a ridiculous rumour about you, and it's all over school.",
        options: [
            ["Confront whoever started it", () => { P(p, { leader: 1 }); if (roll(0.55)) { Rp(p, 3); return "They admitted they made it up, in front of everyone. (+3 reputation)"; } Rp(p, -4); attr(p, 0, -4, -2); return "It turned into a shouting match. The rumour got worse."; }],
            ["Ignore it", () => { attr(p, 0, -2, 2); P(p, { resilient: 3 }); return "It blew over in a week. Something else happened to someone else."; }],
            ["Start a wilder rumour about yourself", () => { Rp(p, 5); P(p, { troublemaker: 2, social: 1 }); return "Now everyone thinks you're a secret spy. Honestly, better. (+5 reputation)"; }],
        ] }) },
    { id: "y_groupChat", min: 13, max: 17, when: (p) => y(p).phone, title: "Group Chat Drama", image: "icon_youth_phone", make: (p) => ({
        text: "The group chat explodes: two of your friends are fighting and both want you on their side.",
        options: [
            ["Pick a side", () => { const f = pick(friends(p)); if (f) bond(f, -40); Rp(p, -1); return f ? `${f.getFirstName()} left the chat. Things are tense now.` : "Things are tense now."; }],
            ["Play peacemaker", () => { P(p, { kind: 2, leader: 2 }); friends(p).forEach((f) => bond(f, 10)); return "Three hours of messages later, everyone's sending heart emojis again."; }],
            ["Mute the chat", () => { attr(p, 0, 0, 4); return "Blissful silence."; }],
        ] }) },
    { id: "y_viral", min: 13, max: 17, when: (p) => y(p).phone, weight: 0.6, title: "Your Post Blew Up", image: "icon_youth_phone", make: (p) => ({
        text: "A video you posted of your friend falling off a skateboard is going around the whole school.",
        options: [
            ["Enjoy the fame", () => { Rp(p, 10); attr(p, 0, 8, 0); P(p, { social: 2 }); const f = pick(friends(p)); if (f) bond(f, -20); return `Everyone knows your name now. ${f ? `${f.getFirstName()} is not thrilled.` : ""} (+10 reputation)`; }],
            ["Take it down", () => { P(p, { kind: 2 }); const f = pick(friends(p)); if (f) bond(f, 30); return "Your friend was grateful. The internet will find something else."; }],
        ] }) },
    { id: "y_saturdayDetention", min: 13, max: 17, when: (p) => y(p).detentions > 0, title: "Saturday Detention", image: "icon_youth_skip", make: (p) => ({
        text: "Saturday detention: you, a jock, a brain, an artsy kid and a rebel, stuck in the library for eight hours.",
        options: [
            ["Get to know them", () => { attr(p, 0, 6, 4); Rp(p, 3); P(p, { social: 2, kind: 1 }); const f = Relationships.makeFriend("school", p); return `By the end of the day you'd shared secrets you never told anyone. ${f ? `${f.getFirstName()} is your friend now.` : ""}`; }],
            ["Sleep through it", () => { attr(p, 1, 1, 2); return "Eight hours of very uncomfortable sleep."; }],
        ] }) },
    { id: "y_finals", min: 14, max: 17, seasons: ["spring", "winter"], title: "Finals Week", image: "icon_youth_cram", make: (p) => ({
        text: "Finals are next week, and you've barely opened your books.",
        options: [
            ["All-nighters", () => { G(p, 4); attr(p, -2, -3, -6); P(p, { bookworm: 2, hardWorker: 1 }); return "Coffee, highlighters and 3 a.m. panic. You aced at least two of them. (+4 grades)"; }],
            ["Study a bit every day", () => { G(p, 3); attr(p, 0, 0, 1); P(p, { bookworm: 2 }); return "Slow and steady. You felt ready walking in. (+3 grades)"; }],
            ["Accept your fate", () => { G(p, -3); attr(p, 0, 3, 2); return "You watched an entire TV series instead. The finals did not go great. (−3 grades)"; }],
        ] }) },
    { id: "y_sat", min: 16, max: 17, title: "The Big College Exam", image: R.drawable.education_highschool, make: (p) => ({
        text: "The national college entrance exam is this Saturday. Colleges will see your score.",
        options: [
            ["Take a prep course ($300)", () => { pay(p, 300); const good = roll(0.4 + y(p).grades / 200); if (good) { G(p, 4); Youth.book(p, "Got a great score on the college exam."); return "Top 5% in the country. Colleges are going to love you (+4 grades, better scholarships)."; } G(p, 1); return "A solid score. Not amazing, not bad."; }],
            ["Study on your own", () => { const good = roll(0.2 + y(p).grades / 200); if (good) { G(p, 3); return "A great score, and you didn't spend a penny. (+3 grades)"; } return "An average score. Some colleges don't even look at it."; }],
        ] }) },
    { id: "y_extraShifts", min: 14, max: 17, when: (p) => y(p).job != null, title: "Extra Shifts", image: "icon_pjob_fastfood", make: (p) => ({
        text: "Your boss asks if you can work extra shifts during exam week.",
        options: [
            ["Take the shifts", () => { const pjob = Youth.partJob(y(p).job!.id)!; earn(p, pjob.pay); G(p, -3); attr(p, 0, -2, -3); P(p, { hardWorker: 3 }); return `An extra ${money(pjob.pay)}, and a lot of tired mornings. (−3 grades)`; }],
            ["Say school comes first", () => { G(p, 1); P(p, { bookworm: 1 }); return "Your boss grumbled, but understood."; }],
        ] }) },
    { id: "y_concert", min: 13, max: 17, title: "Sold-Out Concert", image: R.drawable.vacation_concert, make: (p) => ({
        text: "Your favourite band just announced a show, and tickets sell out in minutes.",
        options: [
            ["Queue online at 6 a.m.", () => { if (roll(0.5)) { attr(p, 0, 12, 2); Youth.book(p, "Saw their favourite band live."); return "You got two tickets! You screamed so loud your neighbour knocked on the wall."; } attr(p, 0, -5, 0); return "Sold out in 41 seconds. You were 42nd."; }],
            ["Buy from a reseller ($250)", () => { pay(p, 250); attr(p, 0, 12, 0); return "Overpriced, but front row. Worth every penny."; }],
            ["Watch the live stream", () => { attr(p, 0, 4, 2); return "Not the same, but your bed was very comfy."; }],
        ] }) },
    { id: "y_dare", min: 13, max: 17, title: "A Dare", image: R.drawable.random, make: (p) => ({
        text: "Your friends dare you to climb the water tower at night.",
        options: [
            ["Do it", () => { Rp(p, 5); P(p, { rebel: 3, troublemaker: 1 }); if (roll(0.25)) { attr(p, -8, -2, -2); return "You slipped on the way down and sprained your wrist. Still, the view was incredible. (+5 reputation)"; } attr(p, 0, 10, 0); return "You wrote your initials at the top. Nobody will ever top this. (+5 reputation)"; }],
            ["Say no", () => { attr(p, 0, -1, 3); P(p, { golden: 1, resilient: 1 }); return "They called you a chicken for about a day. Then someone else did something dumber."; }],
        ] }) },
    { id: "y_heartbreak", min: 14, max: 17, title: "Heartbreak", image: R.drawable.love_breakup, make: (p) => ({
        text: "The person you've liked all year just started going out with someone else.",
        options: [
            ["Cry it out with your best friend", () => { attr(p, 0, -3, 3); const f = Youth.bestFriend(p); if (f) bond(f, 30); P(p, { resilient: 2 }); return f ? `${f.getFirstName()} brought ice cream and said all the right things.` : "Ice cream and sad songs. It helped."; }],
            ["Write sad songs about it", () => { attr(p, 0, -2, 2); P(p, { musical: 2, creative: 2, resilient: 1 }); return "Three songs. One of them is actually really good."; }],
            ["Pretend you don't care", () => { attr(p, 0, -4, -3); P(p, { resilient: 1 }); return "Everyone could tell you cared."; }],
        ] }) },
    { id: "y_driveFriends", min: 16, max: 17, when: (p) => y(p).license, title: "The Designated Driver", image: R.drawable.possession_car, make: (p) => ({
        text: "Your friends want you to drive them all to the lake. Five people, one car.",
        options: [
            ["Drive carefully", () => { attr(p, 0, 8, 2); friends(p).forEach((f) => bond(f, 15)); P(p, { leader: 1 }); return "Perfect day. You're the official driver now, which is both great and terrible."; }],
            ["Show off a little", () => { Rp(p, 3); if (roll(0.3)) { pay(p, 150); bondParents(p, -30); return `A speeding ticket: ${money(150)}, and ${parentWord(p)} found out.` + Youth.ground(p, "a speeding ticket"); } attr(p, 0, 10, -1); return "Windows down, music up. Nobody got hurt. (+3 reputation)"; }],
        ] }) },
    { id: "y_curfew", min: 14, max: 17, when: (p) => hasParents(p), title: "Past Curfew", image: R.drawable.love_nightclub, make: (p) => ({
        text: "You're at a friend's house and it's already 45 minutes past curfew.",
        options: [
            ["Call home and apologise", () => { bondParents(p, 5); P(p, { golden: 1 }); return `${Parent(p)} came to pick you up. A long, quiet drive home, but no grounding.`; }],
            ["Sneak in through the window", () => { P(p, { rebel: 2 }); if (caught(p)) { bondParents(p, -25); return `${Parent(p)} were sitting on your bed. In the dark.` + Youth.ground(p, "breaking curfew"); } attr(p, 0, 4, 0); return "Perfect landing. Nobody heard a thing."; }],
        ] }) },
    { id: "y_captain", min: 13, max: 17, when: (p) => Youth.joined(p).some((d) => d.kind === "sport" && Youth.actState(d.id, p).xp >= 45), title: "Team Captain?", image: "icon_youth_soccer", make: (p) => ({
        text: "Coach says the team wants to vote for a new captain, and your name came up.",
        options: [
            ["Go for it", () => { P(p, { leader: 4, athlete: 1 }); if (roll(0.55)) { Rp(p, 6); attr(p, 0, 10, 0); const d = Youth.joined(p).find((a) => a.kind === "sport")!; const a = Youth.actState(d.id, p); a.xp = Math.max(a.xp, 70); Youth.book(p, `Voted ${d.title} captain.`); return "The vote was unanimous. You're wearing the armband now. (+6 reputation)"; } attr(p, 0, -3, 0); return "Lost by one vote to your best player. You'll be vice-captain."; }],
            ["Let someone else lead", () => { P(p, { kind: 1 }); return "You voted for your friend. They'll be great."; }],
        ] }) },
    { id: "y_gig", min: 13, max: 17, when: (p) => Youth.joined(p).some((d) => d.kind === "music"), title: "Your First Gig", image: "icon_youth_band", make: (p) => ({
        text: "A café downtown offers your little band a Friday-night slot.",
        options: [
            ["Play it", () => { P(p, { musical: 3, creative: 1 }); if (roll(0.6)) { earn(p, 60); attr(p, 0, 12, 2); Rp(p, 4); Youth.book(p, "Played a first gig downtown."); return `Packed café, free hot chocolate and ${money(60)} in tips. (+4 reputation)`; } attr(p, 0, -2, 0); return "Three people came. Two were your parents. It still counts."; }],
            ["You're not ready", () => "Maybe next time."],
        ] }) },
    { id: "y_tutorAsk", min: 13, max: 17, when: (p) => y(p).grades >= 85, title: "Help Me Pass?", image: "icon_pjob_tutor", make: (p) => ({
        text: "A classmate who's failing chemistry begs you to tutor them before the big test.",
        options: [
            ["Help for free", () => { P(p, { kind: 3, bookworm: 1 }); attr(p, 0, 3, -1); const f = Relationships.makeFriend("school", p); return `They passed! ${f ? `${f.getFirstName()} is your friend for life now.` : "They hugged you in the hallway."}`; }],
            ["Charge $20 an hour", () => { earn(p, 80); P(p, { hardWorker: 2 }); return `Four sessions, ${money(80)}. Business is business.`; }],
            ["You're too busy", () => "They found someone else."],
        ] }) },
    { id: "y_friendDown", min: 12, max: 17, when: (p) => Youth.bestFriend(p) != null, title: "A Friend in a Bad Place", image: R.drawable.health_psychologist, make: (p) => {
        const f = Youth.bestFriend(p);
        return { text: `${f.getFirstName()} has been really quiet lately and skipped school twice this week.`,
            options: [
                ["Be there for them", () => { bond(f, 60); attr(p, 0, -1, 1); P(p, { kind: 4 }); return `You showed up with snacks and just listened. ${f.getFirstName()} said it was exactly what they needed. They're talking to a counsellor now, too.`; }],
                ["Tell a trusted adult", () => { bond(f, 20); P(p, { kind: 2, golden: 1 }); return `A teacher checked in on ${f.getFirstName()}. They got the help they needed.`; }],
                ["Give them space", () => { bond(f, -20); return "They pulled away a little more."; }],
            ] };
    } },
    { id: "y_brokenPhone", min: 12, max: 17, when: (p) => y(p).phone, title: "Cracked Screen", image: "icon_youth_phone", make: (p) => ({
        text: "You dropped your phone and the screen looks like a spider web.",
        options: [
            ["Pay for the repair ($120)", () => { pay(p, 120); P(p, { hardWorker: 1 }); return "Good as new. You bought a case this time."; }],
            ["Hide it from your parents", () => { if (hasParents(p) && roll(0.5)) { bondParents(p, -10); return `${Parent(p)} noticed in two days. Lecture about responsibility.`; } attr(p, 0, -1, 0); return "You live with the spider web now. It's part of you."; }],
        ] }) },
    { id: "y_internship", min: 16, max: 17, seasons: ["summer"], when: (p) => y(p).grades >= 80, title: "Summer Internship", image: R.drawable.work_data_entry, make: (p) => ({
        text: "A local company offers you an unpaid summer internship.",
        options: [
            ["Take it", () => { attr(p, 0, -2, -1); P(p, { hardWorker: 4, leader: 1 }); y(p).jobWeeks += 8; Youth.book(p, "Did a summer internship."); return "Coffee runs, spreadsheets and one meeting where the boss actually asked your opinion. It'll look great on applications."; }],
            ["Enjoy your summer", () => { attr(p, 1, 6, 4); return "Pool, friends and sleeping until noon."; }],
        ] }) },
    { id: "y_yearbookQuote", min: 17, max: 17, title: "Your Yearbook Quote", image: "icon_youth_yearbook", make: (p) => ({
        text: "The yearbook committee needs your senior quote by Friday.",
        options: [
            ["Something inspiring", () => { Youth.book(p, "Yearbook quote: \"Be the person your dog thinks you are.\""); return "\"Be the person your dog thinks you are.\" Classic."; }],
            ["Something funny", () => { Rp(p, 3); Youth.book(p, "Yearbook quote: \"I came, I saw, I forgot what I was doing.\""); return "\"I came, I saw, I forgot what I was doing.\" The committee laughed. (+3 reputation)"; }],
            ["Something mysterious", () => { Youth.book(p, "Yearbook quote: \"You'll understand one day.\""); return "\"You'll understand one day.\" Nobody does. Perfect."; }],
        ] }) },
    { id: "y_seniorPrank", min: 17, max: 17, seasons: ["spring"], title: "The Senior Prank", image: "icon_youth_prank", make: (p) => ({
        text: "Your class is planning a legendary senior prank. They need someone brave.",
        options: [
            ["Mastermind it", () => { Rp(p, 10); P(p, { troublemaker: 3, leader: 2 }); if (roll(0.3)) return "Three hundred rubber ducks in the school fountain. The principal knows it was you." + Youth.detention(p); Youth.book(p, "Masterminded the senior prank."); return "Three hundred rubber ducks in the school fountain. Nobody knows it was you. (+10 reputation)"; }],
            ["Help out", () => { Rp(p, 4); P(p, { social: 1 }); return "You carried a lot of rubber ducks. (+4 reputation)"; }],
            ["Stay out of it", () => "You watched from a safe distance. Good call, probably."],
        ] }) },
    { id: "y_sickDay", min: 6, max: 17, when: (p) => Youth.inSchool(p), title: "A Very Convenient Cough", image: R.drawable.health_doctorvisit, make: (p) => ({
        text: "There's a test today you didn't study for. You could fake being sick.",
        options: [
            ["Fake it", () => { P(p, { troublemaker: 1 }); if (hasParents(p) && caught(p)) { bondParents(p, -15); G(p, -1); return `${Parent(p)} took your temperature: perfectly normal. Off to school, and you're late for the test.`; } attr(p, 0, 5, 2); return "A whole day in bed with cartoons. You'll take the test next week."; }],
            ["Go and do your best", () => { P(p, { resilient: 1, golden: 1 }); G(p, roll(0.5) ? 1 : -1); return "It went better than you thought. Not great, but better."; }],
        ] }) },
    { id: "y_crowdInvite", min: 12, max: 17, when: (p) => y(p).crowd !== "popular" && y(p).rep >= 35, title: "An Invitation", image: "icon_crowd_popular", make: (p) => ({
        text: "One of the popular kids invites you to sit at their table.",
        options: [
            ["Join them", () => { Youth.joinCrowd("popular", p); Rp(p, 6); P(p, { social: 2 }); friends(p).forEach((f) => bond(f, -10)); return "You're with the Popular Crowd now. Your old friends noticed. (+6 reputation)"; }],
            ["Stay with your friends", () => { friends(p).forEach((f) => bond(f, 20)); P(p, { kind: 1 }); return "Your friends saw you turn it down. That meant a lot."; }],
        ] }) },
    { id: "y_crowdClash", min: 13, max: 17, when: (p) => y(p).crowd != null, title: "Lunch Table Wars", image: "icon_youth_crowd", make: (p) => {
        const c = Youth.crowd(y(p).crowd)!;
        return { text: `There's tension between ${c.title.toLowerCase()} and another group. It's about to boil over at lunch.`,
            options: [
                ["Stand with your crowd", () => { Rp(p, 3); P(p, { leader: 1, rebel: 1 }); if (roll(0.25)) return "It got loud. Really loud." + Youth.detention(p); return "You held your ground. Your crowd won't forget it. (+3 reputation)"; }],
                ["Try to make peace", () => { P(p, { kind: 3, leader: 2 }); Rp(p, 1); return "You got both sides talking. Next week they're playing basketball together."; }],
            ] };
    } },

    // ------------------------------------------------------------------ child stars
    { id: "y_starFans", min: 6, max: 17, when: (p) => (y(p).star?.gigs ?? 0) > 0, title: "Recognised!", image: "icon_star_audition", make: (p) => ({
        text: "A family at the mall recognises you from your commercial and asks for a photo.",
        options: [
            ["Smile for the photo", () => { attr(p, 0, 6, 0); Rp(p, 3); return "They said their kids watch you every day. You signed a napkin. (+3 reputation)"; }],
            ["Hide behind your mom", () => { attr(p, 0, 0, 2); return "You're shy, and that's OK."; }],
        ] }) },
    { id: "y_starTired", min: 6, max: 17, when: (p) => (y(p).star?.burnout ?? 0) >= 50, title: "So Tired", image: "icon_star_break", make: (p) => ({
        text: "Early call times, lines to learn, no time for friends. You're exhausted.",
        options: [
            ["Ask to take a break", () => { const s = y(p).star!; s.burnout = Math.max(0, s.burnout - 30); attr(p, 0, 6, 6); bondParents(p, 15); return "Two weeks off. You climbed trees and nobody filmed it."; }],
            ["Push through", () => { attr(p, 0, -4, -5); P(p, { resilient: 2, hardWorker: 2 }); return "The show must go on. You're not sure you want it to."; }],
        ] }) },
];

let installed = false;
/** Adds the youth moments to the Life Moments list (once). */
export function installYouthMoments() {
    if (installed) return;
    installed = true;
    for (const m of YOUTH_MOMENTS) if (!MOMENTS.some((x) => x.id === m.id)) MOMENTS.push(m);
    void ACTIVITIES; void are; void cashOf;
}
