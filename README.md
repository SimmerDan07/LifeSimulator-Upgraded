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
npm run test:features  # checks unlocks, generational play, the property system, schools, family & the Love tab remodel, old-save loading (337 checks)
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
  Elixir of Youth packs no longer exist (the Elixir is still in the Health tab at its in-game price of $20M).
  Revive on the death / bankruptcy pop-ups is kept and free (`InAppPurchaseManager` now only handles that).
- `unlockProgression` — scenarios, perks, the achievement save slot and countries that were earned through
  achievements, life goals or daily rewards start unlocked.

## Upgrades (new in Life Sim Upgraded)
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
    high-end: Penthouse (~$3M), Beachfront Villa (~$6M), Hilltop Mansion (~$25M). Townhouse, Ranch House and Family
    Home use the user's own icons (v0.6.1, `assets/images/housing_townhouse.png` etc.); Penthouse, Beachfront Villa
    and Hilltop Mansion still use placeholders (`housing_penthouse.svg`, `housing_beach_villa.svg`,
    `housing_hilltop_mansion.svg`) — replace them with same-named .png files and delete the .svg.
  - **Old saves**: properties owned in a pre-0.4 save are turned into records automatically on load (the home you live
    in becomes your residence, the rest become rentals with tenants), so rental income carries on at the original rate.
- **Love tab remodel (v0.12.0)** (`src/game/Social/`): the Love tab is now a people screen.
  - **Layout** (`LoveScreens.ts`): status and counters on top with group actions (Spend Time with Everyone, Family
    Gathering, Family Vacation), then **Partner** (or *Find Love* with the dating options when single), **Parents**
    (allowance, Road Trip), **Children**, **Siblings**, **Friends** (+ Meet New People), **Pets** (+ Adopt Pet),
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
  - **Systems** (`Relationships.ts`): every relationship still uses the 0–1000 score and the −2/week drift (doing
    something with someone skips it that week). **Moods** (Happy, Fine, Stressed, Upset) are re-rolled every 4 weeks,
    weighted by the score and a partner's personality; Stressed/Upset halve gains, and Deep Talk, Call, Ask for Advice and
    Couples Therapy lift them back to Fine. **Repeat-action fatigue**: the same action with the same person in back-to-back
    weeks gives half, then a quarter (dates included). **Anniversaries** come from the Together/Married counters;
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
  - Give your partner, a parent or an adult child the Elixir of Youth (same price as yours; 10 years younger, never
    below 18).
  - "Together N years · Married N years" under your partner on the Love tab (partners from older saves start counting
    from when you load the save).
  - "Spend Time with Everyone" (Love tab, free, one week): partner, parents, children and pets all grow closer.
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
  minimum age (8) now only stops the Elixir of Youth making you younger than 8.
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
- **Retirement (v0.8.0)** (`src/game/Managers/Retirement.ts`): from age **60 physical age** (the age the Elixir of
  Youth rolls back, not true age) you can retire from the Work tab; on the birthday you turn 60 with a job, a pop-up
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
- **Elixir of Youth** (Health tab) is a flat $20M instead of doubling after every purchase.

- **Net worth** now includes property equity (value minus mortgages).

## Fixes to the original
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
