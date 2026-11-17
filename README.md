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
node test/... (see test/unlocks.ts) # checks every unlock works
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
- `removePaywall` — sandbox mode, all perks, all destinations, extra save slots and "unlock all content" are owned;
  the store's money packs, youth potions and revive are free to claim (Settings → Store).
- `unlockProgression` — scenarios, perks, the achievement save slot and countries that were earned through
  achievements, life goals or daily rewards start unlocked.

## Other differences from the phone version
- Ads removed; "watch an ad" rewards are granted directly.
- Fixed: amounts of exactly $9,999 displayed as $0 in the original.
- Leaderboards, sharing, Instagram buttons removed.
