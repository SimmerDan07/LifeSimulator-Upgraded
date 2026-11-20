// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Crime } from "../Crime/Crime";
import { SpouseIncome } from "../Social/SpouseIncome";
import { Illness } from "../Health/Illness";
import { World } from "../World/World";
import { Activities } from "../World/Activities";
import { ArrayList, Arrays, ArraysKt, BigInteger, CollectionsKt, Double, Integer, Intrinsics, JMath, Layout, MapsKt, Pair, R, Random, SpannableStringBuilder, StringCompanionObject, StringsKt, TuplesKt, TypeCastException, TypeIntrinsics, UUID, Unit } from "../runtime";
import { Retirement } from "./Retirement";
import { AchievementBadge } from "../Enums/AchievementBadge";
import { AchievementState } from "./AchievementState";
import { ActionDescriptor } from "../Enums/ActionDescriptor";
import { AgeGroup } from "../Enums/AgeGroup";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { AttributeState } from "./AttributeState";
import { BankAction } from "../Enums/BankAction";
import { BankActionAmount } from "../Enums/BankActionAmount";
import { BusinessAction } from "../Enums/BusinessAction";
import { BusinessState } from "./BusinessState";
import { CompletableAction } from "../Enums/CompletableAction";
import { CompletableActionState } from "./CompletableActionState";
import { CompletableActionType } from "../Enums/CompletableActionType";
import { Constants } from "../Utils/Constants";
import { Country } from "../Enums/Country";
import { CrimeState } from "./CrimeState";
import { DateFormatSymbols } from "../ui/bridge";
import { Diet } from "../Enums/Diet";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { FamilyState } from "./FamilyState";
import { GameHUDViewModel } from "../Components/GameHUDViewModel";
import { GameStateManager } from "./GameStateManager";
import { Gender } from "../Enums/Gender";
import { GenericListType } from "../Fragments/GenericListType";
import { HealthEvent } from "../Enums/HealthEvent";
import { HealthStatus } from "../Enums/HealthStatus";
import { Housing } from "../Enums/Housing";
import { RealEstatePortfolio } from "../RealEstate/RealEstatePortfolio";
import { RealEstateScreens } from "../RealEstate/RealEstateScreens";
import { HousingState } from "./HousingState";
import { IProbableEvent } from "../Enums/IProbableEvent";
import { ItemState } from "./ItemState";
import { Job } from "../Enums/Job";
import { JobState } from "./JobState";
import { Leisure } from "../Enums/Leisure";
import { LifeScenario } from "../Enums/LifeScenario";
import { LoveEvent } from "../Enums/LoveEvent";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { MainGameFragment } from "../ui/bridge";
import { MiscState } from "./MiscState";
import { Modifiers } from "./Modifiers";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { NameGenerator } from "./NameGenerator";
import { ParentInitialState } from "../Enums/ParentInitialState";
import { Perk } from "../Enums/Perk";
import { Person } from "./Person";
import { PersonAttribute } from "../Enums/PersonAttribute";
import { PersonInteraction } from "../Enums/PersonInteraction";
import { Pet } from "../Enums/Pet";
import { PlayerActionType } from "../Enums/PlayerActionType";
import { PlayerPerkState } from "./PlayerPerkState";
import { Possession } from "../Enums/Possession";
import { RandomEvent } from "../Enums/RandomEvent";
import { Relationship } from "../Enums/Relationship";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { Sex } from "../Enums/Sex";
import { Sexuality } from "../Enums/Sexuality";
import { SideHustle } from "../Enums/SideHustle";
import { SideHustleState } from "./SideHustleState";
import { SoundEffect } from "./SoundEffect";
import { SoundManager } from "./SoundManager";
import { StockState } from "./StockState";
import { TelemetryManager } from "./TelemetryManager";
import { TempState } from "./TempState";
import { Trait } from "../Enums/Trait";
import { TraitState } from "./TraitState";
import { Utils } from "../Utils/Utils";
import { WorkType } from "../Enums/WorkType";
import { SocialCircle } from "../Social/SocialCircle";
import { Subscriptions } from "./Subscriptions";
import { LifeMoments } from "./LifeMoments";
import { Seasons } from "./Seasons";
import { Careers } from "../Careers/Careers";
import { SocialMedia } from "../Social/SocialMedia";
import { Vampire } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { CelebrityState } from "../Lifepaths/CelebrityState";
import { Babies } from "../Social/Babies";
import { VampireState } from "../Lifepaths/VampireState";
import { Relationships } from "../Social/Relationships";

export class Player {
    static INSTANCE: any;
    ageInWeeks: number = 0;
    /** Month you were born (0 = January). Birthdays fall in this month. Undefined in older saves = January. */
    birthMonth: number = Math.floor(Math.random() * 12);
    // Retirement (src/game/Managers/Retirement.ts). Undefined in older saves.
    retired: boolean = false;
    pensionWeekly: number = 0;
    retiredFrom: string = null;
    retiredAtAge: number = null;
    retirementOffered: boolean = false;
    attributeState: AttributeState = null;
    businessState: BusinessState = null;
    completableActionState: CompletableActionState = null;
    country: Country = null;
    crimeState: CrimeState = null;
    diet: Diet = null;
    familyState: FamilyState = null;
    /** Generational play: 1 for a fresh life, +1 for each heir. */
    generation: number = 1;
    /** Names of earlier generations, oldest first (up to v0.17.0; v0.18.0 keeps life records instead). */
    ancestors: string[] = [];
    /** v0.18.0: the family line this life belongs to (shared by every heir). */
    lineId: string = null;
    lineageMigrated: boolean = false;
    /** v0.18.0: head style, skin tone and hair color (see Social/Appearance). */
    appearance: { style: number; skin: number; hair: number } = null;
    firstName: string = null;
    gender: Gender = null;
    housingState: HousingState = null;
    /** Property System Overhaul: every property owned, with condition, renovations, tenants, mortgages and history. */
    realEstate: RealEstatePortfolio = null;
    /** Love tab remodel: siblings, friends, exes, moods and per-person notes. */
    social: SocialCircle = null;
    /** Subscriptions (Profile tab): active ids. Undefined in older saves. */
    subscriptions: string[] = null;
    /** v0.23.0 Automatic Savings: % of every paycheck sent to savings (0/25/50/75/80) and the total saved. Undefined in older saves. */
    autoSavePercent: number = null;
    autoSaved: number = null;
    /** v0.24.0 Pay Bills from Savings (On/Off). Undefined in older saves = off. */
    billsFromSavings: boolean = null;
    /** v0.25.0 Hobbies: skill and records per hobby id. Undefined in older saves. */
    hobbies: any = null;
    /** v0.25.0 Life Moments: when each moment last happened, pending paybacks. Undefined in older saves. */
    moments: any = null;
    /** The Vampire lifepath (v0.15.0). Undefined in older saves: human. */
    vampire: VampireState = null;
    /** Celebrity Life (v0.19.0): fans, reputation, records. Undefined in older saves: never famous. */
    celebrity: CelebrityState = null;
    /** v0.17.0: how this life ended (for the obituary). */
    deathCause: string = null;
    id: string = null;
    itemState: ItemState = null;
    jobState: JobState = null;
    lastName: string = null;
    lifeScenario: LifeScenario = null;
    miscState: MiscState = null;
    moneyState: MoneyState = null;
    perkState: PlayerPerkState = null;
    romanticRelationshipStatus: RomanticRelationshipStatus = null;
    sex: Sex = null;
    sexuality: Sexuality = null;
    sideHustleState: SideHustleState = null;
    stockState: StockState = null;
    tempState: TempState = null;
    traitState: TraitState = null;
    trueAgeInWeeks: number = 0;
    constructor(firstName: string, lastName: string, gender: Gender, sexuality: Sexuality, sex: Sex, i: number) {
        Intrinsics.checkParameterIsNotNull(firstName, "firstName");
        Intrinsics.checkParameterIsNotNull(lastName, "lastName");
        Intrinsics.checkParameterIsNotNull(gender, "gender");
        Intrinsics.checkParameterIsNotNull(sexuality, "sexuality");
        Intrinsics.checkParameterIsNotNull(sex, "sex");
        this.romanticRelationshipStatus = RomanticRelationshipStatus.single;
        this.country = Country.unitedStates;
        this.attributeState = new AttributeState(50.0, 50.0, 50.0);
        let valueOf: BigInteger = BigInteger.valueOf(250000);
        let valueOf2: BigInteger = BigInteger.valueOf(1000);
        this.moneyState = new MoneyState(valueOf, valueOf2);
        this.stockState = new StockState();
        this.housingState = new HousingState();
        this.completableActionState = new CompletableActionState();
        this.jobState = new JobState();
        this.miscState = new MiscState();
        this.diet = Diet.scavenge;
        this.itemState = new ItemState();
        this.familyState = new FamilyState();
        this.crimeState = new CrimeState();
        this.traitState = new TraitState();
        this.tempState = new TempState();
        this.sideHustleState = new SideHustleState();
        this.perkState = new PlayerPerkState();
        this.lifeScenario = LifeScenario.highSchoolDropout;
        this.businessState = new BusinessState();
        let uuid: string = UUID.randomUUID().toString();
        this.id = uuid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.sexuality = sexuality;
        this.sex = sex;
        this.setAgeInWeeks(i);
        this.trueAgeInWeeks = i;
    }
    testConfigure(): void {
        this.sex = Sex.male;
        this.initializeAge(40, true);
        for (const completableAction of CompletableAction.INSTANCE.getActions(CompletableActionType.education)) {
            this.completableActionState.completeAction(completableAction);
        }
        MoneyState.updateMoney$default(this.moneyState, new BigInteger("50000000"), MoneyUpdateType.workIncome, null, null, 12, null);
        this.jobState.switchJob(Job.programmer);
        let currentJobState: JobState.JobStateSingle = this.jobState.getCurrentJobState();
        if (currentJobState != null) {
            currentJobState.setProgress(120);
        }
        this.buyItem(Possession.videoEquipment);
        this.buyItem(Possession.laptop);
        this.buyItem(Possession.turntable);
        let person: Person = new Person(Relationship.lover, Sex.female, NameGenerator.INSTANCE.generateLastName(), this.ageInWeeks);
        person.setLoverPersonality(LoverPersonality.soulMate);
        person.setRelationshipProgress(500);
        this.familyState.getFamilyMembers().add(person);
        this.romanticRelationshipStatus = RomanticRelationshipStatus.engaged;
        let makeBabyForPlayer: Person = Person.INSTANCE.makeBabyForPlayer(this);
        makeBabyForPlayer.setAgeInWeeks(Constants.Time.INSTANCE.getWeeksPerYear() * 12);
        makeBabyForPlayer.setRelationshipProgress(55);
        this.familyState.getFamilyMembers().add(makeBabyForPlayer);
        FamilyState.adoptPet$default(this.familyState, Pet.cat, null, 2, null);
        this.sideHustleState.populateProject(SideHustle.appDeveloper, 10, SideHustle.ProjectQuality.poor);
        this.sideHustleState.populateProject(SideHustle.actor, 10, SideHustle.ProjectQuality.poor);
        this.sideHustleState.populateProject(SideHustle.DJ, 10, SideHustle.ProjectQuality.poor);
        this.sideHustleState.populateProject(SideHustle.author, 10, SideHustle.ProjectQuality.poor);
        this.sideHustleState.populateProject(SideHustle.youTubeStar, 10, SideHustle.ProjectQuality.good);
        this.populateParentsBasedOnAge(true);
    }
    getId(): string {
        return this.id;
    }
    setId(str: string): void {
        Intrinsics.checkParameterIsNotNull(str, "<set-?>");
        this.id = str;
    }
    getFirstName(): string {
        return this.firstName;
    }
    setFirstName(str: string): void {
        Intrinsics.checkParameterIsNotNull(str, "<set-?>");
        this.firstName = str;
    }
    getLastName(): string {
        return this.lastName;
    }
    setLastName(str: string): void {
        Intrinsics.checkParameterIsNotNull(str, "<set-?>");
        this.lastName = str;
    }
    getGeneration(): number { return this.generation ?? 1; }
    getAncestors(): string[] { return this.ancestors ?? []; }
    getFullName(): string {
        return (this.firstName + " ") + this.lastName;
    }
    getGender(): Gender {
        return this.gender;
    }
    setGender(gender: Gender): void {
        Intrinsics.checkParameterIsNotNull(gender, "<set-?>");
        this.gender = gender;
    }
    getSexuality(): Sexuality {
        return this.sexuality;
    }
    setSexuality(sexuality: Sexuality): void {
        Intrinsics.checkParameterIsNotNull(sexuality, "<set-?>");
        this.sexuality = sexuality;
    }
    getSex(): Sex {
        return this.sex;
    }
    setSex(sex: Sex): void {
        Intrinsics.checkParameterIsNotNull(sex, "<set-?>");
        this.sex = sex;
    }
    getAgeInWeeks(): number {
        return this.ageInWeeks;
    }
    setAgeInWeeks(i: number): void {
        let i2: number = i - this.ageInWeeks;
        // The game can start at age 0 now; the old minimum age (8) only limits getting younger (Elixir of Youth).
        const floor = Constants.Time.INSTANCE.getWeeksPerYear() * Constants.Person.INSTANCE.getMinAgeInYears();
        if (i2 < 0 && i < floor) {
            i = Math.min(this.ageInWeeks, floor);
            i2 = i - this.ageInWeeks;
        }
        if (i2 > 0) {
            this.trueAgeInWeeks += i2;
        }
        this.ageInWeeks = i;
    }
    getAgeInYears(): number {
        return JMath.idiv(this.ageInWeeks, Constants.Time.INSTANCE.getWeeksPerYear());
    }
    getBirthMonth(): number { return ((this.birthMonth ?? 0) % 12 + 12) % 12; }
    setBirthMonth(m: number): void { this.birthMonth = ((m % 12) + 12) % 12; }
    /** The calendar month now (0 = January): your birth month plus the months since your last birthday. */
    /** Weeks for the calendar: your age, plus the weeks lived as a vampire (when your age stood still). */
    calendarWeeks(): number { return this.ageInWeeks + Vampire.calendarOffset(this); }
    getCurrentMonthIndex(): number {
        const monthsSinceBirthday = JMath.idiv(this.calendarWeeks() % Constants.Time.INSTANCE.getWeeksPerYear(), Constants.Time.INSTANCE.getWeeksPerMonth());
        return (this.getBirthMonth() + monthsSinceBirthday) % 12;
    }
    getTrueAgeInWeeks(): number {
        return this.trueAgeInWeeks;
    }
    setTrueAgeInWeeks(i: number): void {
        this.trueAgeInWeeks = i;
    }
    getTrueAgeInYears(): number {
        return JMath.idiv(this.trueAgeInWeeks, Constants.Time.INSTANCE.getWeeksPerYear());
    }
    getAgeGroup(): AgeGroup {
        return AgeGroup.INSTANCE.getAgeGroup(this.getAgeInYears());
    }
    getRomanticRelationshipStatus(): RomanticRelationshipStatus {
        return this.romanticRelationshipStatus;
    }
    setRomanticRelationshipStatus(romanticRelationshipStatus: RomanticRelationshipStatus): void {
        Intrinsics.checkParameterIsNotNull(romanticRelationshipStatus, "<set-?>");
        this.romanticRelationshipStatus = romanticRelationshipStatus;
    }
    getCountry(): Country {
        return this.country;
    }
    setCountry(country: Country): void {
        Intrinsics.checkParameterIsNotNull(country, "<set-?>");
        this.country = country;
    }
    getAttributeState(): AttributeState {
        return this.attributeState;
    }
    getMoneyState(): MoneyState {
        return this.moneyState;
    }
    setMoneyState(moneyState: MoneyState): void {
        Intrinsics.checkParameterIsNotNull(moneyState, "<set-?>");
        this.moneyState = moneyState;
    }
    getStockState(): StockState {
        return this.stockState;
    }
    getHousingState(): HousingState {
        return this.housingState;
    }
    /** Created on first use, so saves from before the overhaul pick it up automatically (see RealEstatePortfolio.reconcile). */
    getRealEstate(): RealEstatePortfolio {
        if (this.realEstate == null) {
            this.realEstate = new RealEstatePortfolio();
            if (this.housingState != null) this.realEstate.reconcile(this);
        }
        return this.realEstate;
    }
    /** Created on first use, so older saves start with an empty circle (no siblings or exes). */
    getSocial(): SocialCircle {
        if (this.social == null) this.social = new SocialCircle();
        return this.social;
    }
    getCompletableActionState(): CompletableActionState {
        return this.completableActionState;
    }
    getJobState(): JobState {
        return this.jobState;
    }
    getMiscState(): MiscState {
        return this.miscState;
    }
    getDiet(): Diet {
        return this.diet;
    }
    setDiet(diet: Diet): void {
        Intrinsics.checkParameterIsNotNull(diet, "<set-?>");
        this.diet = diet;
    }
    getItemState(): ItemState {
        return this.itemState;
    }
    setItemState(itemState: ItemState): void {
        Intrinsics.checkParameterIsNotNull(itemState, "<set-?>");
        this.itemState = itemState;
    }
    getFamilyState(): FamilyState {
        return this.familyState;
    }
    getCrimeState(): CrimeState {
        return this.crimeState;
    }
    getTraitState(): TraitState {
        return this.traitState;
    }
    getTempState(): TempState {
        return this.tempState;
    }
    setTempState(tempState: TempState): void {
        Intrinsics.checkParameterIsNotNull(tempState, "<set-?>");
        this.tempState = tempState;
    }
    getSideHustleState(): SideHustleState {
        return this.sideHustleState;
    }
    getPerkState(): PlayerPerkState {
        return this.perkState;
    }
    getLifeScenario(): LifeScenario {
        return this.lifeScenario;
    }
    setLifeScenario(lifeScenario: LifeScenario): void {
        Intrinsics.checkParameterIsNotNull(lifeScenario, "<set-?>");
        this.lifeScenario = lifeScenario;
    }
    getBusinessState(): BusinessState {
        return this.businessState;
    }
    setBusinessState(businessState: BusinessState): void {
        Intrinsics.checkParameterIsNotNull(businessState, "<set-?>");
        this.businessState = businessState;
    }
    getNetWorth(): BigInteger {
        // Cash + savings, plus property equity (value minus mortgages).
        return this.moneyState.getTotalAsset().add(BigInteger.valueOf(Math.round(this.getRealEstate().totalEquity())));
    }
    getHealthStatus(): HealthStatus {
        // v0.16.0: a vampire's body never declines with age
        if (Vampire.isVampire(this)) return HealthStatus.good;
        return HealthStatus.INSTANCE.getStatus(this.getAgeInYears());
    }
    getTooOldForFamilySupport(): boolean {
        return this.getAgeInYears() >= 18;
    }
    getCurrentAllowance(): number {
        if (this.getCanBeSupportedByFamily()) {
            return this.familyState.getCombinedParentRelationshipProgressStatus().getAllowance();
        }
        return 0;
    }
    getCanBeSupportedByFamily(): boolean {
        return !this.getTooOldForFamilySupport() && this.familyState.getParentsStillLiving();
    }
    getGetHUDViewModel(): GameHUDViewModel {
        let monthString: string = new DateFormatSymbols().getMonths()[this.getCurrentMonthIndex()];
        let weeksPerYear: number = (this.calendarWeeks() % Constants.Time.INSTANCE.getWeeksPerYear()) % Constants.Time.INSTANCE.getWeeksPerMonth();
        let health: number = this.attributeState.getHealth();
        let happiness: number = this.attributeState.getHappiness();
        let sanity: number = this.attributeState.getSanity();
        let cash: BigInteger = this.moneyState.getCash();
        let savings: BigInteger = this.moneyState.getSavings();
        let ageInYears: number = this.getAgeInYears();
        return new GameHUDViewModel(health, happiness, sanity, cash, savings, ageInYears, monthString, weeksPerYear);
    }
    getGetDeathTombstoneString(): SpannableStringBuilder {
        let appendNewline: SpannableStringBuilder = ExtensionsKt.appendNewline(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), this.getFullName(), R.color.tombstoneTextGrey, null, Layout.Alignment.ALIGN_CENTER, 4, null)), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.identity_name_age), String.valueOf(this.getAgeInYears())), R.color.tombstoneTextGrey, null, Layout.Alignment.ALIGN_CENTER, 4, null)));
        let badges: ArrayList<AchievementBadge> = AchievementBadge.INSTANCE.getBadges(this);
        let arrayList: ArrayList = new ArrayList();
        let it = badges.iterator();
        while (it.hasNext()) {
            let append: SpannableStringBuilder = appendNewline.append(((it.next() as unknown as AchievementBadge)).getGetBadgeSpannableString());
            arrayList.add(ExtensionsKt.appendNormal$default(append, "  ", null, null, null, 14, null));
        }
        ExtensionsKt.appendNewline(appendNewline);
        ExtensionsKt.appendNewline(appendNewline);
        for (const pair of this.tombstonePairs()) {
            ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(appendNewline, ((pair.component1() as string)) + ": ", R.color.tombstoneTextGrey, 12, null, 8, null), (pair.component2() as string), R.color.tombstoneTextGrey, 12, null, 8, null));
        }
        return appendNewline;
    }
    /** The tombstone's facts (v0.18.0: also saved in each life's record). */
    tombstonePairs(): Pair[] {
        let pairArr: Pair[] = new Array(8).fill(null);
        pairArr[0] = new Pair(Utils.INSTANCE.getString(R.string.identity_name_trueAge), String.valueOf(this.getTrueAgeInYears()));
        pairArr[1] = new Pair(Utils.INSTANCE.getString(R.string.identity_name_networth), String.valueOf(ExtensionsKt.numberDisplayString$default(this.getNetWorth(), false, 1, null)));
        pairArr[2] = new Pair(Utils.INSTANCE.getString(R.string.ProfileStatus_RelationshipStatus), this.romanticRelationshipStatus.getTitle());
        let string: string = Utils.INSTANCE.getString(R.string.SectionHeader_Education);
        let states: CompletableActionState.CompletableActionStateSingle[] = this.completableActionState.getStates(CompletableActionType.education);
        let arrayList2: ArrayList = new ArrayList();
        for (const completableActionStateSingle of states) {
            if (completableActionStateSingle.getCompleted()) {
                arrayList2.add(completableActionStateSingle);
            }
        }
        pairArr[3] = new Pair(string, String.valueOf(arrayList2.size()));
        pairArr[4] = new Pair(Utils.INSTANCE.getString(R.string.SectionHeader_Work), (this.retired && this.jobState.getCurrentJob() == null) ? "Retired" : this.jobState.getCurrentJobDisplayString());
        pairArr[5] = new Pair(Utils.INSTANCE.getString(R.string.Family_RelationshipLabel), this.familyState.getCombinedParentRelationshipProgressStatus().title(Relationship.parent));
        pairArr[6] = new Pair((Utils.INSTANCE.getString(R.string.Common_NumberOf) + " ") + Utils.INSTANCE.getString(R.string.Common_Children), String.valueOf(this.familyState.getChildren().size()));
        pairArr[7] = new Pair((Utils.INSTANCE.getString(R.string.Common_NumberOf) + " ") + Utils.INSTANCE.getString(R.string.Common_Pets), String.valueOf(this.familyState.getPets().size()));
        return pairArr;
    }
    leisureAction(action: Leisure): void {
        Intrinsics.checkParameterIsNotNull(action, "action");
        TelemetryManager.INSTANCE.logEvent("Take_Vacation", MapsKt.mapOf(TuplesKt.to("event", action.getTitle())));
        let lifeTracker: MiscState.LifeTracker = this.miscState.getLifeTracker();
        lifeTracker.setVacationAction(lifeTracker.getVacationAction() + 1);
        this.applyAttributeAndMoneyFromEvent(action);
        if ((action === Leisure.luxury_vacation) || (action === Leisure.international_vacation)) {
            let miscState: MiscState = this.miscState;
            miscState.setTripsTaken(miscState.getTripsTaken() + 1);
        }
        let travelCountry: Country = action.getTravelCountry();
        const fromCountry: Country = this.country;
        if (travelCountry != null) {
            this.country = travelCountry;
            this.diet = Diet.scavenge;
            let alertManager: AlertManager = AlertManager.INSTANCE;
            let string: string = Utils.INSTANCE.getString(R.string.Alert_MovedToCountry_Title);
            let stringCompanionObject = StringCompanionObject.INSTANCE;
            let string2: string = Utils.INSTANCE.getString(R.string.Alert_MovedToCountry_Message);
            let objArr = [travelCountry.getTitle()];
            let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
            AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, Integer.valueOf(travelCountry.getImageId()), null, null, null, null, null, null, 504, null), false, 2, null);
            World.afterMove(this, fromCountry, travelCountry);   // v0.27.0
        }
        Activities.onLeisure(this, action);   // v0.27.0
        Illness.onLeisure(this, action);      // v0.28.0: smoking, drinking, risky fun
        Vampire.onLeisure(this, action);
        Seasons.onLeisure(this, action);
        // v0.27.0: the prison yard (escapes, riots) and its consequences
        const ev = Crime.leisureEvent(this, action, RandomEvent.INSTANCE.randomEventForLeisure(action));
        AlertManager.showRandomEvent$default(AlertManager.INSTANCE, ev, false, 2, null);
        Crime.afterLeisureEvent(this, action, ev);
        this.applyWeekly();
    }
    learnSkillOrEducation(action: CompletableAction): void {
        Intrinsics.checkParameterIsNotNull(action, "action");
        // Too young / too old for this school, or its prerequisite isn't done (buttons are locked; this is a safety net).
        if (CompletableActionState.ageBlockFor(action, this) != null) return;
        const prereq = action.getPrerequiste();
        if (prereq != null && !this.completableActionState.isCompleted(prereq)) return;
        TelemetryManager.INSTANCE.logEvent("SkillOrEducationEvent", MapsKt.mapOf(TuplesKt.to("Type", action.getTitle())));
        let lifeTracker: MiscState.LifeTracker = this.miscState.getLifeTracker();
        lifeTracker.setEducationAction(lifeTracker.getEducationAction() + 1);
        MoneyState.updateMoney$default(this.moneyState, action.getCostPerWeek(), MoneyUpdateType.directSpend, null, null, 12, null);
        this.completableActionState.tickCompletionProgress(action);
        AlertManager.showRandomEvent$default(AlertManager.INSTANCE, RandomEvent.INSTANCE.randomEventForCompletableAction(action.getType(), action), false, 2, null);
        this.applyWeekly();
    }
    healthAction(action: HealthEvent): void {
        Intrinsics.checkParameterIsNotNull(action, "action");
        TelemetryManager.INSTANCE.logEvent("HealthEvent", MapsKt.mapOf(TuplesKt.to("Type", action.getTitle())));
        let lifeTracker: MiscState.LifeTracker = this.miscState.getLifeTracker();
        lifeTracker.setHealthAction(lifeTracker.getHealthAction() + 1);
        this.applyAttributeAndMoneyFromEvent(action);
        if (action === HealthEvent.chooseMenu) {
            Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.chooseDiet, null, false, 6, null);
            return;
        }
        // v0.15.0: the Elixir of Youth no longer makes you younger; it is now the vampire Cure (Lifepaths tab).
        Illness.onHealthEvent(this, action.name());   // v0.28.0: a doctor or hospital visit can clear up what you have
        AlertManager.showRandomEvent$default(AlertManager.INSTANCE, RandomEvent.INSTANCE.randomEventForHealth(action), false, 2, null);
        this.applyWeekly();
    }
    changeDiet(diet: Diet): void {
        Intrinsics.checkParameterIsNotNull(diet, "diet");
        TelemetryManager.INSTANCE.logEvent("ChangeDiet", MapsKt.mapOf(TuplesKt.to("Type", diet.getTitle())));
        this.diet = diet;
    }
    startProject(hustle: SideHustle, effort: SideHustle.ProjectEffort): void {
        Intrinsics.checkParameterIsNotNull(hustle, "hustle");
        Intrinsics.checkParameterIsNotNull(effort, "effort");
        let state: SideHustleState.SingleSideHustleState = this.sideHustleState.getState(hustle);
        if (state.getActiveProject() == null) {
            state.startProject(effort);
        }
        let states: SideHustleState.SingleSideHustleState[] = this.sideHustleState.getStates();
        let arrayList: ArrayList = new ArrayList();
        for (const singleSideHustleState of states) {
            singleSideHustleState.setCurrent(false);
            arrayList.add(Unit.INSTANCE);
        }
        this.jobState.setCurrentJob(null);
        state.setCurrent(true);
    }
    bankAction(bankAction: BankAction, amount: BankActionAmount): void {
        Intrinsics.checkParameterIsNotNull(bankAction, "bankAction");
        Intrinsics.checkParameterIsNotNull(amount, "amount");
        if (bankAction.getLockedString() != null) return;
        TelemetryManager.INSTANCE.logEvent("BankAction", MapsKt.mapOf(TuplesKt.to("Type", bankAction.getTitle()), TuplesKt.to("Amount", amount.toString())));
        switch (bankAction) {
            case BankAction.withdrawal:
                let amountForAction: number = amount.amountForAction(bankAction);
                Double.isNaN(amountForAction);
                let times: BigInteger = ExtensionsKt.times(this.moneyState.getSavings(), amountForAction / 100.0);
                let moneyState: MoneyState = this.moneyState;
                let negate: BigInteger = times.negate();
                MoneyState.updateMoney$default(moneyState, negate, MoneyUpdateType.misc, null, MoneyDestination.savings, 4, null);
                MoneyState.updateMoney$default(this.moneyState, times, MoneyUpdateType.misc, null, MoneyDestination.cash, 4, null);
                break;
            case BankAction.deposit:
                let amountForAction2: number = amount.amountForAction(bankAction);
                Double.isNaN(amountForAction2);
                let times2: BigInteger = ExtensionsKt.times(this.moneyState.getCash(), amountForAction2 / 100.0);
                let loanLimitUsed: BigInteger = this.moneyState.getLoanLimitUsed();
                let j: number = 0;
                let valueOf: BigInteger = BigInteger.valueOf(j);
                if (loanLimitUsed.compareTo(valueOf) > 0) {
                    let min: BigInteger = Utils.INSTANCE.min(times2, this.moneyState.getLoanLimitUsed());
                    let moneyState2: MoneyState = this.moneyState;
                    let subtract: BigInteger = moneyState2.getLoanLimitUsed().subtract(min);
                    moneyState2.setLoanLimitUsed(subtract);
                    let moneyState3: MoneyState = this.moneyState;
                    let companion = Utils.INSTANCE;
                    let valueOf2: BigInteger = BigInteger.valueOf(j);
                    moneyState3.setLoanLimitUsed(companion.max(valueOf2, this.moneyState.getLoanLimitUsed()));
                }
                MoneyState.updateMoney$default(this.moneyState, times2, MoneyUpdateType.misc, null, MoneyDestination.savings, 4, null);
                let moneyState4: MoneyState = this.moneyState;
                let negate2: BigInteger = times2.negate();
                MoneyState.updateMoney$default(moneyState4, negate2, MoneyUpdateType.misc, null, MoneyDestination.cash, 4, null);
                SoundManager.INSTANCE.playSound(SoundEffect.Coin);
                break;
            case BankAction.takeLoan:
                let amountForAction3: number = amount.amountForAction(bankAction);
                Double.isNaN(amountForAction3);
                let times3: BigInteger = ExtensionsKt.times(this.moneyState.getLoanAmountRemaining(), amountForAction3 / 100.0);
                MoneyState.updateMoney$default(this.moneyState, times3, MoneyUpdateType.misc, null, MoneyDestination.cash, 4, null);
                let moneyState5: MoneyState = this.moneyState;
                let negate3: BigInteger = times3.negate();
                MoneyState.updateMoney$default(moneyState5, negate3, MoneyUpdateType.misc, null, MoneyDestination.savings, 4, null);
                let moneyState6: MoneyState = this.moneyState;
                let add: BigInteger = moneyState6.getLoanLimitUsed().add(times3);
                moneyState6.setLoanLimitUsed(add);
                break;
            case BankAction.buyStock:
                let amountForAction4: number = amount.amountForAction(bankAction);
                Double.isNaN(amountForAction4);
                let times4: BigInteger = ExtensionsKt.times(this.moneyState.getCash(), amountForAction4 / 100.0);
                let valueOf3: BigInteger = BigInteger.valueOf(JMath.toInt(this.stockState.getCostPerShare()));
                let divide: BigInteger = times4.divide(valueOf3);
                let stockState: StockState = this.stockState;
                let add2: BigInteger = stockState.getSharesOwned().add(divide);
                stockState.setSharesOwned(add2);
                let moneyState7: MoneyState = this.moneyState;
                let negate4: BigInteger = times4.negate();
                MoneyState.updateMoney$default(moneyState7, negate4, MoneyUpdateType.misc, null, MoneyDestination.cash, 4, null);
                break;
            case BankAction.sellStock:
                let amountForAction5: number = amount.amountForAction(bankAction);
                Double.isNaN(amountForAction5);
                let times5: BigInteger = ExtensionsKt.times(this.stockState.getSharesOwned(), amountForAction5 / 100.0);
                let valueOf4: BigInteger = BigInteger.valueOf(JMath.toInt(this.stockState.getCostPerShare()));
                let multiply: BigInteger = times5.multiply(valueOf4);
                let stockState2: StockState = this.stockState;
                let subtract2: BigInteger = stockState2.getSharesOwned().subtract(times5);
                stockState2.setSharesOwned(subtract2);
                MoneyState.updateMoney$default(this.moneyState, multiply, MoneyUpdateType.misc, null, MoneyDestination.cash, 4, null);
                break;
            case BankAction.buyLottery:
                let amountForAction6: number = amount.amountForAction(bankAction);
                let lotteryTicketPrice: number = Constants.Money.INSTANCE.getLotteryTicketPrice() * amountForAction6;
                let moneyState8: MoneyState = this.moneyState;
                let valueOf5: BigInteger = BigInteger.valueOf(lotteryTicketPrice);
                MoneyState.updateMoney$default(moneyState8, valueOf5, MoneyUpdateType.directSpend, null, null, 12, null);
                AlertManager.INSTANCE.showLotteryAlert(amountForAction6);
                break;
        }
        let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
        if (mainGameFragment != null) {
            MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
        }
    }
    buyItem(possession: Possession): void {
        Intrinsics.checkParameterIsNotNull(possession, "possession");
        TelemetryManager.INSTANCE.logEvent("BuyInGameItem", MapsKt.mapOf(TuplesKt.to("Type", possession.getTitle())));
        let state: ItemState.SingleItemState = this.itemState.getState(possession);
        if (state.getOwned() && ((state.getType().getMaxLevel() === 1) || (state.getType().getMaxLevel() === state.getLevel()))) {
            state.setOwned(false);
            MoneyState.updateMoney$default(GameStateManager.INSTANCE.getPersonState().moneyState, state.getType().costForLevel(state.getLevel()), MoneyUpdateType.sell, null, null, 12, null);
            state.setLevel(0);
        } else {
            MoneyState.updateMoney$default(GameStateManager.INSTANCE.getPersonState().moneyState, state.getType().costForLevel(state.getLevel() + 1), MoneyUpdateType.directSpend, null, null, 12, null);
            this.itemState.acquireItem(possession);
        }
        let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
        if (mainGameFragment != null) {
            MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
        }
    }
    loveEvent(event: LoveEvent): void {
        let string: string;
        Intrinsics.checkParameterIsNotNull(event, "event");
        TelemetryManager.INSTANCE.logEvent("LoveEvent", MapsKt.mapOf(TuplesKt.to("Type", event.getTitle())));
        let lifeTracker: MiscState.LifeTracker = this.miscState.getLifeTracker();
        lifeTracker.setRelationshipAction(lifeTracker.getRelationshipAction() + 1);
        this.tempState.setPrevActionState(PlayerActionType.love);
        this.applyAttributeAndMoneyFromEvent(event);
        let partner: Person = this.familyState.getPartner();
        if (partner != null) {
            if (event.getDateprogressValue() !== 0) Relationships.applyGain(partner, "love:" + event.name(), event.getDateprogressValue());
        }
        switch (event) {
            case LoveEvent.breakUp:
            case LoveEvent.divorce:
                let alertManager: AlertManager = AlertManager.INSTANCE;
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string2: string = Utils.INSTANCE.getString(R.string.Alert_ConfirmDivorceTitle);
                let objArr = new Array(1).fill(null);
                let title: string = event.getTitle();
                if (title != null) {
                    let lowerCase: string = title.toLowerCase();
                    objArr[0] = lowerCase;
                    let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
                    alertManager.showConfirmationAlert(new AlertViewModel(format, Utils.INSTANCE.getString(R.string.Alert_ConfirmDivorceMessage), Integer.valueOf(event.getImageId()), null, null, null, null, null, null, 504, null), {
                        invoke: () => {
                        this.getFamilyState().breakUp();
                        this.applyWeekly();
                    }
                    });
                    return;
                }
                throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
            case LoveEvent.propose:
            case LoveEvent.marry:
                let str: string = (Utils.INSTANCE.returnFirstIfTrue(event === LoveEvent.propose, Utils.INSTANCE.getString(R.string.AlertVerb_Engaged), Utils.INSTANCE.getString(R.string.AlertVerb_Married)) as string);
                let alertManager2: AlertManager = AlertManager.INSTANCE;
                let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                let objArr2 = [str];
                let format2: string = String.format(Utils.INSTANCE.getString(R.string.AlertTitleMarriedToPerson), Arrays.copyOf(objArr2, objArr2.length));
                let stringCompanionObject3 = StringCompanionObject.INSTANCE;
                let string3: string = Utils.INSTANCE.getString(R.string.AlertMarriedToPerson);
                let objArr3 = new Array(2).fill(null);
                objArr3[0] = str;
                let partner2: Person = this.familyState.getPartner();
                objArr3[1] = (partner2 != null) ? partner2.getFullName() : null;
                let format3: string = String.format(string3, Arrays.copyOf(objArr3, objArr3.length));
                AlertManager.showAlert$default(alertManager2, new AlertViewModel(format2, format3, event.getImageId(), {
                    invoke: () => {
                    this.getFamilyState().advanceRomanticRelationship(event);
                    let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
                    if (mainGameFragment != null) {
                        MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
                    }
                }
                }), false, 2, null);
                break;
            case LoveEvent.makeBaby: {
                // v0.15.0: the woman of the couple carries the baby (by sex). Men can't get pregnant.
                if (!Babies.canMakeBaby(this) || this.familyState.getPregnantChild() != null) break;
                const child = Babies.startPregnancy(this, this.sex === Sex.female ? "you" : "partner");
                Babies.announce(child);
                break;
            }
            case LoveEvent.adoptBaby:
                let adoptChildForPlayer: Person = Person.INSTANCE.adoptChildForPlayer(GameStateManager.INSTANCE.getPersonState());
                this.familyState.getFamilyMembers().add(adoptChildForPlayer);
                AlertManager.INSTANCE.showBabyBornAlert(adoptChildForPlayer, true);
                break;
            case LoveEvent.abortChild:
                AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(Utils.INSTANCE.getString(R.string.Abortion_Title), Utils.INSTANCE.getString(R.string.Abortion_Message), R.drawable.love_abortion, {
                    invoke: () => {
                    this.getFamilyState().abortBaby();
                    let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
                    if (mainGameFragment != null) {
                        MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
                    }
                }
                }), false, 2, null);
                break;
            case LoveEvent.attendFuneral:
                let familyMembers: ArrayList<Person> = this.familyState.getFamilyMembers();
                let partner4: Person = this.familyState.getPartner();
                if (familyMembers == null) {
                    throw new TypeCastException("null cannot be cast to non-null type kotlin.collections.MutableCollection<T>");
                }
                TypeIntrinsics.asMutableCollection(familyMembers).remove(partner4);
                this.romanticRelationshipStatus = RomanticRelationshipStatus.single;
                break;
            default:
                if ((event.getChanceOfFindingDate() > 0.0) && Utils.Random.INSTANCE.rollWithProbability(Math.min(1, event.getChanceOfFindingDate() * Vampire.datingMultiplier() * Celebrity.datingMultiplier(this)))) {
                    let chooseFromPool: IProbableEvent = Utils.Random.INSTANCE.chooseFromPool(ArraysKt.toCollection(LoverPersonality.values(), new ArrayList()));
                    let alertManager4: AlertManager = AlertManager.INSTANCE;
                    if (chooseFromPool == null) {
                        throw new TypeCastException("null cannot be cast to non-null type Enums.LoverPersonality");
                    }
                    alertManager4.showMetPartnerAlert((chooseFromPool as unknown as LoverPersonality));
                    break;
                }
                break;
        }
        Vampire.maybeStranger(this, event);
        AlertManager.showRandomEvent$default(AlertManager.INSTANCE, RandomEvent.INSTANCE.randomEventForLoveEvent(event), false, 2, null);
        this.applyWeekly();
    }
    businessAction(action: BusinessAction, state: BusinessState.SingleBusinessState): void {
        Intrinsics.checkParameterIsNotNull(action, "action");
        Intrinsics.checkParameterIsNotNull(state, "state");
        let cost: BigInteger = action.cost(state);
        switch (action) {
            case BusinessAction.incorporate:
                state.setLevel(state.getLevel() + 1);
                AlertManager.INSTANCE.showCompanyIncorporated(state);
                break;
            case BusinessAction.upgrade:
                state.setLevel(state.getLevel() + 1);
                this.applyWeekly();
                break;
            case BusinessAction.hire:
                let numberOfBusinessUnits: BigInteger = state.getNumberOfBusinessUnits();
                let valueOf: BigInteger = BigInteger.valueOf(1);
                let add: BigInteger = numberOfBusinessUnits.add(valueOf);
                state.setNumberOfBusinessUnits(add);
                break;
            case BusinessAction.hireMax:
                let add2: BigInteger = state.getNumberOfBusinessUnits().add(state.getMaxEmployeeHirable());
                state.setNumberOfBusinessUnits(add2);
                break;
            case BusinessAction.moraleAction:
                state.setMoraleProgress(state.getMoraleProgress() + action.getMoraleBoost());
                this.applyWeekly();
                break;
            case BusinessAction.sellBusiness:
                let alertManager: AlertManager = AlertManager.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.Common_AreYouSure);
                let string2: string = Utils.INSTANCE.getString(R.string.Alert_Message_SellBusiness);
                let objArr = [state.getName(), ExtensionsKt.numberDisplayString$default(state.getTotalCompanyValue(), false, 1, null)];
                let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
                alertManager.showConfirmationAlert(new AlertViewModel(string, format, Integer.valueOf(state.getType().imageId(state.getLevel())), null, null, null, null, null, null, 504, null), {
                    invoke: () => {
                    state.sell(this);
                    Utils.INSTANCE.reloadGenericList(GenericListType.businessDetails);
                }
                });
                break;
        }
        MoneyState.updateMoney$default(this.moneyState, cost, MoneyUpdateType.directSpend, null, null, 12, null);
    }
    personInteractionEvent(action: PersonInteraction): void {
        Intrinsics.checkParameterIsNotNull(action, "action");
        TelemetryManager.INSTANCE.logEvent("PersonInteraction", MapsKt.mapOf(TuplesKt.to("Type", action.getTitle())));
        let i: PersonInteraction = action;
        if (i !== PersonInteraction.familyVacation) {
            if (i === PersonInteraction.adoptPet) {
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.choosePet, null, false, 6, null);
                return;
            }
            if (i !== PersonInteraction.roadTrip) {
                return;
            }
            this.applyAttributeAndMoneyFromEvent(action);
            let it = this.familyState.getAliveParents().iterator();
            while (it.hasNext()) {
                let next: Person = it.next();
                next.setRelationshipProgress(next.getRelationshipProgress() + action.getRelationshipModifier());
            }
            let lifeTracker: MiscState.LifeTracker = this.miscState.getLifeTracker();
            lifeTracker.setRelationshipAction(lifeTracker.getRelationshipAction() + 1);
            return;
        }
        this.applyAttributeAndMoneyFromEvent(action);
        let familyMembers: ArrayList<Person> = this.familyState.getFamilyMembers();
        let arrayList: ArrayList<Person> = new ArrayList();
        for (const obj of familyMembers) {
            let person: Person = (obj as unknown as Person);
            if (person.getIsAlive() && ((person.getRelationship() === Relationship.child) || (person.getRelationship() === Relationship.lover))) {
                arrayList.add(obj);
            }
        }
        for (const person2 of arrayList) {
            person2.setRelationshipProgress(person2.getRelationshipProgress() + action.getRelationshipModifier());
        }
        let lifeTracker2: MiscState.LifeTracker = this.miscState.getLifeTracker();
        lifeTracker2.setRelationshipAction(lifeTracker2.getRelationshipAction() + 1);
    }
    /** v0.28.1: what pops up on its own while a week goes by goes to News (AlertManager.inWeek). */
    applyWeekly(): void {
        AlertManager.inWeek++;
        try { this.applyWeeklyInner(); } finally { AlertManager.inWeek--; }
    }
    applyWeeklyInner(): void {
        this.collectWeeklyValues();
        this.applyWeeklyValues();
        // a vampire's body doesn't age: only the true age and the calendar move on
        if (Vampire.frozen(this)) Vampire.tickFrozen(this);
        else this.setAgeInWeeks(this.ageInWeeks + 1);
        Retirement.countWeek(this);
        Subscriptions.afterWeek(this);
        Vampire.afterWeek(this);
        Celebrity.afterWeek(this);
        let miscState: MiscState = this.miscState;
        miscState.setTotalWeekInLife(miscState.getTotalWeekInLife() + 1);
        let miscState2: MiscState = this.miscState;
        miscState2.setAdRewardDoubleIncomeWeeksLeft(miscState2.getAdRewardDoubleIncomeWeeksLeft() - 1);
        this.tempState.setPrevActionState(PlayerActionType.none);
        let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
        const collapsed = Vampire.isInTorpor(this);
        if (mainGameFragment != null && !collapsed) {
            MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
        }
        this.executePostWeekEndLogic();
        // v0.22.0: a vampire whose thirst bar filled up collapses now (years can pass)
        if (!collapsed) {
            Vampire.afterWeekEnd(this);
            LifeMoments.afterWeek(this);   // v0.25.0: a story with a choice, now and then
            Seasons.afterWeek(this);       // v0.26.0: holidays
            Careers.afterWeek(this);       // v0.26.0: career rules (fitness, retirement from sports)
            SocialMedia.afterWeek(this);   // v0.26.0: followers, deals, drama
            Crime.afterWeek(this);         // v0.27.0: heat, warrants, prison, gangs and families
            Illness.afterWeek(this);       // v0.28.0: catching and getting over illnesses
            if (Vampire.isInTorpor(this) === false && mainGameFragment != null) MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
        }
    }
    executePostWeekEndLogic(): void {
        if ((this.calendarWeeks() % Constants.Time.INSTANCE.getWeeksPerYear()) === 0) {
            this.newYearReached();
        }
        if (this.showDeathAlertsIfRequired()) {
            return;
        }
        this.updateAchievementAndBadge();
        this.showWarningAlerts();
        let miscState: MiscState = this.miscState;
        let currentAverageHappiness: number = miscState.getCurrentAverageHappiness();
        let d: number = this.ageInWeeks - 1;
        Double.isNaN(d);
        let d2: number = currentAverageHappiness * d;
        let happiness: number = this.attributeState.getHappiness();
        let d3: number = 100;
        Double.isNaN(d3);
        let d4: number = d2 + (happiness / d3);
        let d5: number = this.ageInWeeks;
        Double.isNaN(d5);
        miscState.setCurrentAverageHappiness(d4 / d5);
        if (this.familyState.getParentsStillLiving()) {
            let miscState2: MiscState = this.miscState;
            let currentParentRelationship: number = miscState2.getCurrentParentRelationship();
            let d6: number = this.ageInWeeks - 1;
            Double.isNaN(d6);
            let d7: number = currentParentRelationship * d6;
            let combinedParentRelationshipProgress: number = this.familyState.getCombinedParentRelationshipProgress();
            let maxValue: number = RelationshipProgressStatus.INSTANCE.getMaxValue();
            Double.isNaN(combinedParentRelationshipProgress);
            Double.isNaN(maxValue);
            let d8: number = d7 + (combinedParentRelationshipProgress / maxValue);
            let d9: number = this.ageInWeeks;
            Double.isNaN(d9);
            miscState2.setCurrentParentRelationship(d8 / d9);
        }
        if ((this.miscState.getTotalWeekInLife() % Constants.App.INSTANCE.getSaveGameEveryXWeeks()) === 0) {
            GameStateManager.INSTANCE.saveData();
        }
    }
    showDeathAlertsIfRequired(): boolean {
        if (Vampire.isInTorpor(this)) return false;   // v0.22.0: a collapsed vampire can't die of it
        return this.showAttributeDeathAlertIfRequired() || this.showBankruptcyAlertIfRequired();
    }
    showWarningAlerts(): void {
        AlertManager.INSTANCE.showAttributeLowAlertIfRequired(PersonAttribute.happiness, this.attributeState.getLowAttributeCountdown_happiness());
        AlertManager.INSTANCE.showAttributeLowAlertIfRequired(PersonAttribute.sanity, this.attributeState.getLowAttributeCountdown_sanity());
        AlertManager.INSTANCE.showAttributeLowAlertIfRequired(PersonAttribute.health, this.attributeState.getLowAttributeCountdown_health());
        let partner: Person = this.familyState.getPartner();
        if (partner != null) {
            if ((this.romanticRelationshipStatus !== RomanticRelationshipStatus.single) && (partner.getRelationshipProgress() <= 0)) {
                AlertManager.INSTANCE.showRelationshipBreakUp(partner);
                return;
            }
            let warningForBreakupThreshold: number = this.romanticRelationshipStatus.getWarningForBreakupThreshold();
            if (warningForBreakupThreshold != null) {
                if ((partner.getRelationshipProgress() >= warningForBreakupThreshold.intValue()) || this.miscState.getHasReceivedRelationshipWarning()) {
                    return;
                }
                AlertManager.INSTANCE.showRelationshipWarning(partner);
                this.miscState.setHasReceivedRelationshipWarning(true);
            }
        }
    }
    getWorkButtonType(): WorkType {
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let workType: WorkType = WorkType.none;
        if (personState.jobState.getCurrentJob() != null) {
            return WorkType.job;
        }
        return (personState.sideHustleState.currentSideHustleState() != null) ? WorkType.sideHustle : workType;
    }
    showAttributeDeathAlertIfRequired(): boolean {
        if (this.attributeState.getLowAttributeCountdown_happiness() >= (Constants.Person.INSTANCE.getWeeksTillZeroAttributeDeath() + 0)) {
            AlertManager.INSTANCE.showDeathAlert(PersonAttribute.happiness);
            return true;
        }
        if (this.attributeState.getLowAttributeCountdown_sanity() >= (Constants.Person.INSTANCE.getWeeksTillZeroAttributeDeath() + 0)) {
            AlertManager.INSTANCE.showDeathAlert(PersonAttribute.sanity);
            return true;
        }
        if (this.attributeState.getLowAttributeCountdown_health() < (Constants.Person.INSTANCE.getWeeksTillZeroAttributeDeath() + 0)) {
            return false;
        }
        AlertManager.INSTANCE.showDeathAlert(PersonAttribute.health);
        return true;
    }
    showBankruptcyAlertIfRequired(): boolean {
        let weeksTillZeroAttributeDeath: number = Constants.Person.INSTANCE.getWeeksTillZeroAttributeDeath() - this.moneyState.getLowMoneyCountDown();
        if (this.moneyState.getLowMoneyCountDown() === 0) {
            return false;
        }
        if ((weeksTillZeroAttributeDeath === 1) || (weeksTillZeroAttributeDeath === (Constants.Person.INSTANCE.getWeeksTillZeroAttributeDeath() - 1))) {
            AlertManager.INSTANCE.showBankNoticeAlert(this.moneyState.getBankruptcyLimit(), weeksTillZeroAttributeDeath);
            return false;
        }
        if (weeksTillZeroAttributeDeath > 0) {
            return false;
        }
        AlertManager.INSTANCE.showBankruptAlert();
        return true;
    }
    updateAchievementAndBadge(): void {
        for (const singleAchievementBadgeState of GameStateManager.INSTANCE.getGlobalStateManager().getAchievementBadgeState().incompletedBadges()) {
            if (!singleAchievementBadgeState.getType().getOnlyAchievedOnDeath() && singleAchievementBadgeState.getType().achieved(this)) {
                singleAchievementBadgeState.setCompleted(true);
                AlertManager.INSTANCE.showBadgeEarnedAlert(singleAchievementBadgeState.getType());
            }
        }
        if (this.lifeScenario.isCustomizable()) {
            return;
        }
        let it = GameStateManager.INSTANCE.getGlobalStateManager().getAchievementState().getStates().iterator();
        while (it.hasNext()) {
            let next: AchievementState.SingleAchievementState = it.next();
            if (!next.getCompleted() && next.getType().isAchievementConditionMet(this)) {
                next.setCompleted(true);
                AlertManager.INSTANCE.showAchievementAlert(next.getType());
            }
        }
    }
    newYearReached(): void {
        Retirement.onNewYear(this);
        // Upgraded: you're no longer kicked out at 18. You can keep living with your parents and move out whenever
        // you like (Profile → Real Estate). Their allowance still stops at 18.
        if ((this.getAgeInYears() === 18) && this.familyState.getParentsStillLiving() && (this.housingState.currentHousing().getType() === Housing.parentsHouse)) {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(Utils.INSTANCE.getString(R.string.AlertYouAreAdultNowTitle),
                "You're 18! You can keep living with your parents, or move out whenever you're ready (Profile → Real Estate). Your allowance has stopped.",
                R.drawable.waving_hand, "Okay", { invoke: () => {} }), false, 2, null);
        }
    }
    collectWeeklyValues(): void {
        // Real homes (owned or rented) are handled by the property system; only basic places (park bench,
        // shared room, parents' house, jail) keep the original fixed effects and rent.
        const realEstate = this.getRealEstate();
        realEstate.reconcile(this);
        const realHome = realEstate.managesHome();
        for (const housingStateSingle of this.housingState.getStates()) {
            if (housingStateSingle.getCurrentlyLivingHere() && !realHome) {
                this.attributeState.setDeltaValue(housingStateSingle.getType().getModifiers(), Utils.Strings.INSTANCE.formatWithDash(Utils.INSTANCE.getString(R.string.section_header_housing), housingStateSingle.getType().getTitle()));
                let rentalCost: BigInteger = housingStateSingle.getType().getRentalCost();
                let valueOf: BigInteger = BigInteger.valueOf(0);
                if ((rentalCost.compareTo(valueOf) > 0) && !housingStateSingle.getOwned()) {
                    MoneyState.updateMoney$default(this.moneyState, housingStateSingle.getType().getRentalCost(), MoneyUpdateType.expense, Utils.Strings.INSTANCE.formatWithDash(Utils.INSTANCE.getString(R.string.Bank_CashFlow_Rent), housingStateSingle.getType().getTitle()), null, 8, null);
                }
            }
        }
        // Rent you pay or earn, property tax, upkeep, utilities, mortgages and how your home feels.
        realEstate.collectWeeklyValues(this);
        Retirement.collectWeeklyValues(this);
        Subscriptions.collectWeeklyValues(this);
        Seasons.collectWeeklyValues(this);       // v0.26.0
        Crime.collectWeeklyValues(this);
        Illness.collectWeeklyValues(this);      // v0.28.0
        SpouseIncome.collectWeeklyValues(this);   // v0.28.1: your husband or wife works too
        SocialMedia.collectWeeklyValues(this);   // v0.26.0
        Vampire.collectWeeklyValues(this);
        Celebrity.collectWeeklyValues(this);
        this.attributeState.setDeltaValue(PersonAttribute.health, Utils.INSTANCE.getString(R.string.identity_name_age), this.getHealthStatus().getHealthModifier());
        let effectiveInterestRate: number = this.moneyState.getEffectiveInterestRate();
        let weeksPerYear: number = Constants.Time.INSTANCE.getWeeksPerYear();
        Double.isNaN(weeksPerYear);
        let times: BigInteger = ExtensionsKt.times(this.moneyState.getSavings(), (effectiveInterestRate / weeksPerYear) / 100.0);
        let j: number = 0;
        let valueOf3: BigInteger = BigInteger.valueOf(j);
        if (times.compareTo(valueOf3) > 0) {
            this.moneyState.updateMoney(times, MoneyUpdateType.passiveIncome, Utils.INSTANCE.getString(R.string.Bank_CashFlow_InterestingEarning), MoneyDestination.savings);
        }
        let effectiveLoanInterestRate: number = this.moneyState.getEffectiveLoanInterestRate();
        let weeksPerYear2: number = Constants.Time.INSTANCE.getWeeksPerYear();
        Double.isNaN(weeksPerYear2);
        let d: number = (effectiveLoanInterestRate / weeksPerYear2) / 100.0;
        let savings: BigInteger = this.moneyState.getSavings();
        let valueOf4: BigInteger = BigInteger.valueOf(j);
        if (savings.compareTo(valueOf4) < 0) {
            this.moneyState.updateMoney(ExtensionsKt.times(this.moneyState.getSavings(), d), MoneyUpdateType.expense, Utils.INSTANCE.getString(R.string.Bank_CashFlow_InterestingPayment), MoneyDestination.savings);
        }
        let partner: Person = this.familyState.getPartner();
        if (partner != null) {
            let partnerModifiers: Modifiers = partner.getPartnerModifiers();
            if (partnerModifiers != null) {
                this.attributeState.setDeltaValue(partnerModifiers, Utils.INSTANCE.getString(R.string.Love_Status_Partner));
            }
            let partnerCost: number = partner.getPartnerCost();
            if (partnerCost != null) {
                let intValue: number = partnerCost.intValue();
                let moneyState: MoneyState = this.moneyState;
                let valueOf5: BigInteger = BigInteger.valueOf(intValue);
                MoneyState.updateMoney$default(moneyState, valueOf5, MoneyUpdateType.misc, Utils.INSTANCE.getString(R.string.Love_Status_Partner), null, 8, null);
            }
        }
        this.familyState.collectWeeklyValues();
        let it = this.familyState.getAlivePets().iterator();
        while (it.hasNext()) {
            let next: Person = it.next();
            let petType: Pet = next.getPetType();
            if (petType != null) {
                let moneyState2: MoneyState = this.moneyState;
                let valueOf6: BigInteger = BigInteger.valueOf(petType.getMaintenanceCost());
                MoneyState.updateMoney$default(moneyState2, valueOf6, MoneyUpdateType.expense, next.getFullName(), null, 8, null);
                this.attributeState.setDeltaValue(petType.getModifiers(), next.getFullName());
            }
        }
        // vampires live on blood: their diet doesn't matter
        if (!Vampire.isVampire(this)) {
            MoneyState.updateMoney$default(this.moneyState, this.diet.getCost(), MoneyUpdateType.expense, Utils.Strings.INSTANCE.formatWithDash(Utils.INSTANCE.getString(R.string.Common_Diet), this.diet.getTitle()), null, 8, null);
            this.attributeState.setDeltaValue(this.diet.getModifiers(), Utils.Strings.INSTANCE.formatWithDash(Utils.INSTANCE.getString(R.string.Common_Diet), this.diet.getTitle()));
        }
        for (const singleSideHustleState of this.sideHustleState.getStates()) {
            if (singleSideHustleState.getWeeklyRevenue() > 0) {
                let moneyState3: MoneyState = this.moneyState;
                let valueOf7: BigInteger = BigInteger.valueOf(singleSideHustleState.getWeeklyRevenue());
                MoneyState.updateMoney$default(moneyState3, valueOf7, MoneyUpdateType.passiveIncome, (StringsKt.capitalize(singleSideHustleState.getType().getProjectName()) + " ") + Utils.INSTANCE.getString(R.string.Common_Revenue), null, 8, null);
            }
        }
        this.businessState.applyWeeklyValues(this);
        let moneyState4: MoneyState = this.moneyState;
        let valueOf8: BigInteger = BigInteger.valueOf(this.getCurrentAllowance());
        MoneyState.updateMoney$default(moneyState4, valueOf8, MoneyUpdateType.passiveIncome, Utils.INSTANCE.getString(R.string.Family_AllowanceLabel), null, 8, null);
        let it2 = this.traitState.getTraits().iterator();
        while (it2.hasNext()) {
            let next2: Trait = it2.next();
            let modifiers: Modifiers = next2.getModifiers();
            if (modifiers != null) {
                this.attributeState.setDeltaValue(modifiers, (Utils.INSTANCE.getString(R.string.Common_Trait) + " - ") + next2.getTitle());
            }
        }
        // a vampire's health never decays (only vampire dangers can lower it)
        Vampire.protectHealth(this);
    }
    resetValuesThisWeek(): void {
        this.attributeState.clearWeeklyValues();
        this.moneyState.resetWeekValues();
    }
    collectWeeklyAttributeDeltas(): Modifiers {
        let d: number;
        let modifiers: Modifiers = new Modifiers(0.0, 0.0, 0.0);
        this.collectWeeklyValues();
        for (const personAttribute of PersonAttribute.values()) {
            let deltaThisWeek: ArrayList<Pair<string, number>> = this.attributeState.getDeltaThisWeek(personAttribute);
            let arrayList: ArrayList = new ArrayList();
            let it = deltaThisWeek.iterator();
            while (true) {
                d = 0.0;
                if (!it.hasNext()) {
                    break;
                }
                let next = it.next();
                let pair: Pair = (next as unknown as Pair);
                if (((pair.getFirst() == null) || ((pair.getSecond()).doubleValue() === 0.0)) ? false : true) {
                    arrayList.add(next);
                }
            }
            let it2 = arrayList.iterator();
            while (it2.hasNext()) {
                d += (((it2.next() as unknown as Pair)).getSecond()).doubleValue();
            }
            modifiers.update(personAttribute, d);
        }
        this.resetValuesThisWeek();
        return modifiers;
    }
    collectWeeklyCashFlow(): ArrayList<Pair<string, BigInteger>> {
        this.collectWeeklyValues();
        let weeklyDelta: ArrayList<Pair<string, BigInteger>> = this.moneyState.getWeeklyDelta();
        this.resetValuesThisWeek();
        return weeklyDelta;
    }
    getTotalCashFlowPerWeek(): BigInteger {
        let collectWeeklyCashFlow: ArrayList<Pair<string, BigInteger>> = this.collectWeeklyCashFlow();
        let arrayList: ArrayList = new ArrayList();
        let it = collectWeeklyCashFlow.iterator();
        while (it.hasNext()) {
            arrayList.add((((it.next() as unknown as Pair)).getSecond() as unknown as BigInteger));
        }
        let valueOf: BigInteger = BigInteger.valueOf(0);
        let it2 = arrayList.iterator();
        while (it2.hasNext()) {
            valueOf = valueOf.add((it2.next() as unknown as BigInteger));
        }
        return valueOf;
    }
    applyWeeklyValues(): void {
        this.attributeState.applyThisWeeksValues();
        this.moneyState.applyThisWeekValues();
        RealEstateScreens.notify(this.getRealEstate().advanceWeek(this));
        this.stockState.incrementWeek();
        FamilyState.advanceWeek$default(this.familyState, 0, 1, null);
        this.sideHustleState.advanceWeek();
    }
    initializeParents(initialState: ParentInitialState): void {
        Intrinsics.checkParameterIsNotNull(initialState, "initialState");
        Relationships.rollSiblings(this);
        let i: ParentInitialState = initialState;
        if (i === ParentInitialState.alive) {
            this.populateParentsBasedOnAge(true);
        } else {
            if (i !== ParentInitialState.dead) {
                return;
            }
            this.populateParentsBasedOnAge(false);
        }
    }
    applyNameEasternEgg(): void {
        let fullName: string = this.getFullName();
        switch (Intrinsics.hashCode(fullName)) {
            case -1688224352:
                if (Intrinsics.areEqual(fullName, "Ludwig Beethoven")) {
                    this.completableActionState.completeAction(CompletableAction.college_music);
                    this.initializeSex(Sex.male, false);
                    return;
                }
                break;
            case -528410695:
                if (Intrinsics.areEqual(fullName, "Alan Turing")) {
                    this.completableActionState.completeAction(CompletableAction.college_computerScience);
                    this.initializeSex(Sex.male, false);
                    return;
                }
                break;
            case 140238860:
                if (Intrinsics.areEqual(fullName, "Pablo Picasso")) {
                    this.completableActionState.completeAction(CompletableAction.college_art);
                    this.initializeSex(Sex.male, false);
                    return;
                }
                break;
            case 1838271983:
                if (Intrinsics.areEqual(fullName, "Albert Einstein")) {
                    this.completableActionState.completeAction(CompletableAction.college_science);
                    this.initializeSex(Sex.male, false);
                    return;
                }
                break;
            case 1886042773:
                if (Intrinsics.areEqual(fullName, "William Shakespeare")) {
                    this.completableActionState.completeAction(CompletableAction.college_literature);
                    this.initializeSex(Sex.male, false);
                    return;
                }
                break;
            case 1994478874:
                if (Intrinsics.areEqual(fullName, "Elon Musk")) {
                    this.traitState.addTrait(Trait.intellectualCuriosity);
                    this.traitState.addTrait(Trait.logical);
                    this.initializeSex(Sex.male, false);
                    return;
                }
                break;
            case 2016710256:
                if (Intrinsics.areEqual(fullName, "Donald Trump")) {
                    this.traitState.addTrait(Trait.buttUgly);
                    this.traitState.addTrait(Trait.stupid);
                    this.traitState.addTrait(Trait.closeMinded);
                    this.initializeSex(Sex.male, false);
                    return;
                }
                break;
        }
        if (Intrinsics.areEqual(this.firstName, "Confucius")) {
            this.completableActionState.completeAction(CompletableAction.college_philosophy);
        }
    }
    static populateParentsBasedOnAge$default(player: Player, z: boolean, i: number, obj: any): void {
        if ((i & 1) !== 0) {
            z = true;
        }
        player.populateParentsBasedOnAge(z);
    }
    populateParentsBasedOnAge(alive: boolean): void {
        let familyState: FamilyState = this.familyState;
        let familyMembers: ArrayList<Person> = familyState.getFamilyMembers();
        let arrayList: ArrayList = new ArrayList();
        let it = familyMembers.iterator();
        while (true) {
            if (it.hasNext()) {
                let next = it.next();
                if (((next as unknown as Person)).getRelationship() !== Relationship.parent) {
                    arrayList.add(next);
                }
            } else {
                familyState.setFamilyMembers((CollectionsKt.toCollection(arrayList, new ArrayList()) as unknown as ArrayList));
                let randomValueWithinRange: number = Utils.Random.INSTANCE.randomValueWithinRange(18, 30);
                let randomValueWithinRange2: number = Utils.Random.INSTANCE.randomValueWithinRange(20, 30);
                let weeksPerYear: number = (this.ageInWeeks + (Constants.Time.INSTANCE.getWeeksPerYear() * randomValueWithinRange)) + Utils.Random.INSTANCE.randomValueWithinRange(1, 47);
                let person: Person = new Person(Relationship.parent, Sex.male, this.lastName, (this.ageInWeeks + (Constants.Time.INSTANCE.getWeeksPerYear() * randomValueWithinRange2)) + Utils.Random.INSTANCE.randomValueWithinRange(1, 47));
                person.setAlive(alive);
                let person2: Person = new Person(Relationship.parent, Sex.female, this.lastName, weeksPerYear);
                person2.setAlive(alive);
                this.familyState.getFamilyMembers().add(person);
                this.familyState.getFamilyMembers().add(person2);
                return;
            }
        }
    }
    initializeRandomTraits(): void {
        this.traitState.addRandomTrait(true, false);
        this.traitState.addRandomTrait(false, false);
    }
    initializeSex(sex: Sex, shouldUpdateFirstName: boolean): void {
        Intrinsics.checkParameterIsNotNull(sex, "sex");
        this.sex = sex;
        this.gender = sex.getCorrespondingGender();
        if (shouldUpdateFirstName) {
            this.firstName = NameGenerator.INSTANCE.generateFirstName(sex);
        }
        let partner: Person = this.familyState.getPartner();
        if (partner != null) {
            partner.setSex(this.sex.randomPartnerGender(this.sexuality));
        }
    }
    static initializeAge$default(player: Player, i: number, z: boolean, i2: number, obj: any): void {
        if ((i2 & 2) !== 0) {
            z = false;
        }
        player.initializeAge(i, z);
    }
    initializeAge(ageInYears: number, updateHousing: boolean): void {
        this.ageInWeeks = Constants.Time.INSTANCE.getWeeksPerYear() * ageInYears;
        this.trueAgeInWeeks = this.ageInWeeks;
        if (updateHousing) {
            if (ageInYears < 18) {
                this.housingState.moveHere(Housing.parentsHouse);
                this.diet = Diet.homeCooking;
            } else {
                this.housingState.moveHere(Housing.homeless);
                this.diet = Diet.cupnoodle;
            }
        }
        this.initializeParents(this.lifeScenario.getParentsInitialState());
    }
    initializeSexuality(sexuality: Sexuality): void {
        Intrinsics.checkParameterIsNotNull(sexuality, "sexuality");
        this.sexuality = sexuality;
        let partner: Person = this.familyState.getPartner();
        if (partner != null) {
            partner.setSex(this.sex.randomPartnerGender(this.sexuality));
        }
    }
    initializeLastName(lastName: string): void {
        Intrinsics.checkParameterIsNotNull(lastName, "lastName");
        this.lastName = lastName;
        for (const s of this.getSocial().list("sibling")) s.lastName = lastName;
        let parents: ArrayList<Person> = this.familyState.getParents();
        let arrayList: ArrayList = new ArrayList();
        let it = parents.iterator();
        while (it.hasNext()) {
            ((it.next() as unknown as Person)).setLastName(lastName);
            arrayList.add(Unit.INSTANCE);
        }
        let children: ArrayList<Person> = this.familyState.getChildren();
        let arrayList2: ArrayList = new ArrayList();
        let it2 = children.iterator();
        while (it2.hasNext()) {
            ((it2.next() as unknown as Person)).setLastName(lastName);
            arrayList2.add(Unit.INSTANCE);
        }
        let partner: Person = this.familyState.getPartner();
        if (partner != null) {
            if ((this.romanticRelationshipStatus === RomanticRelationshipStatus.married) || (this.romanticRelationshipStatus === RomanticRelationshipStatus.widowed)) {
                partner.setLastName(lastName);
            }
        }
    }
    initializeLover(personality: LoverPersonality, romanticRelationshipStatus: RomanticRelationshipStatus): void {
        Intrinsics.checkParameterIsNotNull(personality, "personality");
        Intrinsics.checkParameterIsNotNull(romanticRelationshipStatus, "romanticRelationshipStatus");
        let person: Person = new Person(Relationship.lover, this.sex.getOpposite(), this.lastName, this.ageInWeeks + Utils.Random.INSTANCE.randomValueWithinRange(-100, 100));
        person.setLoverPersonality(personality);
        person.setRelationshipProgress(RelationshipProgressStatus.lacking.getStartProgressValue());
        this.familyState.getFamilyMembers().add(person);
        this.romanticRelationshipStatus = romanticRelationshipStatus;
    }
    initializeMidLevelJobForDegree(collegeDegree: CompletableAction): void {
        Intrinsics.checkParameterIsNotNull(collegeDegree, "collegeDegree");
        let jobForDegree: Job = collegeDegree.getJobForDegree();
        if (jobForDegree != null) {
            let educationRequirement: CompletableAction = jobForDegree.educationRequirement(jobForDegree.getRandomRelativelyLowLevel());
            if (educationRequirement != null) {
                this.completableActionState.completeAction(educationRequirement);
            }
            this.jobState.switchJob(jobForDegree);
        }
    }
    initializeAgeInYears(ageInYears: number): void {
        this.ageInWeeks = ageInYears * Constants.Time.INSTANCE.getWeeksPerYear();
        this.trueAgeInWeeks = this.ageInWeeks;
    }
    applyPerkStateEffects(): void {
        if (this.perkState.hasPerk(Perk.trustFund)) {
            let moneyState: MoneyState = this.moneyState;
            let valueOf: BigInteger = BigInteger.valueOf(Perk.INSTANCE.getTrustFundExtraMoney());
            MoneyState.updateMoney$default(moneyState, valueOf, MoneyUpdateType.misc, null, null, 12, null);
        }
        if (this.perkState.hasPerk(Perk.naturalGenius)) {
            this.completableActionState.completeAction((ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction));
        }
        if (this.perkState.hasPerk(Perk.angelic)) {
            for (let i = 0; i < 4; i++) {
                this.traitState.addRandomTrait(true, false);
            }
        }
    }
    applyAttributeAndMoneyFromEvent(event: ActionDescriptor): void {
        Intrinsics.checkParameterIsNotNull(event, "event");
        MoneyState.updateMoney$default(this.moneyState, event.getCost(), MoneyUpdateType.directSpend, null, null, 12, null);
        AttributeState.setDeltaValue$default(this.attributeState, event.getModifiers(), null, 2, null);
    }
    hasTrait(trait: Trait): boolean {
        Intrinsics.checkParameterIsNotNull(trait, "trait");
        return this.traitState.hasTrait(trait);
    }
    hasSkill(skill: CompletableAction): boolean {
        Intrinsics.checkParameterIsNotNull(skill, "skill");
        return this.completableActionState.isCompleted(skill);
    }
    hasPerk(perk: Perk): boolean {
        Intrinsics.checkParameterIsNotNull(perk, "perk");
        return this.perkState.hasPerk(perk);
    }
}
export namespace Player {
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
        newPerson(): Player {
        let randomSex: Sex = Sex.INSTANCE.getRandomSex();
        return new Player(NameGenerator.INSTANCE.generateFirstName(randomSex), NameGenerator.INSTANCE.generateLastName(), randomSex.getCorrespondingGender(), Sexuality.straight, randomSex, Constants.Time.INSTANCE.getWeeksPerYear() * 18);
    }
    }
}
Player.INSTANCE = new Player.Companion(null);
