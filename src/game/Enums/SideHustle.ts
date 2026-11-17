// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, ArraysKt, CollectionsKt, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, Random } from "../runtime";
import { Trait } from "./Trait";
import { CompletableAction } from "./CompletableAction";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "../Managers/GameStateManager";
import { IProbableEvent } from "./IProbableEvent";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { Utils } from "../Utils/Utils";

export class SideHustle extends JEnum {
    static readonly appDeveloper: SideHustle = new SideHustle("appDeveloper", 0);
    static readonly youTubeStar: SideHustle = new SideHustle("youTubeStar", 1);
    static readonly DJ: SideHustle = new SideHustle("DJ", 2);
    static readonly author: SideHustle = new SideHustle("author", 3);
    static readonly actor: SideHustle = new SideHustle("actor", 4);
    static values(): SideHustle[] { return [SideHustle.appDeveloper, SideHustle.youTubeStar, SideHustle.DJ, SideHustle.author, SideHustle.actor]; }
    static valueOf(n: string): SideHustle { return (SideHustle as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getIncomeBoostTrait(): Trait {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return null;
        }
        if (i === SideHustle.youTubeStar) {
            return Trait.creative;
        }
        if (i === SideHustle.DJ) {
            return Trait.creative;
        }
        if (i === SideHustle.author) {
            return Trait.articulate;
        }
        if (i === SideHustle.actor) {
            return Trait.entertainer;
        }
        throw new NoWhenBranchMatchedException();
    }
    getTitle(): string {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return Utils.INSTANCE.getString(R.string.SideHustle_AppDeveloper);
        }
        if (i === SideHustle.youTubeStar) {
            return Utils.INSTANCE.getString(R.string.SideHustle_YoutubeStar);
        }
        if (i === SideHustle.DJ) {
            return Utils.INSTANCE.getString(R.string.SideHustle_DJ);
        }
        if (i === SideHustle.author) {
            return Utils.INSTANCE.getString(R.string.SideHustle_Author);
        }
        if (i === SideHustle.actor) {
            return Utils.INSTANCE.getString(R.string.SideHustle_Actor);
        }
        throw new NoWhenBranchMatchedException();
    }
    getImageId(): number {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return R.drawable.sidehustle_appdeveloper;
        }
        if (i === SideHustle.youTubeStar) {
            return R.drawable.sidehustle_youtube;
        }
        if (i === SideHustle.DJ) {
            return R.drawable.sidehustle_dj;
        }
        if (i === SideHustle.author) {
            return R.drawable.sidehustle_author;
        }
        if (i === SideHustle.actor) {
            return R.drawable.sidehustle_actor;
        }
        throw new NoWhenBranchMatchedException();
    }
    getRequiredDegree(): CompletableAction {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return CompletableAction.college_computerScience;
        }
        if (i === SideHustle.youTubeStar) {
            return null;
        }
        if (i === SideHustle.DJ) {
            return CompletableAction.college_music;
        }
        if (i === SideHustle.author) {
            return CompletableAction.college_literature;
        }
        if (i === SideHustle.actor) {
            return CompletableAction.college_theater;
        }
        throw new NoWhenBranchMatchedException();
    }
    getRequiredItem(): Possession {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return Possession.laptop;
        }
        if (i === SideHustle.youTubeStar) {
            return Possession.videoEquipment;
        }
        if (i === SideHustle.DJ) {
            return Possession.turntable;
        }
        if (i === SideHustle.author) {
            return Possession.laptop;
        }
        if (i === SideHustle.actor) {
            return Possession.videoEquipment;
        }
        throw new NoWhenBranchMatchedException();
    }
    requirementNotMetString(player: Player): string {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let requiredDegree: CompletableAction = this.getRequiredDegree();
        if ((requiredDegree != null) && !player.getCompletableActionState().isCompleted(requiredDegree)) {
            return Utils.Strings.INSTANCE.getRequiresString(requiredDegree.getTitle());
        }
        let requiredItem: Possession = this.getRequiredItem();
        if ((requiredItem == null) || player.getItemState().isOwned(requiredItem)) {
            return null;
        }
        return Utils.Strings.INSTANCE.getRequiresString(requiredItem.getTitle());
    }
    getNumberOfProjectRequirementMultiplier(): number {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return 1;
        }
        if (i === SideHustle.youTubeStar) {
            return 3;
        }
        if (i === SideHustle.DJ) {
            return 2;
        }
        if ((i === SideHustle.author) || (i === SideHustle.actor)) {
            return 1;
        }
        throw new NoWhenBranchMatchedException();
    }
    getProjectName(): string {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_AppDeveloper);
        }
        if (i === SideHustle.youTubeStar) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_YouTubeStar);
        }
        if (i === SideHustle.DJ) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_DJ);
        }
        if (i === SideHustle.author) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_Author);
        }
        if (i === SideHustle.actor) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_Producer);
        }
        throw new NoWhenBranchMatchedException();
    }
    getProjectNamePlural(): string {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_AppDeveloper_Plural);
        }
        if (i === SideHustle.youTubeStar) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_YouTubeStar_Plural);
        }
        if (i === SideHustle.DJ) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_DJ_Plural);
        }
        if (i === SideHustle.author) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_Author_Plural);
        }
        if (i === SideHustle.actor) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectName_Producer_Plural);
        }
        throw new NoWhenBranchMatchedException();
    }
    getUnitPerDollarRevenue(): number {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return 10.0;
        }
        if (i === SideHustle.youTubeStar) {
            return 500.0;
        }
        if (i === SideHustle.DJ) {
            return 200.0;
        }
        if (i === SideHustle.author) {
            return 0.2;
        }
        if (i === SideHustle.actor) {
            return 0.1;
        }
        throw new NoWhenBranchMatchedException();
    }
    getConsumptionUnitName(): string {
        let i: SideHustle = this;
        if (i === SideHustle.appDeveloper) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectConsumptionName_AppDeveloper);
        }
        if (i === SideHustle.youTubeStar) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectConsumptionName_YouTubeStar);
        }
        if (i === SideHustle.DJ) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectConsumptionName_DJ);
        }
        if (i === SideHustle.author) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectConsumptionName_Author);
        }
        if (i === SideHustle.actor) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectConsumptionName_Producer);
        }
        throw new NoWhenBranchMatchedException();
    }
}
export namespace SideHustle {
    export class SkillLevel extends JEnum {
        static readonly newbie: SkillLevel = new SkillLevel("newbie", 0, 0);
        static readonly amateur: SkillLevel = new SkillLevel("amateur", 1, 1);
        static readonly intermediate: SkillLevel = new SkillLevel("intermediate", 2, 2);
        static readonly experienced: SkillLevel = new SkillLevel("experienced", 3, 3);
        static readonly pro: SkillLevel = new SkillLevel("pro", 4, 4);
        static values(): SkillLevel[] { return [SkillLevel.newbie, SkillLevel.amateur, SkillLevel.intermediate, SkillLevel.experienced, SkillLevel.pro]; }
        static valueOf(n: string): SkillLevel { return (SkillLevel as any)[n]; }
        static INSTANCE: any;
        raw: number = 0;
        constructor(name: string, ordinal: number, i: number) {
            super(name, ordinal);
        this.raw = i;
        }
        getRaw(): number {
        return this.raw;
    }
        getTitle(): string {
        let i: SideHustle.SkillLevel = this;
        if (i === SideHustle.SkillLevel.newbie) {
            return Utils.INSTANCE.getString(R.string.SideHustle_SkillLevel_Newbie);
        }
        if (i === SideHustle.SkillLevel.amateur) {
            return Utils.INSTANCE.getString(R.string.SideHustle_SkillLevel_Amateur);
        }
        if (i === SideHustle.SkillLevel.intermediate) {
            return Utils.INSTANCE.getString(R.string.SideHustle_SkillLevel_Intermediate);
        }
        if (i === SideHustle.SkillLevel.experienced) {
            return Utils.INSTANCE.getString(R.string.SideHustle_SkillLevel_Experienced);
        }
        if (i === SideHustle.SkillLevel.pro) {
            return Utils.INSTANCE.getString(R.string.SideHustle_SkillLevel_Pro);
        }
        throw new NoWhenBranchMatchedException();
    }
        getSkillQualityProbabilityBoost(): number {
        let i: SideHustle.SkillLevel = this;
        if (i === SideHustle.SkillLevel.newbie) {
            return 1.0;
        }
        if (i === SideHustle.SkillLevel.amateur) {
            return 1.2;
        }
        if (i === SideHustle.SkillLevel.intermediate) {
            return 1.4;
        }
        if (i === SideHustle.SkillLevel.experienced) {
            return 1.6;
        }
        if (i === SideHustle.SkillLevel.pro) {
            return 2.0;
        }
        throw new NoWhenBranchMatchedException();
    }
        getColorId(): number {
        let i: SideHustle.SkillLevel = this;
        if (i === SideHustle.SkillLevel.newbie) {
            return R.color.flatRed;
        }
        if (i === SideHustle.SkillLevel.amateur) {
            return R.color.flatOrange;
        }
        if (i === SideHustle.SkillLevel.intermediate) {
            return R.color.flatGreen;
        }
        if (i === SideHustle.SkillLevel.experienced) {
            return R.color.flatBlue;
        }
        if (i === SideHustle.SkillLevel.pro) {
            return R.color.flatPurple;
        }
        throw new NoWhenBranchMatchedException();
    }
        numberOfProjectsRequired(hustle: SideHustle): number {
        Intrinsics.checkParameterIsNotNull(hustle, "hustle");
        let i: SideHustle.SkillLevel = this;
        let i2: number = 5;
        if (i === SideHustle.SkillLevel.newbie) {
            i2 = 0;
        } else if (i !== SideHustle.SkillLevel.amateur) {
            if (i === SideHustle.SkillLevel.intermediate) {
                i2 = 10;
            } else if (i === SideHustle.SkillLevel.experienced) {
                i2 = 20;
            } else {
                if (i !== SideHustle.SkillLevel.pro) {
                    throw new NoWhenBranchMatchedException();
                }
                i2 = 50;
            }
        }
        return i2 * hustle.getNumberOfProjectRequirementMultiplier();
    }
    }
    export namespace SkillLevel {
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
            getGetAllSkillLevels(): SideHustle.SkillLevel[] {
        return [SideHustle.SkillLevel.newbie, SideHustle.SkillLevel.amateur, SideHustle.SkillLevel.intermediate, SideHustle.SkillLevel.experienced, SideHustle.SkillLevel.pro];
    }
            level(hustle: SideHustle, numberOfProjects: number): SideHustle.SkillLevel {
        Intrinsics.checkParameterIsNotNull(hustle, "hustle");
        for (const skillLevel of (ArraysKt.reversedArray(this.getGetAllSkillLevels()) as unknown as SideHustle.SkillLevel[])) {
            if (numberOfProjects >= skillLevel.numberOfProjectsRequired(hustle)) {
                return skillLevel;
            }
        }
        return SideHustle.SkillLevel.newbie;
    }
        }
    }
    export class ProjectQuality extends JEnum implements IProbableEvent {
        static readonly garbage: ProjectQuality = new ProjectQuality("garbage", 0);
        static readonly poor: ProjectQuality = new ProjectQuality("poor", 1);
        static readonly average: ProjectQuality = new ProjectQuality("average", 2);
        static readonly good: ProjectQuality = new ProjectQuality("good", 3);
        static readonly amazing: ProjectQuality = new ProjectQuality("amazing", 4);
        static values(): ProjectQuality[] { return [ProjectQuality.garbage, ProjectQuality.poor, ProjectQuality.average, ProjectQuality.good, ProjectQuality.amazing]; }
        static valueOf(n: string): ProjectQuality { return (ProjectQuality as any)[n]; }
        constructor(name: string, ordinal: number) { super(name, ordinal); }
        getTitle(): string {
        let i: SideHustle.ProjectQuality = this;
        if (i === SideHustle.ProjectQuality.garbage) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectQuality_Garbage);
        }
        if (i === SideHustle.ProjectQuality.poor) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectQuality_Poor);
        }
        if (i === SideHustle.ProjectQuality.average) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectQuality_Average);
        }
        if (i === SideHustle.ProjectQuality.good) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectQuality_Good);
        }
        if (i === SideHustle.ProjectQuality.amazing) {
            return Utils.INSTANCE.getString(R.string.SideHustle_ProjectQuality_Amazing);
        }
        throw new NoWhenBranchMatchedException();
    }
        getColor(): number {
        let i: SideHustle.ProjectQuality = this;
        if (i === SideHustle.ProjectQuality.garbage) {
            return R.color.flatBrown;
        }
        if (i === SideHustle.ProjectQuality.poor) {
            return R.color.flatBlue;
        }
        if (i === SideHustle.ProjectQuality.average) {
            return R.color.flatPurple;
        }
        if (i === SideHustle.ProjectQuality.good) {
            return R.color.flatOrange;
        }
        if (i === SideHustle.ProjectQuality.amazing) {
            return R.color.flatYellowDark;
        }
        throw new NoWhenBranchMatchedException();
    }
        getRelativeProbability(): number {
        let i: SideHustle.ProjectQuality = this;
        if (i === SideHustle.ProjectQuality.garbage) {
            return 1000;
        }
        if (i === SideHustle.ProjectQuality.poor) {
            return 250;
        }
        if (i === SideHustle.ProjectQuality.average) {
            return 100;
        }
        if (i === SideHustle.ProjectQuality.good) {
            return 25;
        }
        if (i === SideHustle.ProjectQuality.amazing) {
            return 10;
        }
        throw new NoWhenBranchMatchedException();
    }
        /** Weekly income of a finished project (reconstructed from bytecode). */
        weeklyIncome(hustle: SideHustle): number {
            const T: Record<string, number[]> = {          // garbage, poor, average, good, amazing
                appDeveloper: [5, 20, 100, 500, 2000],
                youTubeStar: [1, 5, 20, 125, 500],
                DJ: [3, 10, 50, 200, 1000],
                author: [6, 25, 200, 600, 3000],
                actor: [20, 50, 250, 1250, 5000],
            };
            const row = T[hustle.name()];
            let income = row ? row[this.ordinal()] : 0;
            const player = GameStateManager.INSTANCE.getPersonState();
            const boostTrait = hustle.getIncomeBoostTrait();
            if (boostTrait != null && player.hasTrait(boostTrait)) {
                income = JMath.toInt(income * Trait.INSTANCE.getChooseCareerIncomeBoost());
            }
            if (player.getMiscState().isAdDoubleIncomeRewardActive()) income *= 2;
            const item = player.getItemState().getState(hustle.getRequiredItem());
            return JMath.toInt(income * (1 + (item.getLevel() - 1) * item.getType().getItemBoostModifier()));
        }
        projectName(hustle: SideHustle): ArrayList<string> {
        Intrinsics.checkParameterIsNotNull(hustle, "hustle");
        let arrayList: ArrayList<string> = new ArrayList();
        let i: SideHustle = hustle;
        let c: number = 9;
        let c2: number = 8;
        let c3: number = 6;
        let c4: number = 7;
        let c5: number = 5;
        let c6: number = 4;
        let c7: number = 3;
        let c8: number = 2;
        let c9: number = 1;
        if (i === SideHustle.appDeveloper) {
            let i2: SideHustle.ProjectQuality = this;
            if (((i2 === SideHustle.ProjectQuality.poor) || (i2 === SideHustle.ProjectQuality.garbage)) || (i2 === SideHustle.ProjectQuality.average)) {
                for (const str of ["Rabbit", "Turkey", "Cow", "Snail", "Ball", "Slime", "Goat"]) {
                    for (const str2 of ["Jump", "Race", "Shooter", "Clicker", "Run", "Simulator", "Master", "Puzzle", "Maze", "Rescue", "Tap", "Dungeon", "Tower Defense"]) {
                        arrayList.add((str + " ") + str2);
                    }
                }
                for (const str3 of ["Mega", "Super", "Insane", "Duper", "Epic", "Tiny", "Doodle", "Lucky", "Happy"]) {
                    for (const str4 of ["Race", "Golf", "Soccer", "Shooter", "Tank", "Cannon", "Bird", "Wings", "Fight", "Baller", "Pet", "Tower Defense"]) {
                        arrayList.add((str3 + " ") + str4);
                    }
                }
                CollectionsKt.addAll(arrayList, ["Ball Bounce", "Balloon Pop", "Bowmaster", "Calculator Pro"]);
            } else if ((i2 === SideHustle.ProjectQuality.good) || (i2 === SideHustle.ProjectQuality.amazing)) {
                CollectionsKt.addAll(arrayList, ["Hungry Bird", "Poodle Jump", "Life Simulator", "Halo Jump", "FartNite", "Fruit vs Zombies", "Monster Go", "Clash of Gangs", "Candy Smash", "Mine Crafter", "2048", "Heart Stone", "Church Run", "Train Surfer", "Massive Wings", "Gassy Road", "Zombie Invader", "Vegetable Ninja", "Infection", "My Talking Furball", "Big Balls", "Crossy Highway", "Last Fantasy", "Cocktail Tycoon", "Coronavirus Doctor", "Balloon Defense"]);
            }
        } else if (i === SideHustle.youTubeStar) {
            let i3: SideHustle.ProjectQuality = this;
            if (((i3 === SideHustle.ProjectQuality.poor) || (i3 === SideHustle.ProjectQuality.garbage)) || (i3 === SideHustle.ProjectQuality.average)) {
                let strArr: string[] = ["baby", "kitten", "puppy", "chicken", "llama", "donkey", "pigeon", "goat"];
                let strArr2: string[] = ["Cute", "Crazy", "Ugly", "Funny", "Angry", "Weird", "Insane", "Fat", "Young"];
                let length: number = strArr2.length;
                let i4: number = 0;
                while (i4 < length) {
                    let str5: string = strArr2[i4];
                    let length2: number = strArr.length;
                    let i5: number = 0;
                    while (i5 < length2) {
                        let str6: string = strArr[i5];
                        let strArr3: string[] = new Array(16).fill(null);
                        strArr3[0] = "falls down stairs";
                        strArr3[c9] = "barfs everywhere";
                        strArr3[c8] = "slips on banana peel";
                        strArr3[c7] = "eats tide pod";
                        strArr3[4] = "poops";
                        strArr3[c5] = "screams";
                        strArr3[6] = "attacks police";
                        strArr3[7] = "learns to fly";
                        strArr3[8] = "fights " + ((ArraysKt.random(strArr, Random.INSTANCE) as string));
                        strArr3[9] = "humps stuffed animal";
                        strArr3[10] = "does the harlem shake";
                        strArr3[11] = "dances";
                        strArr3[12] = "wears shoes";
                        strArr3[13] = "plays with cucumber";
                        strArr3[14] = "eats its own poop";
                        strArr3[15] = "faints";
                        for (const str7 of strArr3) {
                            arrayList.add((((str5 + " ") + str6) + " ") + str7);
                        }
                        i5++;
                        c9 = 1;
                        c5 = 5;
                        c7 = 3;
                        c8 = 2;
                    }
                    i4++;
                    c9 = 1;
                    c5 = 5;
                    c7 = 3;
                    c8 = 2;
                }
                for (const str8 of ["ice float", "it hurt when i pee", "my stomach hurt", "does my dog eat grass", "a cat purr", "alcohol burn", "alcohol make you pee", "a volcano erupt", "bread rise", "my cat have diarrhea", "my dog snore", "my girlfriend hate me", "my boyfriend hate me", "my internet suck", "my poop float", "my booger taste salty", "Kobe ride in helicopters"]) {
                    arrayList.add("Why does " + str8);
                }
                for (const str9 of ["the sky blue", "the Earth flat", "DMV literally the worst", "NYC so expensive", "my pee green", "my poop red", "Trump president", "college so expensive", "my parents getting divorced", "Australia burning", "my eye twitching", "my computer so slow", "Brexit happening", "the subway so slow", "money so hard to get"]) {
                    arrayList.add("Why is " + str9);
                }
            } else if ((i3 === SideHustle.ProjectQuality.good) || (i3 === SideHustle.ProjectQuality.amazing)) {
                for (const str10 of ["you", "people", "we"]) {
                    for (const str11 of ["should need to know about Bitcoin", "should do when a pigeon poops on you", "should know before going to a nude beach", "should watch during a snow day", "should know about global warming, its REAL!", "should do when someone asks you out", "are missing in life", "are learning in school is not enough", "can do to look prettier", "can do to become more popular", "can do to fart less", "can achieve is you just stop playing video games", "think about Loch Ness Monster is all wrong", "think about Big Foot is all wrong", "think about aliens might not be accurate"]) {
                        arrayList.add((("What " + str10) + " ") + str11);
                    }
                }
                for (const str12 of ["Unboxing of the", "Day 0 review of the", "First look at the", "Hands on with the"]) {
                    for (const str13 of ["new Pineapple phone", "Mose headphones", "Galactic Note", "first foldable display smartphone", "first graphene external battery", "personal predator drone", "solar powered Pineapple phone", "Dishwasher Bot 3000", "Terminator home assistant", "Skynet router", "nuclear proof laptop", "quantum computer", "YBox One", "PlayNation Console", "first flying car", "laser blaster", "Ocless VR Headset", "HoloDen Mixed Reality Headset"]) {
                        arrayList.add((str12 + " ") + str13);
                    }
                }
            }
        } else if (i === SideHustle.DJ) {
            for (const str14 of ["Your", "My", "Our"]) {
                for (const str15 of ["Time", "Love", "Money", "Feelings", "Kingdom"]) {
                    arrayList.add((str14 + " ") + str15);
                }
            }
            for (const str16 of ["I", "You", "We"]) {
                for (const str17 of ["Should Stay", "Love It", "Messed Up", "Be Strong"]) {
                    arrayList.add((str16 + " ") + str17);
                }
            }
            for (const str18 of ["Confused", "High", "Lucid", "Sick", "Beautiful", "Broken", "Dangerous", "Lost", "Drunk"]) {
                for (const str19 of ["In Paris", "In Japan", "In New York", "In Seoul", "With You", "Hustle", "Sunflower", "and Electric", "Eyes", "To Me", "and Desperate", "and Precious", "and Hopeless", "and Alone", "and in Pain", "Around You", "Indeed"]) {
                    arrayList.add((str18 + " ") + str19);
                }
            }
            arrayList.add("My bumps");
        } else if (i === SideHustle.author) {
            let i6: SideHustle.ProjectQuality = this;
            if (((i6 === SideHustle.ProjectQuality.poor) || (i6 === SideHustle.ProjectQuality.garbage)) || (i6 === SideHustle.ProjectQuality.average)) {
                let strArr4: string[] = ["Adventure of", "Story of", "The Amazing Tale of", "The Life of", "Legend of"];
                let length3: number = strArr4.length;
                let i7: number = 0;
                while (i7 < length3) {
                    let str20: string = strArr4[i7];
                    let strArr5: string[] = new Array(21).fill(null);
                    strArr5[0] = "Zelda";
                    strArr5[1] = "The Dragonfly";
                    strArr5[2] = "Robinhood";
                    strArr5[3] = "The Two Kingdoms";
                    strArr5[c6] = "Harry Butter";
                    strArr5[5] = "Matrix";
                    strArr5[c3] = "Throne";
                    strArr5[c4] = "Nine Realms";
                    strArr5[c2] = "Dragoon";
                    strArr5[c] = "Silver Lion";
                    strArr5[10] = "Narnia";
                    strArr5[11] = "Green Giant";
                    strArr5[12] = "Firefly";
                    strArr5[13] = "Dracula";
                    strArr5[14] = "Giver";
                    strArr5[15] = "Mockingbird";
                    strArr5[16] = "Hobbit";
                    strArr5[17] = "Elf";
                    strArr5[18] = "The Clone";
                    strArr5[19] = "The Shadow Merchant";
                    strArr5[20] = "The Banker";
                    for (const str21 of strArr5) {
                        arrayList.add((str20 + " ") + str21);
                    }
                    i7++;
                    c = 9;
                    c2 = 8;
                    c3 = 6;
                    c4 = 7;
                    c6 = 4;
                }
            } else if ((i6 === SideHustle.ProjectQuality.good) || (i6 === SideHustle.ProjectQuality.amazing)) {
                CollectionsKt.addAll(arrayList, ["Pride and Prejudice", "Hungry Games", "Twilight Dawn", "Fifty Shades of Brown", "The Novel Thief", "Pig Farm", "Gone with the Gust", "Da Vinci Code", "Alena in Wonderland", "Romeo and Juliet", "Lord of Fruit Flies", "Crime and Prison", "The Great Gatsby", "Of Hamster and Men", "The Little Princess", "Game of Thrones", "Life of Pie", "Matilda", "Atlas", "1985", "The Time Machine", "Winnie the Poo"]);
            }
        } else if (i === SideHustle.actor) {
            let i8: SideHustle.ProjectQuality = this;
            if (((i8 === SideHustle.ProjectQuality.poor) || (i8 === SideHustle.ProjectQuality.garbage)) || (i8 === SideHustle.ProjectQuality.average)) {
                CollectionsKt.addAll(arrayList, ["The Emojis", "Sharknado", "Nuts", "Thursday the 13th", "Cabin Flu", "Lost in the Woods", "Slenderman", "Day Camp", "The Mall Cop", "Weird Wilderness", "Pluto", "Pro of Disguise", "Eight Lives", "Scary Movie", "Halloween", "Superbaby", "Alone", "The Spartans", "Screw", "Stupid and Stupider", "Baby Genius", "Gold Digger", "The Human Snake", "Singing Forest", "Shark Attack", "Zombie Invasion", "The Mad Cow", "Mars Invasion", "Family Man", "Attack of the Spider Monster", "Planet 9", "Mutant Potato Force", "Doomsday", "Exorcist", "Ape Man", "Get to the Chopper", "Trolls", "Moth Man", "Glitter", "The Love Guru", "Transform Trucks", "Battleship"]);
            } else if ((i8 === SideHustle.ProjectQuality.good) || (i8 === SideHustle.ProjectQuality.amazing)) {
                CollectionsKt.addAll(arrayList, ["Black Puma", "Mission Possible", "Spider-Women", "John Bick", "Zombie Invasion", "Isle of Cats", "Revengers", "The Cowboy", "Steel man", "Captain Merica", "The Uncredibles", "Wasp Man", "Solo", "Galaxy Wars", "Wonder Man", "God of Thunder", "Planet of the Elves", "Blade Sprinter", "Lobster Man", "City of Sin", "Darkness", "The Thing", "Mirrors", "Quest", "Adventure Time", "Guardians of the Milky Way", "Monster Hunter", "The Lost City"]);
            }
        }
        return arrayList;
    }
    }
    export class ProjectEffort extends JEnum {
        static readonly light: ProjectEffort = new ProjectEffort("light", 0);
        static readonly medium: ProjectEffort = new ProjectEffort("medium", 1);
        static readonly heavy: ProjectEffort = new ProjectEffort("heavy", 2);
        static values(): ProjectEffort[] { return [ProjectEffort.light, ProjectEffort.medium, ProjectEffort.heavy]; }
        static valueOf(n: string): ProjectEffort { return (ProjectEffort as any)[n]; }
        constructor(name: string, ordinal: number) { super(name, ordinal); }
        title(hustle: SideHustle): string {
        Intrinsics.checkParameterIsNotNull(hustle, "hustle");
        let i: SideHustle = hustle;
        if (i === SideHustle.appDeveloper) {
            let i2: SideHustle.ProjectEffort = this;
            if (i2 === SideHustle.ProjectEffort.light) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectAppDeveloper_Light);
            }
            if (i2 === SideHustle.ProjectEffort.medium) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectAppDeveloper_Medium);
            }
            if (i2 === SideHustle.ProjectEffort.heavy) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectAppDeveloper_Heavy);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === SideHustle.youTubeStar) {
            let i3: SideHustle.ProjectEffort = this;
            if (i3 === SideHustle.ProjectEffort.light) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectYouTubeStar_Light);
            }
            if (i3 === SideHustle.ProjectEffort.medium) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectYouTubeStar_Medium);
            }
            if (i3 === SideHustle.ProjectEffort.heavy) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectYouTubeStar_Heavy);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === SideHustle.DJ) {
            let i4: SideHustle.ProjectEffort = this;
            if (i4 === SideHustle.ProjectEffort.light) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectDJ_Light);
            }
            if (i4 === SideHustle.ProjectEffort.medium) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectDJ_Medium);
            }
            if (i4 === SideHustle.ProjectEffort.heavy) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectDJ_Heavy);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === SideHustle.author) {
            let i5: SideHustle.ProjectEffort = this;
            if (i5 === SideHustle.ProjectEffort.light) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectAuthor_Light);
            }
            if (i5 === SideHustle.ProjectEffort.medium) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectAuthor_Medium);
            }
            if (i5 === SideHustle.ProjectEffort.heavy) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectAuthor_Heavy);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === SideHustle.actor) {
            let i6: SideHustle.ProjectEffort = this;
            if (i6 === SideHustle.ProjectEffort.light) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectActor_Light);
            }
            if (i6 === SideHustle.ProjectEffort.medium) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectActor_Medium);
            }
            if (i6 === SideHustle.ProjectEffort.heavy) {
                return Utils.INSTANCE.getString(R.string.SideHustle_ProjectActor_Heavy);
            }
            throw new NoWhenBranchMatchedException();
        }
        throw new NoWhenBranchMatchedException();
    }
        getQualityProbabilityBoost(): number {
        let i: SideHustle.ProjectEffort = this;
        if (i === SideHustle.ProjectEffort.light) {
            return 1.0;
        }
        if (i === SideHustle.ProjectEffort.medium) {
            return 1.5;
        }
        if (i === SideHustle.ProjectEffort.heavy) {
            return 2.0;
        }
        throw new NoWhenBranchMatchedException();
    }
        getPossibleQualityOutcomes(): SideHustle.ProjectQuality[] {
        let i: SideHustle.ProjectEffort = this;
        if (i === SideHustle.ProjectEffort.light) {
            return [SideHustle.ProjectQuality.garbage, SideHustle.ProjectQuality.poor, SideHustle.ProjectQuality.average];
        }
        if (i === SideHustle.ProjectEffort.medium) {
            return [SideHustle.ProjectQuality.poor, SideHustle.ProjectQuality.average, SideHustle.ProjectQuality.good];
        }
        if (i === SideHustle.ProjectEffort.heavy) {
            return [SideHustle.ProjectQuality.average, SideHustle.ProjectQuality.good, SideHustle.ProjectQuality.amazing];
        }
        throw new NoWhenBranchMatchedException();
    }
        /** Months of work a project needs (reconstructed from bytecode) x weeks per month. */
        progressRequirement(hustle: SideHustle): number {
            const T: Record<string, number[]> = {
                appDeveloper: [5, 8, 12], youTubeStar: [2, 3, 5], DJ: [3, 5, 7], author: [8, 12, 18], actor: [12, 18, 24],
            };
            const row = T[hustle.name()];
            const idx = this === SideHustle.ProjectEffort.light ? 0 : this === SideHustle.ProjectEffort.medium ? 1 : this === SideHustle.ProjectEffort.heavy ? 2 : -1;
            const months = row && idx >= 0 ? row[idx] : 0;
            return months * Constants.Time.INSTANCE.getWeeksPerMonth();
        }
        getSkillLevelToUnlock(): SideHustle.SkillLevel {
        let i: SideHustle.ProjectEffort = this;
        if (i === SideHustle.ProjectEffort.light) {
            return SideHustle.SkillLevel.newbie;
        }
        if (i === SideHustle.ProjectEffort.medium) {
            return SideHustle.SkillLevel.intermediate;
        }
        if (i === SideHustle.ProjectEffort.heavy) {
            return SideHustle.SkillLevel.experienced;
        }
        throw new NoWhenBranchMatchedException();
    }
    }
}
SideHustle.SkillLevel.INSTANCE = new SideHustle.SkillLevel.Companion(null);
