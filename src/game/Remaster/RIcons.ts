// v0.36.0 The Remaster: art slots (drop a picture with this name into assets/images to replace the stand-in).
import { THINGS } from "./ThingsData";
import { FEATS } from "./Feats";

const I = (name: string, fallback: string, where: string, row: string) => ({ name, fallback, where, row });
export const RM_ICONS: { name: string; fallback: string; where: string; row: string }[] = [
    I("icon_rm_worth", "bank_deposit", "Bank", "Net Worth / Money Story"),
    I("icon_rm_loan", "bank_loan", "Bank › Loans", "Your loans"),
    I("icon_rm_market", "bank_withdrawal", "Bank › Investing", "The Stock Market"),
    I("icon_rm_fund", "bank_deposit", "Bank › Stock Market", "Funds"),
    I("icon_rm_stock", "bank_withdrawal", "Bank › Stock Market", "Companies"),
    I("icon_rm_crypto", "bank_lottery", "Bank › Stock Market", "Crypto"),
    I("icon_rm_auto", "bank_deposit", "Bank › Investing", "Auto-Invest"),
    I("icon_rm_kidsfund", "love_baby", "Bank › Accounts", "Kids' Fund"),
    I("icon_rm_things", "possession_computer_2", "Money › Your Things", "Your Things"),
    I("icon_rm_store", "tab_bank", "Money › Your Things", "The Store"),
    I("icon_rm_cars", "possession_car", "Store", "Cars"),
    I("icon_rm_tech", "possession_computer_3", "Store", "Tech"),
    I("icon_rm_hobby", "possession_turntable_3", "Store", "Hobbies & Sport"),
    I("icon_rm_home", "housing_family_home", "Store", "Home & Travel"),
    I("icon_rm_style", "love_propose", "Store", "Style"),
    I("icon_rm_collect", "education_art", "Store", "Collectibles"),
    I("icon_rm_toys", "possession_yacht", "Store", "Big Toys"),
    I("icon_rm_local", "vacation_izakaya", "Leisure › Things to Do", "Only Here"),
    I("icon_rm_favourite", "achievement_happy", "Leisure", "Your Favourites"),
    I("icon_rm_company", "love_go_to_local_event", "Leisure", "Going With"),
    I("icon_rm_habits", "health_pills", "Health › Habits", "Smoking and drinking"),
    I("icon_rm_traits", "tab_profile", "Profile › Traits", "Trait changes"),
    ...THINGS.map((t) => I(t.image, t.fallback, `Store › ${t.cat}`, t.title)),
    ...FEATS.map((f) => I(f.image, f.fallback, "Settings › Achievements", f.title)),
];
