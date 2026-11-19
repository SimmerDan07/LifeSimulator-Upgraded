# Life Simulator (Windows port) — "Life Sim Upgraded"

A desktop port of Mindvacation's *Life Simulator* (Android, v1.05), rebuilt as an
Electron app so it runs natively on Windows and can be overhauled with new content.
**Personal project — the game, its art, sounds and text belong to Mindvacation.**

## Run it

```bash
npm install            # once
npm start              # build + launch the game window
npm run dist:win       # build Windows packages into release/ (portable .exe + zip)
npm run typecheck      # TypeScript check of all game + UI code
npm test               # headless "monkey" test: 3000 random actions, reports any crash
npm run test:features  # checks unlocks, generational play, the property system, schools, family & the Love tab remodel, subscriptions, vampires & babies, the family tree & obituary, long saves & looks & the save folder, Celebrity Life & the Fame Update, old-save loading (692 checks)
npm run test:sensible  # same, but plays like a careful player (longer lives)
```

Keys: `1`–`7` switch tabs, `Esc` goes back, `Enter` confirms a pop-up,
`F11` fullscreen, `F12` dev tools, `Ctrl+R` reload.
Saves: `%APPDATA%\lifesim-upgraded\saves\saveFile.txt` (a `.bak` of the previous save sits next to it).

## Where things live

| Folder | What's in it |
|---|---|
| `src/game/Enums/` | **Game content.** Jobs, events (`RandomEvent.ts`), traits, pets, housing, diets, countries, side hustles, businesses, achievements, life scenarios… Most new content goes here. |
| `src/game/Managers/` | **Game systems.** `Player.ts` (weekly tick: `applyWeekly`), money, family, jobs, health, crime, businesses, alerts. |
| `src/game/RealEstate/` | **Property system.** `RealEstateConfig.ts` (all prices, rents, renovation/repair costs, wear rates, market and mortgage tuning — change numbers here), `RealEstatePortfolio.ts` (ownership, valuation, weekly simulation, actions), `OwnedProperty.ts` (one property record), `RealEstateScreens.ts` (the screens). |
| `src/game/Controllers/` | One generator per tab/screen: builds the list of cards you see. |
| `src/game/Models/` | The card types (button, progress bar, slider, …). |
| `src/game/data/strings.json` | All 3,600 lines of in-game text (`R.string.X` → key `X`). |
| `src/game/runtime/` | Small stand-ins for the Java/Kotlin library calls the original code used. |
| `src/game/save/SaveCodec.ts` | Save-file format. |
| `src/game/ui/bridge.ts` | The seam between game logic and the desktop UI. |
| `src/ui/` | Desktop UI: HUD, tabs, list screens, dialogs, styles. |
| `assets/` | Images (SVG, converted from the APK), sounds, fonts. |
| `electron/` | Window + save-file plumbing. |
| `porting/` | The tooling that translated the decompiled Android code. Kept for reference only — `src/game` is now the source of truth; edit it directly. |

## How the port was made (short version)

The APK was decompiled (jadx, plus Vineflower for methods jadx couldn't handle), cleaned
(Kotlin `when` tables and lost constants restored from bytecode, resource ids mapped back
to names), then machine-translated Java → TypeScript (`porting/j2ts.py`) with hand-written
replacements for Android-only parts. ~20 methods the decompilers failed on were
reconstructed by hand from bytecode (e.g. job salaries, side-hustle income, money formatting).

## Free edition (made with the developers' permission)
All content is unlocked. Switches live in `src/game/Unlocks.ts`:
- `removePaywall` — sandbox mode, all perks, all destinations, extra save slots and "unlock all content" are owned.
- **No store (v0.5.0):** the store screen is gone. What it sold as unlocks is simply unlocked; its money packs and
  Elixir of Youth packs no longer exist (the Elixir became the vampire Cure, now the Vampiric Cure).
  Revive on the death / bankruptcy pop-ups is kept and free (`InAppPurchaseManager` now only handles that).
- `unlockProgression` — scenarios, perks, the achievement save slot and countries that were earned through
  achievements, life goals or daily rewards start unlocked.

## Upgrades (new in Life Sim Upgraded)
- **The Polish Update (v0.25.0)**:
  - **Hobbies** (`src/game/Managers/Hobbies.ts`, Leisure tab, ages 6+): Painting, Guitar, Cooking, Gardening, Running,
    Chess & Board Games, Writing, Gaming. *Practice* (one week, $0–$30) raises skill 0–100 (gains slow near the top:
    `max(2, 9 − skill/14)`); levels Beginner, Amateur 20, Skilled 45, Expert 70, Master 90 with a message each. From
    Amateur, each hobby has a show-off action once every 4 weeks (sell a painting, gigs, cook-offs, farmers' market,
    races up to ultramarathons, chess tournaments, stories/novels, streaming/esports), paying more with skill. Skills
    never decay. Guitar practice trains the Celebrity Life music skill; novels sell better when you're famous.
    `Player.hobbies`.
  - **Life Moments** (`src/game/Managers/LifeMoments.ts`): 45 short stories with 2–3 choices for childhood, teens,
    adults and later life (and some for jobs, partners, kids, parents, friends, money, fame and vampires). 12% chance
    after a week (not within 3 weeks of the last one; each moment once per 2 years; never in jail, while collapsed or
    during Spend Time with Everyone). Lending a friend money pays back (or not) 8 weeks later. `Player.moments`;
    `LifeMoments.enabled` is the off switch tests use.
  - **Celebrate Anniversaries Automatically** (Love tab › Partner, On/Off; `SocialCircle.autoAnniversary`): a $500
    dinner (+80 relationship, +8 happiness), or a free night in (+40) if you can't afford it. Never forgotten.
  - **Celebrity × Vampire** (`src/game/Lifepaths/Crossover.ts`, installed by `GameStateManager.init`): Fake Your Death
    while famous drops your fans to a handful (≤2,000) and the brand, fan club, TV series and Legend status stay with
    the dead star; with 100K+ fans before, *Return from the Dead* ($250K, once) wins back ~40% (+30 suspicion).
    Collapsing while famous makes "missing"/"found alive" headlines. Every 5 vampire years famous: "still looks the
    same" headlines (+2% fans). Turning a celebrity partner: a "forever young" headline. *Feed on a Superfan*
    (Rising Star+), *Midnight Show* (vampire with a celebrity career). Charm gives +20% fan gains; paparazzi can catch
    a vampire on camera (`Celebrity.vampirePhotos`: +8 suspicion, +3% fans). Hooks: `Vampire.hooks`.
  - **v0.25.1 bug hunt**: `npm run test:deep` (`test/deepfuzz.ts`) plays 10 starting situations (child, teen, family,
    old age, broke, vampire, thirsty vampire, celebrity, vampire celebrity, hobbyist) by random clicks on every tab,
    lifepath screen and person screen, checking ranges, broken text and save round trips after every step. Fixes: you
    can't feed on a partner you turned (`Vampire.willingPartner` / `partnerFeedLock`); life moments don't offer
    choices you can't pay for; Final Rest says "less than a year" instead of "0 years"; free Lifepaths actions say
    "Go" instead of "$0".
  - **v0.25.2 contradictions fixed**: vampires can't buy Assisted Dying (`AssistedDying.available`; they have Final
    Rest); the Cure clears Withered; while a vampire lies collapsed (or is in jail) nothing happens "for" them: no
    automatic anniversaries or new friends (`Relationships.away`), no subscription benefits (`Subscriptions.paused`),
    no celebrity business/events/awards (only fans fading), a running TV series is cancelled, and loans older than a
    year are forgotten. Fake Your Death: a partner who doesn't know grieves and leaves, family who don't know drop 300
    (they think you're dead), pending loans vanish, and the dead star's catalogue/awards/royalty counters/rivals/
    celebrity friends move to `CelebrityState.former` (restored by Return from the Dead). Hobbies: kids' supplies are
    free; gardening (and running races) cost a vampire happiness in daylight; the charity 10K moment too.
  - **Text fixes**: 25 typos in the original game text (Panhandler, Disease Eradication, necessary, available,
    therapeutic, Software Company, team names…).
- **Generational play** (`src/game/Managers/Generations.ts`): when you die, "Continue as your child" lets you
  play on as any living child aged 8+. The heir inherits money (after debts), homes, possessions, businesses,
  investments and pets, keeps their job, gets schooling that fits their age/job, and has the deceased parent
  (and surviving partner) as parents. The profile shows your generation; the parent stays in the cemetery.
- **Property System Overhaul 1.0** (`src/game/RealEstate/`, Profile tab → Housing → *Real Estate*):
  - **Every property is its own record**: address, city, neighborhood, type (residential or investment), purchase price,
    current value, who bought it and when, condition, renovations, use, occupants, tenant, mortgage, and a full history
    (purchases, moves, tenants, repairs, renovations, gifts, inheritance). Sold and gifted properties stay listed.
  - **Property market**: new listings every 4 weeks across neighborhoods (Downtown, Waterfront, Suburbs, Old Town,
    Countryside, Industrial), in fixer-upper to pristine condition, some under and some over value. Buy with cash or a
    **mortgage** (20% down, 5.5% over 30 years, approved against your job pay + rent or your savings; pay off any time).
  - **Dynamic prices**: each country has a price index that drifts with a slow long-run rise, weekly noise and the
    occasional boom or slump (you get a banner). Value = type × neighborhood × country × market × condition × renovations.
    Sell above or below what you paid (5% agent fees; any mortgage is paid off from the sale).
  - **Condition, wear and problems**: properties wear over time; leaks, burst pipes, broken heating, faulty wiring,
    pests, mold, broken windows and cracked foundations happen and keep doing damage until fixed. Hire a pro, or DIY
    (a quarter of the price, but it can fail; big jobs need a pro). Problems at your own home pop up with fix buttons
    and make you unhappy (some hurt health). Maintenance crew / DIY touch-ups restore condition.
  - **Upkeep plans**: None (cheap, runs down in about a decade), Standard (a manager fixes minor problems after 3 weeks,
    major after 6) or Premium (slow wear, everything fixed within 1–2 weeks).
  - **Renovations**: kitchen, bathrooms, bedrooms, living room, flooring & walls, exterior — three levels each
    (Basic refresh → Modern → Luxury). They raise value, rent and condition, and make your home happier to live in.
  - **Running costs**: property tax (by country), upkeep, utilities for homes you or your family live in, mortgage
    payments — all shown in Weekly Cash Flow and on each property.
  - **Rentals**: properties you don't live in can be rented out; tenants come and go (faster and longer in good
    condition). Apartment complexes, skyscrapers and space hotels have an occupancy rate instead.
  - **Family**: move between owned homes; let parents or adult children live in a property rent-free (they grow closer
    to you); give a property to a family member.
  - **Inheritance**: with generational play the heir inherits every property with its mortgage and history; property
    given to the heir comes back to them, and an heir who lived in a family property keeps living there (the surviving
    parent stays on in the old family home).
  - **One system for every home (v0.6.0)**: every place you live is a real property record — one you **own** (bought
    from *Homes for Sale*) or one you **rent** (a lease from *Homes for Rent*, with its own address, landlord and
    weekly rent; the landlord handles repairs). The old fixed housing list, fixed rents and "Buy 1 / Buy max / Sell all"
    standard properties are gone. Only the basic places (park bench, shared room, parents' house) keep the original
    fixed rules. Scenario starts and old saves that rented a house/condo/estate become real leases automatically.
  - **Home comfort** replaces the old fixed "+1 happiness" tags: each home type has its own happiness/sanity, scaled
    by condition, plus renovations.
  - **Six new homes (v0.6.0)** — mid-range: Townhouse (~$350K), Ranch House (~$650K), Family Home (~$850K);
    high-end: Penthouse (~$3M), Beachfront Villa (~$6M), Hilltop Mansion (~$25M). All six use the user's own
    icons (`assets/images/housing_*.png`: Townhouse, Ranch House and Family Home in v0.6.1; Penthouse, Beachfront Villa
    and Hilltop Mansion in v0.12.1).
  - **Old saves**: properties owned in a pre-0.4 save are turned into records automatically on load (the home you live
    in becomes your residence, the rest become rentals with tenants), so rental income carries on at the original rate.
- **Built for very long saves (v0.18.0)** (`src/game/Managers/Lineage.ts`, `src/game/Models/Paging.ts`):
  - Every life that ends gets a ~1.4 KB record (`CemetaryState.records`: name, ages, cause, badges, tombstone lines,
    obituary, look) tagged with its family line (`Player.lineId`) and generation. Only the newest 25 lives keep
    their full ~35 KB snapshot; older ones show their Life Summary from the record (no revive). The player no longer
    carries a growing `ancestors` list; older saves' ancestor names are turned into records.
  - Measured: 900 generations = a 2.15 MB save, ~15 ms to save (it would have been ~32 MB).
  - Pages: a **Family Line** screen (`GenericListType.familyLine` 36) with every generation, 10 a page, opening on
    the newest (« −10 ‹ page box › +10 »); the cemetery (25 a page, newest first); relative lists (30 a page); and
    family tree rows with more than 14 people page inside the row (‹ 1/3 ›).
  - Fixes: a surviving partner no longer also appears as the heir's grandparent; two moms or two dads both show in
    the tree.
- **Looks (v0.18.0)** (`src/game/Social/Appearance.ts`, `tools/gen-heads.mjs`): everyone has one look for life — head
  style, skin tone (Fair, Light, Tan, Olive, Brown, Deep) and hair color (Brown, Black, Blonde, Red, Light Brown) — so
  nobody changes skin color when they age up. Children take after their parents, relatives after the parent they
  come from; partners, friends and strangers vary. Pick your look when starting a new game; Profile and person
  screens show it. The build recolors every SVG head (240 variants for the original art) into `dist`; new head
  styles drop in as `head_<male|female>_s<N>_<1-4>.svg`. Older saves: the player keeps the original look.
- **Art slots (v0.18.0)** (`src/game/data/ArtSlots.ts`): 27 rows that borrow an icon now have their own file name
  (`icon_vamp_*`, `icon_power_*`, `icon_bond*`, `icon_sub_coach`) and fall back to the stand-in until that file exists.
- **Save folder (v0.18.0)** (`electron/main.cjs`): saves live in `Documents\Life Simulator\Saves` (with a READ ME and
  a `.bak` of the previous save); saves from older versions are copied there on first launch; if Windows blocks
  Documents, saving falls back to the old app-data folder. Settings › Save Folder shows the path and opens it.
- **Extended family & Family Tree (v0.17.0)** (`src/game/Social/ExtendedFamily.ts`, `FamilyTree.ts`):
  - New relatives in the SocialCircle (`SocialPerson.kind`): grandparents, aunts & uncles, cousins, nieces & nephews,
    grandchildren and great-grandchildren, linked by `parentId` (whose child) and `side` (which parent's family).
  - New games and older saves roll both parents' families once (4 grandparents, 0–3 aunts/uncles a side, their kids;
    plus kids for adult siblings, children and grandchildren). Mom's side gets her maiden name.
  - The family grows: your parents have more children until your mother (or the younger parent) turns **55**
    (6% a year, up to 8 siblings); adults aged 20–49 have babies: your children (grandchildren, 9%/yr, up to 4),
    grandchildren (great-grandchildren, 9%/yr, up to 3), siblings (nieces/nephews, 8%/yr) and aunts/uncles (cousins,
    6%/yr). Vampires don't. Relatives age, can die (alert or banner), get a funeral, and drift gently like parents.
  - Love tab: an Extended Family section (Family Tree row + one row per kind, "New baby!") opens lists grouped by side
    or parent (`GenericListType.relatives` 34). Person screens show their family and their children; new actions: Call,
    Visit, Give a Gift, Listen to Their Stories, Babysit, Spoil Them, Tell Them Family Stories, Pay for College.
  - **Family Tree** screen (`GenericListType.familyTree` 35, `FamilyTreeViewModel`): generations from grandparents to
    great-grandchildren, grouped by family; tap anyone.
  - **Heirs** inherit the tree one generation down (grandparents ← your parents, aunts/uncles ← your siblings, cousins ←
    your nieces/nephews, their own kids ← your grandchildren, and so on); the other parent's family is rolled fresh.
- **Obituary (v0.17.0)** (`src/game/Managers/Obituary.ts`): the cause of death is recorded with the death alert
  (`Player.deathCause`); the Life Summary (and cemetery) shows a written obituary plus cause, age, vampire years, net
  worth, career and living family.
- **Eternal Bond (v0.17.0)**: when you and your partner are both vampires — you never drift apart, fight hunters
  together (70% to win), your partner shares your blood diet (double cost; with Feed by Hand they hunt alone, +2
  suspicion a week), and you get Hunt Together, Dance Through the Night and Eternal Vows (once every 10 years).
  Other loved ones you turn add 2 suspicion a year each.
- Fixed the "Renowed Actor" typo (now "Renowned Actor").
- **Celebrity Life: The Fame Update (v0.20.0)** (`src/game/Lifepaths/CelebrityWorld.ts`, `CelebNames.ts`):
  - **Headlines**: a tabloid feed of everything you do and everything that happens to you (hits, flops, awards, scandals,
    dating, weddings, feuds, foundations…). The latest three are on the Celebrity Life screen; *All Headlines* lists them
    all by age; the Lifepaths menu shows the latest one.
  - **Discography & Filmography**: every single, album, movie, TV season, stage show, music video, dance challenge, tour,
    commercial, memoir and merch drop gets a generated name and a result (#1, Top 10, Platinum, Blockbuster, Hit show…).
    Your best work becomes what you're **known for** (status card, obituary, Life Summary).
  - **Rivals**: one per career, with their own fans that grow every week; a *You vs* meter and head-to-head record.
    **Feuds** (Clap back / Take the high road / Offer a collab — a collab can end the feud and make them a friend),
    **Drop a Diss Track** (music), **Dance-Off vs Your Rival** (dance), **Premiere Showdown** (acting).
  - **Celebrity Circle**: A-List Parties make celebrity friends; **Collaborate** with your most famous friend (a "feat."
    single, a co-starring movie or a joint show); **Date a Celebrity** (Famous+, single): a famous partner with a
    *Celebrity* badge on the Love tab, shared fans every week, paparazzi photos of you both, a **Wedding of the Year**,
    and breakups that make the news.
  - **Awards Night**: nominations become a red-carpet choice (Classic & elegant / Bold statement / Daring look — best or
    worst dressed), sometimes up against your rival.
  - **Movies** now have genres (Action pays most, Drama and Indie are awards bait, Comedy pleases crowds, Horror is a
    gamble). **TV series** (Supporting Actor+): 20-week seasons with weekly pay and fans; hit shows get renewed.
    **Your Sound** for musicians: Pop (+10% fans), Hip-Hop (charts and diss tracks), Rock (+25% tours), R&B (Music
    Awards), Country (loyal fans, softer scandals), Electronic (more viral hits).
  - **Business**: Drop Merch (every 8 weeks), Official Fan Club (weekly dues, fans fade half as fast), Launch Your Own
    Brand (moved here), Start a Foundation ($1M; +1 reputation a week, softer scandals), Write Your Memoir (30+).
  - **Legacy**: Star on the Walk of Fame, **Farewell Tour** (50+): you become a **Legend** and your fans never fade;
    **Hall of Fame** (45+, Icon or 5 awards).
  - **Young Talent** (ages 6–17): talent shows and TV commercial auditions (6–13) — be a child star before 14.
  - **29 milestones** (Local Talent … Icon, Child Star, Born Famous, Number One, Diamond, Blockbuster, TV Star, Gone Viral,
    World Champion, Grand Slam, Trophy Cabinet, Triple Threat, Bigger Than Your Rival, Feud Winner, Power Couple, The
    Comeback, Mogul, Philanthropist, Bestselling Author, Walk of Fame, Hall of Fame, Legend…) with their own screen.
  - **Fame chip on the top bar** (fans + tier) that opens Celebrity Life from anywhere.
  - 18 more art slots (`icon_celeb_*`).
- **Celebrity Life (v0.19.0)** (`src/game/Lifepaths/Celebrity.ts`, `CelebrityScreen.ts`, state `CelebrityState.ts`):
  - The **Lifepaths tab is now a menu**: Celebrity Life (a gold star, `assets/images/lifepath_celebrity.svg`) and Vampire,
    each with a status line and an Open button (`GenericListType.lifepath`, key `celebrity` / `vampire`).
  - **Three celebrity careers, only offered here** (not on the Work tab): **Acting** (Extra → Background Actor →
    Commercial Actor → Theater Ensemble → Supporting Actor → TV Series Regular → Lead Actor → Movie Star → Renowned Actor;
    Theater degree from Theater Ensemble), **Music, reworked** (Street Performer → Bar & Café Gigs → Session Musician →
    Opening Act → Recording Artist → Chart Climber → Headliner → Stadium Act → Music Legend; the Music & Production degree
    from Recording Artist) and **Dance, new** (Street Dancer → Dance Crew Member → Backup Dancer → Music Video Dancer →
    Dance Captain → Tour Choreographer → Celebrity Choreographer; Theater degree from Dance Captain). They're real jobs:
    the Work buttons pay and promote them (the Celebrity Life screen has the Work buttons too), and if you have one the
    Work tab shows its card with a note pointing to Lifepaths.
  - **Fans and fame tiers**: Unknown → Local Talent (1K) → Rising Star (10K) → Famous (100K) → Star (1M) → Superstar
    (10M) → Icon (100M), with an alert for each new tier. Working a celebrity job earns fans and skill; fans fade 1% a
    week if you go more than two weeks without working or doing something public. Each tier above Rising Star is harder
    to climb, and fans level off toward a ceiling of 800 million.
  - **Fame gates the top jobs**: TV Series Regular / Chart Climber need Rising Star, Lead Actor / Headliner need Famous,
    Movie Star / Stadium Act need Star, Renowned Actor / Music Legend need Superstar; Dance Captain needs Local Talent,
    Tour Choreographer Rising Star, Celebrity Choreographer Famous. The job card shows what the next promotion needs,
    with a one-time alert. Fame also speeds promotions (Famous +1 week of progress per week worked, Superstar +2, Icon +3).
  - **Skills** (acting, music, dance; the career's degree adds 15) drive chances. **Activities** (each takes a week):
    Acting — Acting Class, Audition for a Role (bonus, fans, faster promotion), Star in a Movie (Lead Actor+: flop, hit or
    blockbuster). Music — Music Lessons, Write a Song, Record a Single (didn't chart / top 100 / top 10 / #1), Release an
    Album (8 songs, Recording Artist+: gold, platinum or diamond), Go on Tour (Opening Act+, ticket sales up to $20M),
    Shoot a Music Video (can go viral). Dance — Dance Practice, Street Performance (tips), Dance Battle ($1,000), Start a
    Dance Challenge (can go viral), Choreograph a Show (Dance Captain+), World Dance Championship (once a year, a title).
    Fame — Post on Social Media, Fan Meet & Greet, Walk a Red Carpet, Talk Show Interview, Host a Charity Gala, Launch Your
    Own Brand ($250K, Star+, earns 0.1% of your fans in dollars every week), Star on the Walk of Fame (Icon, or Superstar
    with 3 awards).
  - **Reputation** (0–100): low reputation slows fan growth; at 10 or less you're **cancelled** (your agent leaves) until
    it's back to 35 (the comeback). **Team**: Agent ($1,000/wk: better auditions, more deals), Publicist ($1,500/wk: half
    the scandals, fans fade half as fast), Bodyguard ($2,500/wk: no stalkers). **Royalties** every week from fans, hits,
    albums and movies.
  - **Events**: paparazzi, fan mail, tabloid scandals (Apologize / Deny it / Lean into it), endorsement offers (some
    companies turn out shady), stalkers (Superstar+ without a bodyguard). **Awards** once a year (Golden Star Awards,
    Music Awards, Dance Awards): a busy year in your career earns nominations, and skill and reputation win them.
  - **Crossovers**: fame helps dating (+8% per tier); a famous vampire (Star+) draws suspicion unless they have Mind Fog;
    heirs of a famous parent start with 10% of the parent's peak fans; the obituary, Life Summary and Family Line remember
    fame and awards; the Profile shows a Fame row. Degree descriptions on the Education tab explain what they unlock.
  - 28 new art slots (`icon_celeb_*`, `src/game/data/ArtSlots.ts`) use stand-in icons until drawn.
- **Vampire update 2 (v0.16.0)** (`src/game/Lifepaths/Vampire.ts`):
  - The Cure is now the **Vampiric Cure** and costs **$300 billion**.
  - **One vampire life per lifetime**: once cured you can never become a vampire again (no pale stranger, no Seek, no
    bite; the Lifepaths tab says "Human Again"). Heirs start a new life and can.
  - **A vampire's health never decays**: the Health tab shows Good / 0 a week at any frozen age, and weekly health
    losses (age, food, housing, jobs, traits) are ignored (`Vampire.protectHealth`). **v0.21.1:** nothing mortal can
    lower a vampire's health at all — every health loss is blocked (`AttributeState.healthGuard`) except starving for
    blood and a hunter's stake; well-fed vampires (thirst under 60) heal +3 health a week.
  - **Blood diets** (`BLOOD_DIETS`; Health tab → Blood Diet → Choose, or Lifepaths → Feeding → Change):

    | Diet | Cost a week | Thirst a week | Also |
    |---|---|---|---|
    | Feed by Hand | $0 | +1.04 (fills in 2 years; v0.22.0, was +5) | use the Feeding actions |
    | Rats & Strays | $0 | +0.52 (fills in 4 years) | −3 happiness |
    | Butcher's Blood | $300 | −3 (was +3) | −1 happiness |
    | Blood Bank Bags | $2,000 | −10 | +1 health; needs Blood Bank Contact or a medical job |
    | Nightly Hunting | $0 | −20 | +2 happiness, +4 suspicion, 5% police trouble (not with Mist Step) |
    | Willing Donors | $8,000 | −15 | +3 happiness, +2 sanity, +1 suspicion |
    | Rare Vintage | $50,000 | −20 | +2 health, +6 happiness, +4 sanity |

    Diets pause while curing or in jail; older saves start on Feed by Hand. New icons: `vdiet_rats`, `vdiet_butcher`,
    `vdiet_bloodbag`, `vdiet_vintage` (SVG).
- **Vampire lifepath (v0.15.0)** (`src/game/Lifepaths/Vampire.ts`, state `VampireState.ts`, Lifepaths tab, icon
  `assets/images/lifepath_vampire.png`):
  - **Becoming one (18+)**: a pale stranger can appear at nightclubs and local events (2%), or *Seek the Ancient*
    ($5,000, 1 in 4). *Accept the Bite* (with a warning) drops health to 50; you rise a week later with 1 blood power.
  - **Never aging**: your age freezes and true age keeps counting (`calendarOffset` keeps months and new years moving;
    `Player.calendarWeeks()`). People you turn freeze too.
  - **Thirst** (HUD bar, red; v0.22.0) takes 2 years (96 weeks) to fill on Feed by Hand: 60+ happiness −2 a week, 80+ also
    sanity −3. **At 100 you collapse** (`Vampire.collapse`, after the week ends): 10–40 years go by while you lie somewhere
    (alerts are muted and summed up: "Okay" ones still happen, questions are declined; money frozen, you can't die; mortals
    drift, age and miss anniversaries, vampires you turned wait for you). A passer-by gives you blood
    (thirst 40, they become a friend at 650). The price: your job, half your cash (declared missing), half your blood
    power, a mortal partner has you declared dead and leaves (a turned one waits), and you wake **Withered**: 20 health,
    then for 2 years health is capped at 50, doesn't heal, −1 happiness a week. Suspicion −30. Feed: Blood Bank Contact, Animal Blood, Hunt (police risk), Your Partner (willing ones).
  - **Suspicion** (red meter; rises yearly, from hunting, frenzies and telling people) — at 80+ hunters may come: Fight (50% win, 25%
    hurt, 25% death), Flee (lose job, −50 suspicion) or Hide ($10k). Lay Low, Fake Your Death ($20k; v0.23.0: also resets every
    career to level 1 with no progress and years-in-career 0, `JobState.resetCareers`), Move City ($5k).
  - **Sunlight** (v0.21.1): daytime leisure costs −10 happiness (−5 with Sun Ward) and a week at a day job −2, unless you
    have Night Owl. (Before v0.21.1 it cost health.)
  - **Blood powers** (1 a year, +1 every 10 years): Charm (relationship gains ×1.25), Night Owl (work pays ×1.2, no sun
    at work), Blood Bank Contact, Mist Step (no police when hunting), Sun Ward (half sun damage), Mind Fog (suspicion −5 a week).
  - **Loved ones**: Tell Your Secret (they may accept, or recoil and talk), Turn a partner/parent/child/sibling/friend
    (3 blood power), Find a Coven (vampire friends). Badges say "Vampire". Family deaths hit harder.
  - **No biological children** while a vampire (adoption, surrogacy and insemination still work).
  - **Endings**: the Cure (v0.15.0: $1M; v0.16.0: the *Vampiric Cure*, $300B; 4 weeks, then you age from where you froze) or
    *Final Rest*. The old Elixir of Youth is gone from the Health tab and family screens.
  - Tests: `test/vampire.ts`.
- **Children for every couple (v0.15.0)** (`src/game/Social/Babies.ts`): fixes a bug where a man could get pregnant
  (the player always carried). Now only a woman carries; two men use **Surrogacy** ($100k), two women use
  **Artificial Insemination** ($15k, you carry unless infertile), and single adults can **Adopt a Child** ($50k) from
  the Children section. The Love tab says "You are / Your wife is / Your surrogate is pregnant".
- **Lifepaths tab (v0.14.0)** (`src/game/Controllers/LifepathsModelGenerator.ts`, icon `assets/images/tab_lifepaths.svg`):
  an eighth tab after Bank (key 8) with an all-seeing eye. `MainGameTab.Lifepaths` has ordinal 7.
- **Subscriptions (v0.13.0)** (Profile tab, `src/game/Managers/Subscriptions.ts`): pay every week, benefit every week.

  | Subscription | Cost | Every week | Needs |
  |---|---|---|---|
  | Gym Membership | $50 | +2 health | 14+ |
  | Gym Coach | $150 | +3 health | 14+, a Gym Membership |
  | Therapist | $200 | +4 sanity | 12+ |

  **Automatic Savings (v0.23.0)**: free (v0.24.1: on the Bank tab only, at the end of the Bank section), Set Up / Change opens a chooser (25%, 50%, 75%, 80%,
  Turn Off). That share of every paycheck (`JobState.work` → `Subscriptions.payCheck`) goes straight to savings, the rest
  to cash. `Player.autoSavePercent` / `Player.autoSaved` (total, shown on the row); off in older saves.
  **Pay Bills from Savings (v0.24.0)**, the row after it, On/Off: weekly bills (`MoneyUpdateType.expense`) go to the savings
  delta (labelled "(from savings)" in Weekly Cash Flow) while savings can cover them, else cash (`MoneyState.billsFromSavings`
  hook, `Player.billsFromSavings`). Both rows are on the Bank tab only (`Subscriptions.moneyCells`).
- **True ages (v0.24.0)**: every person card shows "Age: N (true age M)" (`FamilyExtras.ageText`); the Family Tree adds
  "(true N)" when it differs.

  Subscribing or cancelling is instant; the first payment comes at the end of the week. They show in the weekly cash
  flow and weekly modifiers, pause while you're in jail, and are all cancelled if you end a week in debt. Cancelling the
  gym also cancels the coach. Saved in `Player.subscriptions` (empty in older saves). Prices and effects are in
  `SUBSCRIPTIONS` at the top of the file.
- **Relationship drift (v0.12.1)** (`Relationships.drift`): scores drift 1 a week when you do nothing with someone
  (was 2; Apathetic 2, Emotional Intelligence 0). While you're under 18 your parents and siblings don't drift at all,
  and as an adult time alone never takes them below 400 (Good). Older saves get a one-time repair: parents and siblings
  below that are raised to 400. The v0.12.0 repeat-action penalty is gone: the same action gives the full amount every week.
- **Love tab remodel (v0.12.0)** (`src/game/Social/`): the Love tab is now a people screen.
  - **Layout** (`LoveScreens.ts`): status and counters on top with group actions (Spend Time with Everyone, Family
    Gathering, Family Vacation), then **Partner** (or *Find Love* with the dating options when single), **Parents**
    (allowance, Road Trip), **Children**, **Siblings**, **Friends** (+ Meet New People, and a *Make Friends Automatically* On/Off toggle — v0.21.1 — that stops new friends
    turning up at school or work on their own), **Pets** (+ Adopt Pet),
    **Past Relationships** (one row that opens the list) and **More** (Come Out). Empty groups are hidden.
  - **Cards** (`Models/PersonCardViewModel.ts`, drawn in `src/ui/cells.ts`): avatar head by age and sex (pets show their
    picture), "Daughter - Marcene Larson", "Age: 46 (true age 56)", and a bar printed "906/1000" coloured red Distant,
    orange Lacking, yellow Good, green Close/Besties. Oldest first; the deceased are greyed under "In memory".
    Badges: "Birthday this week", "Anniversary this week".
  - **One person screen for everyone** (`GenericListType.personDetails`; the old child/parent/pet screens open it too):
    large card, an About card (mood, personality, Together/Married, next anniversary and birthday, school or job, how
    you met, pet benefits), then **Spend time**, **Big moments** and **Hard choices**. Your partner now has a screen.
  - **New actions** (`LoveActions.ts`, one week each unless noted):
    | Who | New actions |
    |---|---|
    | Partner | Cook Dinner Together (+10), Deep Talk (+12, shows their mood), Give a Gift ($200, +15), Weekend Getaway ($1,500, +60), Anniversary Celebration (anniversary week, $500, +80), Couples Therapy (score < 300, $300, +40), Renew Your Vows (married 10+ years, $5,000, +150) |
    | Parents | Call (+20) and Visit (+60) when you live apart, Ask for Advice (+10), Help Around the House (+25, at home), Take Them on Vacation (18+, $2,000, +100), Ask for Money (18+, −20, maybe cash; every 24 weeks) |
    | Children | 0–3: Feed and Cuddle (+10), Sing a Lullaby (+8). 5–11: Help with Homework (+15), Sign Up for Sports (6+, $100, +20). 12–17: Talk About the Future (+20), Teach to Drive (16–17, needs a car, +30). Birthday Party (birthday week, 4–17, $300/$500, +60). 18+: Family Dinner ($100, +25), Give Money ($1,000, +40), Help with Rent ($200 a week until you stop, +5 a week) |
    | Pets | Go for a Walk (dogs, +20), Play Together (+15), Grooming (dogs/cats, $80, +12), Vet Checkup ($200, +10, halves their chance of dying for a year) |
    | Siblings | Hang Out (+15), Play Video Games / Prank (both under 18), Call / Visit (living apart), Give a Gift, Lend $1,000 (+30, 60% chance it's paid back in 8–24 weeks), Attend Funeral |
    | Friends | Hang Out, Call (8+), Go to the Movies ($30), Go to a Party (16+, $50), Give a Gift ($100), Unfriend |
    | Exes | Text Them (+10, small chance they want you back), Ask to Get Back Together (score 500+), Remove from List |
    | Everyone | Family Gathering ($250, +30 with every family member), Meet New People (50% chance of a new friend, up to 10) |
  - **Systems** (`Relationships.ts`): every relationship still uses the 0–1000 score and the weekly drift (doing
    something with someone skips it that week). **Moods** (Happy, Fine, Stressed, Upset) are re-rolled every 4 weeks,
    weighted by the score and a partner's personality; Stressed/Upset halve gains, and Deep Talk, Call, Ask for Advice and
    Couples Therapy lift them back to Fine. (The v0.12.0 repeat-action penalty was removed in v0.12.1.) **Anniversaries** come from the Together/Married counters;
    missing one costs 40 and upsets your partner. **Siblings**: new games roll 0–3; heirs get the deceased's other
    children. **Exes**: a breakup or divorce keeps them with their score. **Friends** are met at school (4–17) or work
    (2% a week) or with Meet New People; one you ignore until 0 drifts away.
  - **Saves**: everything new lives in `Player.social` (`SocialCircle.ts`); older saves open with no siblings, friends or
    exes and everyone Fine.
  - **Action row pictures are back**: every action row shows its original picture again (the port turned the picture
    names into NaN), including Come Out and Assisted Dying (your request in v0.7.0 is reversed), Retire and All Perks.
- **Playtime (v0.11.0)** (Leisure tab, ages 0–8, `src/game/Managers/KidsLeisure.ts`): Nap Time (0–4), Play with Toys,
  Bedtime Story, Go to the Playground (2+), Play Catch with a Parent (3+), Family Movie Night ($10), Children's Museum
  (4+, $20), Go to the Carnival (3+, $40), Theme Park Trip (4+, $150), Family Vacation ($400). The family ones bring
  you closer to your parents.
- **Weeks left (v0.11.0)**: every school, degree, skill and charity project you can study shows "N weeks left".
- **Family & love (v0.11.0)** (`src/game/Managers/FamilyExtras.ts`):
  - True age of parents, children and your partner (detail screens, the Love tab lists). Fixes an original bug: family
    members' true age never went up as they aged.
  - "Together N years · Married N years" under your partner on the Love tab (partners from older saves start counting
    from when you load the save).
  - "Spend Time with Everyone" (Love tab, free): **v0.21.0** — a week with *each* relationship you have (partner,
    children, parents, siblings, grandparents, grandchildren, great-grandchildren, nieces/nephews, aunts/uncles, cousins,
    friends and pets; not exes), one after another: 12 relationships = 12 weeks. The button shows the number of weeks
    and asks first; each person gets **+400** relationship on their week (v0.21.1; never halved by a bad mood, up to
    the 1000 maximum), nobody on the list drifts while they wait, and a
    "Time Well Spent" summary closes it. It stops early if you die or land in jail.
- **No more being kicked out at 18 (v0.11.0)**: you can keep living with your parents as an adult, move out whenever
  you like (buy/rent or a basic place), and move back in while a parent is alive. The allowance still stops at 18.
- **School rework (v0.10.0)** (`src/game/Managers/Schooling.ts`): new **Preschool** and **Elementary School**, and every
  school now has a starting age and realistic length, so you finish high school around 17–18 instead of 15. You still click
  a school each week to study (one week of school per click); a school year is 40 weeks of study.

  | School | Ages | Length | Notes |
  |---|---|---|---|
  | Preschool | 3–5 | 2 school years (80 weeks) | optional; finishing it takes 20 weeks off elementary |
  | Elementary School | from 5 | 6 school years (240 weeks) | |
  | Middle School | from 11 | 3 school years (120 weeks) | needs Elementary |
  | High School | from 14 | 4 school years (160 weeks) | needs Middle |

  Adults (18+) who never finished go to **night school** at the original pace (elementary/middle 60 weeks, high school
  80 weeks; Fast Learner etc. still apply). Fast Learner / Intellectual Curiosity / Stupid don't change kids' school.
  New characters get the schooling their age implies (scenario kids, sandbox, heirs); older saves count preschool and
  elementary as done for anyone 11+ or past middle school. The two new schools use the user's
  icons (v0.10.1, `education_preschool.png`, `education_elementaryschool.png`).
- **Young Child starts at age 0 (v0.10.0)**, and the game can now start at any age from 0 (sandbox slider 0–80). The old
  minimum age (8) is gone.
- **Birth month (v0.10.0)**: pick the month you're born in on the new-life screen (it used to always be January).
  Birthdays fall in that month; heirs keep the calendar month going.
- **Age limits (v0.10.0)**: jobs and side hustles from 14; businesses, buying or renting property, bank loans, stocks
  and the lottery from 18; skills and languages from 6; philanthropy from 18.
- **New school icons (v0.9.2)**: Middle School and High School use the user's own icons (`assets/images/education_middleschool.png`, `education_highschool.png`).
- **Retail career (v0.7.0)** (Work tab, `Job.retail` in `src/game/Enums/Job.ts`, icon `assets/images/work_retail.png`
  from the user): Cashier $400/wk → Senior Cashier $500 → Shift Supervisor $700 → Assistant Store Manager $1,000 →
  Store Manager $1,500 → District Manager $2,500 → VP of Retail $4,000. The first two levels need no diploma, the next
  three need high school, the top two need a Business degree. Mostly a happiness cost (difficult customers), rising
  with rank. Old saves get the career automatically.
- **Years in a career (v0.8.0)**: every job card on the Work tab shows how long it has been your job ("3 years in
  this career", "Less than a year in this career"). Each career keeps its own count (`JobStateSingle.weeksInCareer`,
  counted every week it's your current job); switching away pauses it.
- **Retirement (v0.8.0)** (`src/game/Managers/Retirement.ts`): from age **60 physical age** (not true age) you can retire from the Work tab; on the birthday you turn 60 with a job, a pop-up
  offers *Retire* or *Keep working*. Retiring ends your job and pays a weekly **pension** for life: 2% of your pay for
  each year in that career, up to 70%, never less than $100/week. Retired life also gives +1 happiness and +1 sanity a
  week. Applying for a job asks first and brings you out of retirement (pension stops while you work; retiring again
  never pays less than before). The life summary shows "Retired".
- **Assisted Dying** (Health tab, adults 18+, $10,000 — set in `src/game/Managers/AssistedDying.ts`): after a
  confirmation, the life ends like any other death (death pop-up, life summary, cemetery, "Continue as your child").
- **Come Out** (Love tab, age 13+, `src/game/Managers/ComingOut.ts`): choose straight, gay or bisexual. Gives a
  happiness/sanity lift; each parent is usually supportive (relationship up) but sometimes needs time (relationship
  down). Anyone you meet afterwards matches your new sexuality. Can be changed again later.
- **No row icons on Love/Health actions (v0.7.0)**: like the original game, only careers and education have pictures,
  so Come Out and Assisted Dying are text rows (their icons were deleted).
- **Elixir of Youth** is no longer a Health tab item; it became the vampire Cure (v0.15.0), renamed the Vampiric Cure in v0.16.0.

- **Net worth** now includes property equity (value minus mortgages).

## Fixes to the original
- **Stuck alerts (v0.20.0):** when a small banner was queued behind a pop-up, the pop-ups after it waited until something
  else happened (e.g. an award result only showed after your next action). The queue now keeps going past banners.
- **Pets (v0.12.0):** "Pet" and "Abandon" cost $5,000 and Abandon showed "+undefined relationship" (port bugs); petting
  and abandoning are free again.
- **Perks can be switched off (v0.8.0):** the new-game perk screen switched every unlocked perk back on whenever it
  redrew, so turning one off never stuck. Fixed, and the screen now has **Enable all** / **Disable all** buttons.
- New-game customization: a typed first/last name was lost — the boxes were redrawn empty, and picking a sex
  afterwards re-rolled the first name.
- Exactly $9,999 displayed as $0.
- Checking for a college degree could freeze the game (decompiler bug in a reduce loop).

## Other differences from the phone version
- **No ads (v0.5.0):** the ad system is removed — no "Watch Ad for Bonus" row, no "watch an ad for double income"
  pop-up and no double-income reward; the "You made money while away" real-time bonus is gone too.
- **No social / online services (v0.5.0):** the Settings social bar (Instagram, Twitter, Reddit, Discord, rate, share),
  the "rate this game" prompt, the life-summary Share button, Google leaderboard and bug-reporter rows are removed.
- Life summary gravestone restyled (light stone) so its text is readable.
