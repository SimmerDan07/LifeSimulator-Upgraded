// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Double, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, TypeCastException } from "../runtime";
import { ValueRange } from "../Utils/ValueRange";
import { Trait } from "./Trait";
import { Perk } from "./Perk";
import { Possession } from "./Possession";
import { CompletableAction } from "./CompletableAction";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { Player } from "../Managers/Player";
import { Utils } from "../Utils/Utils";
import { CAREERS, CAREER_BY_ID, CareerDef } from "../Careers/CareerData";

const M = (h: number, hap: number, san: number) => new Modifiers(h, hap, san);
/** v0.19.0 Celebrity Life career ladders (music reworked; dance is new). */
export const MUSIC_TITLES = ["Street Performer", "Bar & Café Gigs", "Session Musician", "Opening Act", "Recording Artist", "Chart Climber", "Headliner", "Stadium Act", "Music Legend"];
export const DANCE_TITLES = ["Street Dancer", "Dance Crew Member", "Backup Dancer", "Music Video Dancer", "Dance Captain", "Tour Choreographer", "Celebrity Choreographer"];

export class Job extends JEnum {
    static readonly panHandler: Job = new Job("panHandler", 0);
    static readonly burgerFlipper: Job = new Job("burgerFlipper", 1);
    static readonly dataEntry: Job = new Job("dataEntry", 2);
    static readonly uber: Job = new Job("uber", 3);
    static readonly music: Job = new Job("music", 4);
    static readonly business: Job = new Job("business", 5);
    static readonly medical: Job = new Job("medical", 6);
    static readonly finance: Job = new Job("finance", 7);
    static readonly research: Job = new Job("research", 8);
    static readonly programmer: Job = new Job("programmer", 9);
    static readonly teacher: Job = new Job("teacher", 10);
    static readonly police: Job = new Job("police", 11);
    static readonly army: Job = new Job("army", 12);
    static readonly lawyer: Job = new Job("lawyer", 13);
    static readonly artist: Job = new Job("artist", 14);
    static readonly actor: Job = new Job("actor", 15);
    static readonly barista: Job = new Job("barista", 16);
    static readonly sushiChef: Job = new Job("sushiChef", 17);
    static readonly animeArtist: Job = new Job("animeArtist", 18);
    static readonly pastryChef: Job = new Job("pastryChef", 19);
    static readonly tourGuide: Job = new Job("tourGuide", 20);
    static readonly sommelier: Job = new Job("sommelier", 21);
    static readonly royalGuard: Job = new Job("royalGuard", 22);
    static readonly constructionWorker: Job = new Job("constructionWorker", 23);
    /** New in Life Sim Upgraded: a full retail career, starting as a cashier. */
    static readonly retail: Job = new Job("retail", 24);
    /** v0.19.0 Celebrity Life: a dance career that starts as a Street Dancer (Lifepaths tab only). */
    static readonly dancer: Job = new Job("dancer", 25);
    static values(): Job[] { return [...Job.BASE(), ...NEW_JOBS]; }
    static BASE(): Job[] { return [Job.panHandler, Job.burgerFlipper, Job.dataEntry, Job.uber, Job.music, Job.business, Job.medical, Job.finance, Job.research, Job.programmer, Job.teacher, Job.police, Job.army, Job.lawyer, Job.artist, Job.actor, Job.barista, Job.sushiChef, Job.animeArtist, Job.pastryChef, Job.tourGuide, Job.sommelier, Job.royalGuard, Job.constructionWorker, Job.retail, Job.dancer]; }
    static valueOf(n: string): Job { return (Job as any)[n]; }
    /** v0.26.0: the data for one of the 40 new careers (null for the original ones). */
    def(): CareerDef | null { return CAREER_BY_ID[this.name()] ?? null; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getImageId(): number {
        switch (this) {
            case Job.panHandler:
                return R.drawable.work_pan_handler;
            case Job.burgerFlipper:
                return R.drawable.work_burger_flipper;
            case Job.dataEntry:
                return R.drawable.work_data_entry;
            case Job.uber:
                return R.drawable.work_uber;
            case Job.music:
                return CompletableAction.college_music.getImageId();
            case Job.business:
                return CompletableAction.college_business.getImageId();
            case Job.medical:
                return CompletableAction.college_biology.getImageId();
            case Job.finance:
                return CompletableAction.college_finance.getImageId();
            case Job.research:
                return R.drawable.work_research;
            case Job.programmer:
                return CompletableAction.college_computerScience.getImageId();
            case Job.teacher:
                return R.drawable.work_teacher;
            case Job.police:
                return R.drawable.work_police;
            case Job.army:
                return R.drawable.work_solidier;
            case Job.lawyer:
                return R.drawable.work_lawyer;
            case Job.barista:
                return R.drawable.work_barista;
            case Job.sushiChef:
                return R.drawable.work_sushichef;
            case Job.animeArtist:
                return R.drawable.work_animateartist;
            case Job.pastryChef:
                return R.drawable.work_pastrychef;
            case Job.tourGuide:
                return R.drawable.work_tourguide;
            case Job.sommelier:
                return R.drawable.work_sommelier;
            case Job.royalGuard:
                return R.drawable.work_queen_guard;
            case Job.constructionWorker:
                return R.drawable.work_constructionworker;
            case Job.artist:
                return R.drawable.work_artist;
            case Job.retail:
                return R.drawable.work_retail;
            case Job.actor:
                return CompletableAction.college_theater.getImageId();
            case Job.dancer:
                return R.drawable.icon_celeb_dance;
            default:
                if (this.def()) return (R.drawable as any)[this.def()!.image];
                throw new NoWhenBranchMatchedException();
        }
    }
    getJobTitles(): string[] {
        switch (this) {
            case Job.panHandler:
                return [Utils.INSTANCE.getString(R.string.Job_Title_LowSkill_PanHandler)];
            case Job.burgerFlipper:
                return [Utils.INSTANCE.getString(R.string.Job_Title_LowSkill_BurgerFlipper)];
            case Job.dataEntry:
                return [Utils.INSTANCE.getString(R.string.Job_Title_LowSkill_DataEntryClerk), Utils.INSTANCE.getString(R.string.Job_Title_LowSkill_SeniorDataEntryClerk)];
            case Job.uber:
                return [Utils.INSTANCE.getString(R.string.Job_Title_LowSkill_DriveUber)];
            case Job.music:
                return MUSIC_TITLES;
            case Job.business:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Business_Assistant), Utils.INSTANCE.getString(R.string.Job_Title_Business_Analyst), Utils.INSTANCE.getString(R.string.Job_Title_Business_Senior_Analyst), Utils.INSTANCE.getString(R.string.Job_Title_Business_Manager), Utils.INSTANCE.getString(R.string.Job_Title_Business_Partner), Utils.INSTANCE.getString(R.string.Job_Title_Business_VicePresident), Utils.INSTANCE.getString(R.string.Job_Title_Business_CEO)];
            case Job.medical:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Business_Medical), Utils.INSTANCE.getString(R.string.Job_Title_Business_Resident), Utils.INSTANCE.getString(R.string.Job_Title_Business_Physician), Utils.INSTANCE.getString(R.string.Job_Title_Business_Specialist), Utils.INSTANCE.getString(R.string.Job_Title_Business_FieldExpert)];
            case Job.finance:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Finance_Assistant), Utils.INSTANCE.getString(R.string.Job_Title_Finance_FinancialAnalyst), Utils.INSTANCE.getString(R.string.Job_Title_Finance_QuantitativeAnalyst), Utils.INSTANCE.getString(R.string.Job_Title_Finance_StockTrader), Utils.INSTANCE.getString(R.string.Job_Title_Finance_PortfolioManager), Utils.INSTANCE.getString(R.string.Job_Title_Finance_InvestmentBanker), Utils.INSTANCE.getString(R.string.Job_Title_Finance_CFO)];
            case Job.research:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Science_1), Utils.INSTANCE.getString(R.string.Job_Title_Science_2), Utils.INSTANCE.getString(R.string.Job_Title_Science_3), Utils.INSTANCE.getString(R.string.Job_Title_Science_4), Utils.INSTANCE.getString(R.string.Job_Title_Science_5), Utils.INSTANCE.getString(R.string.Job_Title_Science_6), Utils.INSTANCE.getString(R.string.Job_Title_Science_7), Utils.INSTANCE.getString(R.string.Job_Title_Science_8)];
            case Job.programmer:
                return [Utils.INSTANCE.getString(R.string.Job_Title_CS_1), Utils.INSTANCE.getString(R.string.Job_Title_CS_2), Utils.INSTANCE.getString(R.string.Job_Title_CS_3), Utils.INSTANCE.getString(R.string.Job_Title_CS_4), Utils.INSTANCE.getString(R.string.Job_Title_CS_5), Utils.INSTANCE.getString(R.string.Job_Title_CS_6), Utils.INSTANCE.getString(R.string.Job_Title_CS_7)];
            case Job.teacher:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Teacher_1), Utils.INSTANCE.getString(R.string.Job_Title_Teacher_2), Utils.INSTANCE.getString(R.string.Job_Title_Teacher_3), Utils.INSTANCE.getString(R.string.Job_Title_Teacher_4), Utils.INSTANCE.getString(R.string.Job_Title_Teacher_5), Utils.INSTANCE.getString(R.string.Job_Title_Teacher_6)];
            case Job.police:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Police_1), Utils.INSTANCE.getString(R.string.Job_Title_Police_2), Utils.INSTANCE.getString(R.string.Job_Title_Police_3), Utils.INSTANCE.getString(R.string.Job_Title_Police_4), Utils.INSTANCE.getString(R.string.Job_Title_Police_5), Utils.INSTANCE.getString(R.string.Job_Title_Police_6), Utils.INSTANCE.getString(R.string.Job_Title_Police_7), Utils.INSTANCE.getString(R.string.Job_Title_Police_8)];
            case Job.army:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Military_1), Utils.INSTANCE.getString(R.string.Job_Title_Military_2), Utils.INSTANCE.getString(R.string.Job_Title_Military_3), Utils.INSTANCE.getString(R.string.Job_Title_Military_4), Utils.INSTANCE.getString(R.string.Job_Title_Military_5), Utils.INSTANCE.getString(R.string.Job_Title_Military_6), Utils.INSTANCE.getString(R.string.Job_Title_Military_7), Utils.INSTANCE.getString(R.string.Job_Title_Military_8)];
            case Job.lawyer:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Law_1), Utils.INSTANCE.getString(R.string.Job_Title_Law_2), Utils.INSTANCE.getString(R.string.Job_Title_Law_3), Utils.INSTANCE.getString(R.string.Job_Title_Law_4), Utils.INSTANCE.getString(R.string.Job_Title_Law_5)];
            case Job.barista:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Barista)];
            case Job.sushiChef:
                return [Utils.INSTANCE.getString(R.string.Job_Title_SushiChef_1), Utils.INSTANCE.getString(R.string.Job_Title_SushiChef_2)];
            case Job.animeArtist:
                return [Utils.INSTANCE.getString(R.string.Job_Title_AnimeArtist_1), Utils.INSTANCE.getString(R.string.Job_Title_AnimeArtist_2), Utils.INSTANCE.getString(R.string.Job_Title_AnimeArtist_3), Utils.INSTANCE.getString(R.string.Job_Title_AnimeArtist_4), Utils.INSTANCE.getString(R.string.Job_Title_AnimeArtist_5)];
            case Job.pastryChef:
                return [Utils.INSTANCE.getString(R.string.Job_Title_PastryChef)];
            case Job.tourGuide:
                return [Utils.INSTANCE.getString(R.string.Job_Title_TourGuide)];
            case Job.sommelier:
                return [Utils.INSTANCE.getString(R.string.Job_Title_Sommelier_1), Utils.INSTANCE.getString(R.string.Job_Title_Sommelier_2)];
            case Job.royalGuard:
                return [Utils.INSTANCE.getString(R.string.Job_Title_RoyalGuard_1), Utils.INSTANCE.getString(R.string.Job_Title_RoyalGuard_2)];
            case Job.constructionWorker:
                return [Utils.INSTANCE.getString(R.string.Job_Title_ConstructionWorker)];
            case Job.artist:
                return [Utils.INSTANCE.getString(R.string.Title_Artist_1), Utils.INSTANCE.getString(R.string.Title_Artist_2), Utils.INSTANCE.getString(R.string.Title_Artist_3), Utils.INSTANCE.getString(R.string.Title_Artist_4), Utils.INSTANCE.getString(R.string.Title_Artist_5), Utils.INSTANCE.getString(R.string.Title_Artist_6), Utils.INSTANCE.getString(R.string.Title_Artist_7)];
            case Job.retail:
                return [1, 2, 3, 4, 5, 6, 7].map((i) => Utils.INSTANCE.getString((R.string as any)[`Job_Title_Retail_${i}`]));
            case Job.actor:
                return [Utils.INSTANCE.getString(R.string.Title_Actor_1), Utils.INSTANCE.getString(R.string.Title_Actor_2), Utils.INSTANCE.getString(R.string.Title_Actor_3), Utils.INSTANCE.getString(R.string.Title_Actor_4), Utils.INSTANCE.getString(R.string.Title_Actor_5), Utils.INSTANCE.getString(R.string.Title_Actor_6), Utils.INSTANCE.getString(R.string.Title_Actor_7), Utils.INSTANCE.getString(R.string.Title_Actor_8), Utils.INSTANCE.getString(R.string.Title_Actor_9)];
            case Job.dancer:
                return DANCE_TITLES;
            default:
                if (this.def()) return this.def()!.titles;
                throw new NoWhenBranchMatchedException();
        }
    }
    getMaxLevels(): number {
        return this.getJobTitles().length;
    }
    weeksForPromotion(level: number): number {
        let i: number = 6;
        if (level <= 2) {
            i = 3;
        } else if ((level >= 3) && (level <= 4)) {
            i = 5;
        } else if ((level < 5) || (level > 6)) {
            i = (level >= 7) ? 8 : 0;
        }
        let workYearLengthWeeks: number = i * Constants.Time.INSTANCE.getWorkYearLengthWeeks();
        if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.growthMindset)) {
            let growthMindsetPromotionBoost: number = Perk.INSTANCE.getGrowthMindsetPromotionBoost();
            let d: number = workYearLengthWeeks;
            Double.isNaN(d);
            workYearLengthWeeks = JMath.toInt((growthMindsetPromotionBoost * d));
        }
        if (GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.humble)) {
            let humblePromotionBoost: number = Trait.INSTANCE.getHumblePromotionBoost();
            let d2: number = workYearLengthWeeks;
            Double.isNaN(d2);
            workYearLengthWeeks = JMath.toInt((humblePromotionBoost * d2));
        }
        if (!GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.lazy)) {
            return workYearLengthWeeks;
        }
        let lazyPromotionModifier: number = Trait.INSTANCE.getLazyPromotionModifier();
        let d3: number = workYearLengthWeeks;
        Double.isNaN(d3);
        return JMath.toInt((lazyPromotionModifier * d3));
    }
    /** Reconstructed from bytecode (jadx/Vineflower could not fully decompile it). */
    pay(level: number): ValueRange {
        const personState = GameStateManager.INSTANCE.getPersonState();
        const W = (n: number) => ValueRange.INSTANCE.getWithInt(n);
        const R = (a: number, b: number) => new ValueRange(a, b);
        let table: ValueRange[];
        let careerTrait: Trait | null = null;
        switch (this) {
            case Job.panHandler: table = [W(200)]; break;
            case Job.burgerFlipper: table = [W(400)]; break;
            case Job.dataEntry: table = [W(500), W(600)]; break;
            case Job.uber: {
                const carLevel = personState.getItemState().getState(Possession.car).getLevel();
                let d = 500.0;
                if (carLevel > 1) d = 500.0 * ((carLevel - 1) * 0.5 + 1.0);
                table = [ValueRange.INSTANCE.getWithValue(d)];
                break;
            }
            // v0.19.0 Celebrity Life: Street Performer → … → Music Legend
            case Job.music: table = [R(0, 400), R(200, 900), W(1000), W(1600), W(2500), W(4000), W(7000), R(10000, 25000), R(20000, 50000)]; careerTrait = Trait.entertainer; break;
            // v0.19.0 Celebrity Life: Street Dancer → … → Celebrity Choreographer
            case Job.dancer: table = [R(0, 300), W(400), W(700), W(1100), W(1800), W(3000), R(5000, 12000)]; careerTrait = Trait.entertainer; break;
            case Job.business: table = [W(600), W(800), W(1200), W(2000), W(3000), W(5000), W(8000)]; careerTrait = Trait.confident; break;
            case Job.medical: table = [W(600), W(800), W(3000), W(4000), W(6000)]; break;
            case Job.finance: table = [W(700), W(1000), W(1400), R(800, 2000), W(2500), W(4000), W(7500)]; break;
            case Job.research: table = [W(500), W(750), W(1200), W(2000), W(4000), W(6000), W(8000), W(10000)]; careerTrait = Trait.logical; break;
            case Job.programmer: table = [W(800), W(1000), W(1500), W(2000), W(3000), W(5000), W(7000)]; break;
            case Job.teacher: table = [W(600), W(800), W(1000), W(1800), W(3000), W(4500)]; break;
            case Job.police: table = [W(500), W(800), W(1000), W(1500), W(2000), W(2500), W(3000), W(4000)]; break;
            case Job.army: table = [W(700), W(1000), W(1200), W(1500), W(2000), W(3000), W(4000), W(5000)]; break;
            case Job.lawyer: table = [W(1000), W(1500), W(3000), W(5000), W(8000)]; break;
            case Job.barista: table = [W(350)]; break;
            case Job.sushiChef: table = [W(350), W(450)]; break;
            case Job.animeArtist: table = [W(500), W(700), W(1000), W(2000), W(4000)]; break;
            case Job.pastryChef: table = [W(400)]; break;
            case Job.tourGuide: table = [W(350)]; break;
            case Job.sommelier: table = [W(450), W(1000)]; break;
            case Job.royalGuard: table = [W(500), W(800)]; break;
            case Job.constructionWorker: table = [W(600)]; break;
            // Retail: Cashier → Senior Cashier → Shift Supervisor → Assistant Store Manager → Store Manager → District Manager → VP of Retail
            case Job.retail: table = [W(400), W(500), W(700), W(1000), W(1500), W(2500), W(4000)]; break;
            case Job.artist: table = [W(350), W(600), W(1000), W(1500), W(2500), W(4000), W(7000)]; break;
            case Job.actor:
                // v0.19.0 Celebrity Life: Extra → … → Renowned Actor
                table = [R(0, 800), W(500), W(900), W(1400), W(2200), W(3500), W(6000), R(8000, 20000), R(15000, 40000)];
                careerTrait = Trait.entertainer;
                break;
            default: {
                const d = this.def();
                if (!d) throw new NoWhenBranchMatchedException();
                table = d.pay.map((x) => (Array.isArray(x) ? R(x[0], x[1]) : W(x)));
                if (d.trait) careerTrait = (Trait as any)[d.trait] ?? null;
            }
        }
        let vr = table[level - 1];
        if (careerTrait != null && personState.getTraitState().hasTrait(careerTrait)) {
            const b = Trait.INSTANCE.getChooseCareerIncomeBoost();
            vr = new ValueRange(vr.getMin() * b, vr.getMax() * b);
        }
        if (personState.getPerkState().hasPerk(Perk.diligent)) {
            const b = Perk.INSTANCE.getDiligentEarningBoost();
            vr = new ValueRange(vr.getMin() * b, vr.getMax() * b);
        }
        return vr;
    }
    modifiers(level: number): Modifiers {
        let modifiersArr: Modifiers[];
        switch (this) {
            case Job.panHandler:
                modifiersArr = [new Modifiers(0.0, 0.0, -1.0)];
                break;
            case Job.burgerFlipper:
                modifiersArr = [new Modifiers(0.0, 0.0, 0.0)];
                break;
            case Job.dataEntry:
                modifiersArr = [new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0)];
                break;
            case Job.uber:
                modifiersArr = [new Modifiers(0.0, 0.0, 0.0)];
                break;
            case Job.music:
                modifiersArr = [M(0, -1, -1), M(0, 0, -1), M(0, 0, 0), M(0, 1, -1), M(0, 1, -1), M(0, 1, -2), M(-1, 2, -2), M(-1, 2, -3), M(0, 3, -3)];
                break;
            case Job.business:
                modifiersArr = [new Modifiers(0.0, -1.0, 0.0), new Modifiers(0.0, -1.0, 0.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 0.0, -4.0), new Modifiers(0.0, -1.0, -5.0)];
                break;
            case Job.medical:
                modifiersArr = [new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, -1.0, 0.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 1.0, -1.0), new Modifiers(0.0, 1.0, -2.0)];
                break;
            case Job.finance:
                modifiersArr = [new Modifiers(0.0, -1.0, -1.0), new Modifiers(0.0, -1.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 0.0, -4.0), new Modifiers(0.0, -1.0, -5.0)];
                break;
            case Job.research:
                modifiersArr = [new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 1.0, -1.0), new Modifiers(0.0, 1.0, 0.0)];
                break;
            case Job.programmer:
                modifiersArr = [new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 0.0, -4.0), new Modifiers(0.0, 0.0, -5.0)];
                break;
            case Job.teacher:
                modifiersArr = [new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 1.0, -3.0)];
                break;
            case Job.police:
                modifiersArr = [new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -2.0)];
                break;
            case Job.army:
                modifiersArr = [new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0)];
                break;
            case Job.lawyer:
                modifiersArr = [new Modifiers(0.0, -1.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 0.0, -4.0)];
                break;
            case Job.barista:
                modifiersArr = [new Modifiers(0.0, 0.0, 0.0)];
                break;
            case Job.sushiChef:
                modifiersArr = [new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.5, -2.0)];
                break;
            case Job.animeArtist:
                modifiersArr = [new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 0.0, -3.0), new Modifiers(0.0, 0.0, -4.0)];
                break;
            case Job.pastryChef:
                modifiersArr = [new Modifiers(0.0, 0.0, 0.0)];
                break;
            case Job.tourGuide:
                modifiersArr = [new Modifiers(0.0, 1.0, 0.0)];
                break;
            case Job.sommelier:
                modifiersArr = [new Modifiers(0.0, 0.5, 0.0)];
                break;
            case Job.royalGuard:
                modifiersArr = [new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0)];
                break;
            case Job.constructionWorker:
                modifiersArr = [new Modifiers(0.0, -1.0, 0.0)];
                break;
            case Job.retail:
                modifiersArr = [new Modifiers(0.0, -1.0, 0.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -2.0), new Modifiers(0.0, 0.0, -3.0)];
                break;
            case Job.artist:
                modifiersArr = [new Modifiers(0.0, -1.0, -1.0), new Modifiers(0.0, -2.0, -1.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, 0.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -1.0), new Modifiers(0.0, 0.0, -2.0)];
                break;
            case Job.actor:
                modifiersArr = [M(0, -2, -1), M(0, -1, -1), M(0, 0, 0), M(0, 1, 0), M(0, 1, -1), M(0, 0, -1), M(0, 1, -2), M(0, 2, -2), M(0, 2, -3)];
                break;
            case Job.dancer:
                modifiersArr = [M(1, -1, 0), M(1, 0, 0), M(1, 0, -1), M(1, 1, -1), M(1, 1, -1), M(0, 1, -2), M(0, 2, -2)];
                break;
            default:
                if (this.def()) { modifiersArr = this.def()!.mods.map((m) => M(m[0], m[1], m[2])); break; }
                throw new NoWhenBranchMatchedException();
        }
        return modifiersArr[level - 1];
    }
    getRandomRelativelyLowLevel(): number {
        return Utils.Random.INSTANCE.randomValueWithinRange(1, Math.max(1, JMath.idiv(this.getMaxLevels(), 2)));
    }
    educationRequirement(level: number): CompletableAction {
        switch (this) {
            case Job.panHandler:
                return null;
            case Job.burgerFlipper:
                return CompletableAction.middleSchool;
            case Job.dataEntry:
                return CompletableAction.highSchool;
            case Job.uber:
                return null;
            case Job.music:
                // v0.19.0: anyone can busk; the Music degree is needed from Recording Artist (level 5)
                return level >= 5 ? CompletableAction.college_music : null;
            case Job.business:
                if ((level === 1) || (level === 2)) {
                    return CompletableAction.college_business;
                }
                if (level === 3) {
                    return CompletableAction.masters;
                }
                if (level > 3) {
                    return CompletableAction.mba;
                }
                return null;
            case Job.medical:
                if (level === 1) {
                    return CompletableAction.college_biology;
                }
                return CompletableAction.medSchool;
            case Job.finance:
                if (level === 1) {
                    return CompletableAction.college_finance;
                }
                if ((level === 2) || (level === 3)) {
                    return CompletableAction.masters;
                }
                if (level >= 4) {
                    return CompletableAction.mba;
                }
                return null;
            case Job.research:
                if ((level === 1) || (level === 2)) {
                    return CompletableAction.college_science;
                }
                if ((level >= 3) && (level <= 5)) {
                    return CompletableAction.masters;
                }
                if (level >= 6) {
                    return CompletableAction.phd;
                }
                return null;
            case Job.programmer:
                return CompletableAction.college_computerScience;
            case Job.teacher:
                if ((level >= 1) && (level <= 4)) {
                    return CompletableAction.college_literature;
                }
                if (level > 4) {
                    return CompletableAction.phd;
                }
                return null;
            case Job.police:
                return CompletableAction.police_academy;
            case Job.army:
                return CompletableAction.militaryAcademy;
            case Job.lawyer:
                if ((level === 1) || (level === 2)) {
                    return CompletableAction.college_philosophy;
                }
                if (level >= 3) {
                    return CompletableAction.law_school;
                }
                return null;
            case Job.barista:
                return CompletableAction.middleSchool;
            case Job.sushiChef:
                return CompletableAction.middleSchool;
            case Job.animeArtist:
                return CompletableAction.college_art;
            case Job.pastryChef:
                return CompletableAction.middleSchool;
            case Job.tourGuide:
                return CompletableAction.middleSchool;
            case Job.sommelier:
                return CompletableAction.middleSchool;
            case Job.royalGuard:
                return CompletableAction.middleSchool;
            case Job.constructionWorker:
                return CompletableAction.middleSchool;
            case Job.retail:
                if (level <= 2) return CompletableAction.middleSchool;
                if (level <= 5) return CompletableAction.highSchool;
                return CompletableAction.college_business;
            case Job.artist:
                return CompletableAction.college_art;
            case Job.actor:
                // v0.19.0: extras need no degree; the Theater degree is needed from Theater Ensemble (level 4)
                return level >= 4 ? CompletableAction.college_theater : null;
            case Job.dancer:
                // v0.19.0: street dancing needs no degree; the Theater degree is needed from Dance Captain (level 5)
                return level >= 5 ? CompletableAction.college_theater : null;
            default: {
                // v0.26.0 careers: the degree or training for each level (from CareerData)
                const name = this.def()?.edu[level - 1];
                return name ? (CompletableAction as any)[name] ?? null : null;
            }
        }
    }
    getRequiredItem(): Possession {
        if (this !== Job.uber) {
            return null;
        }
        return Possession.car;
    }
}
export namespace Job {
    export class Companion {
        $init0(): void {
    }
        $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 1) return (this as any).$init1(...a);
            if (a.length === 0) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        jobsForPlayer(player: Player): Job[] {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(Job.panHandler);
        let arrayList2: ArrayList = arrayList;
        CollectionsKt.addAll(arrayList2, player.getCountry().getUnskilledJobOptions());
        CollectionsKt.addAll(arrayList2, [Job.dataEntry, Job.uber, Job.retail, Job.business, Job.medical, Job.finance, Job.research, Job.programmer, Job.teacher, Job.artist, Job.police, Job.army, Job.lawyer]);
        CollectionsKt.addAll(arrayList2, player.getCountry().getAdditionalJobOptions());
        let array = arrayList2.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as Job[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    }
}
Job.INSTANCE = new Job.Companion(null);

/** v0.26.0 "The Career Update": the 40 new careers become real Job values (saved by name like the others). */
export const NEW_JOBS: Job[] = [];
CAREERS.forEach((d, i) => { const j = new Job(d.id, 26 + i); (Job as any)[d.id] = j; NEW_JOBS.push(j); });
