// Art slots (v0.18.0): rows that still borrow an icon from somewhere else in the game. Each has its own file name;
// drop a PNG or SVG with that name into assets/images and the game uses it instead of the stand-in (fallback).
export interface ArtSlot { name: string; fallback: string; where: string; row: string }

export const ART_SLOTS: ArtSlot[] = [
    // Vampire lifepath (Lifepaths tab)
    { name: "icon_vamp_seek", fallback: "tab_lifepaths", where: "Lifepaths › Vampire", row: "Seek the Ancient" },
    { name: "icon_vamp_bite", fallback: "lifepath_vampire", where: "Lifepaths › Vampire", row: "Accept the Bite" },
    { name: "icon_vamp_feedbyhand", fallback: "lifepath_vampire", where: "Blood diets", row: "Feed by Hand" },
    { name: "icon_vamp_bloodbank", fallback: "health_hospitalstay", where: "Lifepaths › Feeding", row: "Buy from a Blood Bank" },
    { name: "icon_vamp_animal", fallback: "pet_turkey", where: "Lifepaths › Feeding", row: "Animal Blood" },
    { name: "icon_vamp_hunt", fallback: "mosquito", where: "Lifepaths › Feeding; Blood diets; Eternal Bond", row: "Hunt at Night / Nightly Hunting / Hunt Together" },
    { name: "icon_vamp_feedpartner", fallback: "love_romantic_dinner", where: "Lifepaths › Feeding", row: "Feed on (your partner)" },
    { name: "icon_vamp_donors", fallback: "love_nightclub", where: "Blood diets", row: "Willing Donors" },
    { name: "icon_vamp_laylow", fallback: "menu_coffin", where: "Lifepaths › Hiding", row: "Lay Low" },
    { name: "icon_vamp_fakedeath", fallback: "grave", where: "Lifepaths › Hiding", row: "Fake Your Death" },
    { name: "icon_vamp_movecity", fallback: "vacation_international", where: "Lifepaths › Hiding", row: "Move to a New City" },
    { name: "icon_vamp_coven", fallback: "waving_hand", where: "Lifepaths › Coven", row: "Find Your Coven" },
    { name: "icon_vamp_cure", fallback: "health_youthelixir", where: "Lifepaths › Endings", row: "Vampiric Cure" },
    { name: "icon_vamp_finalrest", fallback: "grave2", where: "Lifepaths › Endings", row: "Final Rest" },
    { name: "icon_vamp_tell", fallback: "lifepath_vampire", where: "Love tab › person", row: "Tell Them You're a Vampire" },
    { name: "icon_vamp_turn", fallback: "lifepath_vampire", where: "Love tab › person", row: "Turn Them into a Vampire" },
    { name: "icon_vamp_hunters", fallback: "skull", where: "Alert", row: "Vampire Hunters" },
    // Blood powers
    { name: "icon_power_charm", fallback: "love_propose", where: "Lifepaths › Powers", row: "Charm" },
    { name: "icon_power_nightowl", fallback: "vacation_take_week_off", where: "Lifepaths › Powers", row: "Night Owl" },
    { name: "icon_power_bloodbank", fallback: "health_hospitalstay", where: "Lifepaths › Powers", row: "Blood Bank Contact" },
    { name: "icon_power_miststep", fallback: "random", where: "Lifepaths › Powers", row: "Mist Step" },
    { name: "icon_power_sunward", fallback: "iap_perk", where: "Lifepaths › Powers", row: "Sun Ward" },
    { name: "icon_power_mindfog", fallback: "skill_selfimprovement", where: "Lifepaths › Powers", row: "Mind Fog" },
    // Eternal Bond
    { name: "icon_bond", fallback: "love_propose", where: "Lifepaths › Eternal Bond", row: "Eternal Bond card" },
    { name: "icon_bond_dance", fallback: "love_nightclub", where: "Love tab › partner", row: "Dance Through the Night" },
    { name: "icon_bond_vows", fallback: "love_propose", where: "Love tab › partner", row: "Eternal Vows" },
    // Subscriptions
    { name: "icon_sub_coach", fallback: "skill_selfimprovement", where: "Profile › Subscriptions", row: "Gym Coach" },
];
export const ART_FALLBACK: Record<string, string> = Object.fromEntries(ART_SLOTS.map((s) => [s.name, s.fallback]));
