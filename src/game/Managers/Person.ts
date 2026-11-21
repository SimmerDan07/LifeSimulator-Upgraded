import { TrueAge } from "./TrueAge";
// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Arrays, ArraysKt, BigInteger, CollectionsKt, Integer, Intrinsics, JMath, NoWhenBranchMatchedException, R, Random, SpannableStringBuilder, StringCompanionObject, TypeCastException, UUID } from "../runtime";
import { Legacy } from "../Legacy/Legacy";
import { Relationships } from "../Social/Relationships";
import { Vampire } from "../Lifepaths/Vampire";
import { Babies } from "../Social/Babies";
import { FamilyExtras } from "./FamilyExtras";
import { AgeGroup } from "../Enums/AgeGroup";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { BaseViewModel } from "../Models/BaseViewModel";
import { BenefitLevel } from "../Enums/BenefitLevel";
import { ChildAgeGroup } from "../Enums/ChildAgeGroup";
import { ChildEducation } from "../Enums/ChildEducation";
import { CompletableAction } from "../Enums/CompletableAction";
import { Constants } from "../Utils/Constants";
import { DebugFlag } from "../Enums/DebugFlag";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { FamilyState } from "./FamilyState";
import { GameStateManager } from "./GameStateManager";
import { Gender } from "../Enums/Gender";
import { IProbableEvent } from "../Enums/IProbableEvent";
import { Job } from "../Enums/Job";
import { JobState } from "./JobState";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { MainGameFragment } from "../ui/bridge";
import { MiscState } from "./MiscState";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { NameGenerator } from "./NameGenerator";
import { PersonInteraction } from "../Enums/PersonInteraction";
import { Pet } from "../Enums/Pet";
import { Player } from "./Player";
import { PlayerActionType } from "../Enums/PlayerActionType";
import { PregnancyOutcome } from "../Enums/PregnancyOutcome";
import { ProgressBarCellViewModel } from "../Models/ProgressBarCellViewModel";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { Relationship } from "../Enums/Relationship";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { Sex } from "../Enums/Sex";
import { Sexuality } from "../Enums/Sexuality";
import { SoundManager } from "./SoundManager";
import { Species } from "../Enums/Species";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";

export class Person {
    static INSTANCE: any;
    ageInWeeks: number = 0;
    childJobState: JobState = null;
    /** v0.18.0: head style, skin tone and hair color (see Social/Appearance). */
    appearance: { style: number; skin: number; hair: number } = null;
    childSupport: BenefitLevel = null;
    firstName: string = null;
    gender: Gender = null;
    id: string = null;
    isAlive: boolean = false;
    isBuried: boolean = false;
    lastName: string = null;
    loverPersonality: LoverPersonality = null;
    petType: Pet = null;
    relationship: Relationship = null;
    relationshipProgress: number = 0;
    sex: Sex = null;
    sexuality: Sexuality = null;
    trueAgeInWeeks: number = 0;
    /** v0.29.2: whole blocks of TrueAge.BLOCK weeks carried out of trueAgeInWeeks (unlimited). */
    trueAgeBlocks?: BigInteger;
    /** Partner only: when you started dating / got married (player's true age in weeks). Undefined in older saves. */
    togetherSinceWeek: number = null;
    marriedSinceWeek: number = null;
    $init0(str: string, str2: string, gender: Gender, sexuality: Sexuality, sex: Sex, relationship: Relationship, i: number, loverPersonality: LoverPersonality, i2: number, defaultConstructorMarker: any): void {
        this.$init(str, str2, gender, sexuality, sex, relationship, i, ((i2 & 128) !== 0) ? null : loverPersonality);
    }
    $init1(firstName: string, lastName: string, gender: Gender, sexuality: Sexuality, sex: Sex, relationship: Relationship, i: number, loverPersonality: LoverPersonality): void {
        Intrinsics.checkParameterIsNotNull(firstName, "firstName");
        Intrinsics.checkParameterIsNotNull(lastName, "lastName");
        Intrinsics.checkParameterIsNotNull(gender, "gender");
        Intrinsics.checkParameterIsNotNull(sexuality, "sexuality");
        Intrinsics.checkParameterIsNotNull(sex, "sex");
        Intrinsics.checkParameterIsNotNull(relationship, "relationship");
        this.isAlive = true;
        this.childSupport = BenefitLevel.low;
        let uuid: string = UUID.randomUUID().toString();
        this.id = uuid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.sexuality = sexuality;
        this.sex = sex;
        this.relationship = relationship;
        this.setAgeInWeeks(i);
        this.trueAgeInWeeks = i;
        this.loverPersonality = loverPersonality;
        this.setRelationshipProgress(relationship.getStartingRelationshipProgress());
    }
    $init2(relationship: Relationship, sex: Sex, lastName: string, i: number): void {
        this.$init(NameGenerator.INSTANCE.generateFirstName(sex), lastName, sex.getCorrespondingGender(), Sexuality.straight, sex, relationship, i, null, 128, null);
        Intrinsics.checkParameterIsNotNull(relationship, "relationship");
        Intrinsics.checkParameterIsNotNull(sex, "sex");
        Intrinsics.checkParameterIsNotNull(lastName, "lastName");
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 10 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof Gender) && (a[3] == null || a[3] instanceof Sexuality) && (a[4] == null || a[4] instanceof Sex) && (a[5] == null || a[5] instanceof Relationship) && (typeof a[6] === 'number' || typeof a[6] === 'string') && (a[7] == null || a[7] instanceof LoverPersonality) && (typeof a[8] === 'number' || typeof a[8] === 'string')) return (this as any).$init0(...a);
        if (a.length === 8 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof Gender) && (a[3] == null || a[3] instanceof Sexuality) && (a[4] == null || a[4] instanceof Sex) && (a[5] == null || a[5] instanceof Relationship) && (typeof a[6] === 'number' || typeof a[6] === 'string') && (a[7] == null || a[7] instanceof LoverPersonality)) return (this as any).$init1(...a);
        if (a.length === 4 && (a[0] == null || a[0] instanceof Relationship) && (a[1] == null || a[1] instanceof Sex) && (a[2] == null || typeof a[2] === 'string') && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init2(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
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
    getFullName(): string {
        let pet: Pet;
        if ((this.relationship === Relationship.pet) && ((pet = this.petType) != null)) {
            let stringCompanionObject = StringCompanionObject.INSTANCE;
            let string: string = Utils.INSTANCE.getString(R.string.PetTitleFormat);
            let objArr = [this.firstName, pet.getTitle()];
            let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
            return format;
        }
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
    getRelationship(): Relationship {
        return this.relationship;
    }
    setRelationship(relationship: Relationship): void {
        Intrinsics.checkParameterIsNotNull(relationship, "<set-?>");
        this.relationship = relationship;
    }
    getRelationshipProgress(): number {
        return this.relationshipProgress;
    }
    setRelationshipProgress(i: number): void {
        this.relationshipProgress = ExtensionsKt.keepWithinRange(i, 0, RelationshipProgressStatus.INSTANCE.getMaxValue());
    }
    getIsAlive(): boolean {
        return this.isAlive;
    }
    setAlive(z: boolean): void {
        this.isAlive = z;
    }
    getIsBuried(): boolean {
        return this.isBuried;
    }
    setBuried(z: boolean): void {
        this.isBuried = z;
    }
    getRelationshipStatus(): RelationshipProgressStatus {
        return RelationshipProgressStatus.INSTANCE.statusFromValue(this.relationshipProgress);
    }
    getSpecie(): Species {
        let i: Relationship = this.relationship;
        if ((((i === Relationship.self) || (i === Relationship.lover)) || (i === Relationship.parent)) || (i === Relationship.child)) {
            return Species.person;
        }
        if (i === Relationship.pet) {
            return Species.pet;
        }
        throw new NoWhenBranchMatchedException();
    }
    getAgeInWeeks(): number {
        return this.ageInWeeks;
    }
    setAgeInWeeks(i: number): void {
        // True age goes up as the person ages (the original had this backwards, so it never advanced).
        let i2: number = i - this.ageInWeeks;
        if ((i < (Constants.Time.INSTANCE.getWeeksPerYear() * Constants.Person.INSTANCE.getMinAgeInYears())) && (this.relationship === Relationship.self)) {
            i = Constants.Time.INSTANCE.getWeeksPerYear() * Constants.Person.INSTANCE.getMinAgeInYears();
        }
        if (i2 > 0) {
            TrueAge.add(this, i2);
        }
        this.ageInWeeks = i;
    }
    getAgeInYears(): number {
        return JMath.idiv(this.ageInWeeks, Constants.Time.INSTANCE.getWeeksPerYear());
    }
    getAgeGroup(): AgeGroup {
        return AgeGroup.INSTANCE.getAgeGroup(this.getAgeInYears());
    }
    getTrueAgeInWeeks(): number {
        return TrueAge.weeksNumber(this);
    }
    setTrueAgeInWeeks(i: number): void {
        TrueAge.set(this, i);
    }
    addTrueAgeWeeks(n: number): void { TrueAge.add(this, n); }
    getTrueAgeInYears(): number {
        return TrueAge.yearsNumber(this);
    }
    getTrueAgeText(): string { return TrueAge.text(this); }
    getChanceOfDeathThisWeek(): number {
        let pet: Pet;
        if (Vampire.isTurned(this)) return 0;
        if ((this.relationship === Relationship.pet) && ((pet = this.petType) != null)) {
            return Constants.Person.INSTANCE.chanceOfDeathAtAgePerWeek(this.getAgeInYears(), pet.getAgeExpectancy()) * Relationships.petHealthFactor(this);
        }
        return Constants.Person.INSTANCE.chanceOfDeathAtAgePerWeek(this.getAgeInYears(), Constants.Person.INSTANCE.getPersonLifeExpectancy());
    }
    getChildAgeGroup(): ChildAgeGroup {
        return ChildAgeGroup.INSTANCE.stateWithAge(this.getAgeInYears());
    }
    getNotYetBorn(): boolean {
        return this.ageInWeeks < 0;
    }
    getSupportedByParent(): boolean {
        return (((this.getChildAgeGroup() === ChildAgeGroup.adult) || !this.isAlive) || this.getNotYetBorn()) ? false : true;
    }
    getChildStatus(): string {
        let educationWithAge: ChildEducation;
        if (!this.isAlive) {
            return Utils.INSTANCE.getString(R.string.Common_Deceased);
        }
        if (this.getChildAgeGroup() === ChildAgeGroup.infant) {
            return Utils.INSTANCE.getString(R.string.ChildLifeStage_Infant);
        }
        if ((this.childJobState != null) && (this.getAgeInYears() <= Constants.Time.INSTANCE.getRetirementAge())) {
            let companion = Utils.Strings.INSTANCE;
            let string: string = Utils.INSTANCE.getString(R.string.ChildLifeStage_Employed);
            let jobState: JobState = this.childJobState;
            let currentJob: Job = (jobState != null) ? jobState.getCurrentJob() : null;
            if (currentJob == null) {
                Intrinsics.throwNpe();
            }
            return companion.formatWithDash(string, currentJob.getJobTitles()[0]);
        }
        if (this.getAgeInYears() > Constants.Time.INSTANCE.getRetirementAge()) {
            return Utils.INSTANCE.getString(R.string.ChildLifeStage_Retired);
        }
        if ((ChildEducation.INSTANCE.educationWithAge(this.getAgeInYears()) != null) && ((educationWithAge = ChildEducation.INSTANCE.educationWithAge(this.getAgeInYears())) != null)) {
            return Utils.Strings.INSTANCE.formatWithDash(Utils.INSTANCE.getString(R.string.ChildLifeStage_Student), educationWithAge.getTitle());
        }
        return Utils.INSTANCE.getString(R.string.ChildEducation_Unemployed);
    }
    getChildJobState(): JobState {
        return this.childJobState;
    }
    setChildJobState(jobState: JobState): void {
        this.childJobState = jobState;
    }
    getChildSupport(): BenefitLevel {
        return this.childSupport;
    }
    setChildSupport(benefitLevel: BenefitLevel): void {
        Intrinsics.checkParameterIsNotNull(benefitLevel, "<set-?>");
        this.childSupport = benefitLevel;
    }
    getLoverPersonality(): LoverPersonality {
        return this.loverPersonality;
    }
    setLoverPersonality(loverPersonality: LoverPersonality): void {
        this.loverPersonality = loverPersonality;
    }
    getPartnerModifiers(): Modifiers {
        let loverPersonality: LoverPersonality = this.loverPersonality;
        if (loverPersonality == null) {
            return null;
        }
        if (GameStateManager.INSTANCE.getPersonState().getRomanticRelationshipStatus() === RomanticRelationshipStatus.married) {
            return loverPersonality.getModifiers().multiplyBy(2.0);
        }
        return loverPersonality.getModifiers();
    }
    getPartnerCost(): number {
        let loverPersonality: LoverPersonality = this.loverPersonality;
        if (loverPersonality == null) {
            return null;
        }
        if (GameStateManager.INSTANCE.getPersonState().getRomanticRelationshipStatus() === RomanticRelationshipStatus.married) {
            return Integer.valueOf(loverPersonality.getCost() * 2);
        }
        return Integer.valueOf(loverPersonality.getCost());
    }
    getPetType(): Pet {
        return this.petType;
    }
    setPetType(pet: Pet): void {
        this.petType = pet;
    }
    getTitle(): string {
        let i: Relationship = this.relationship;
        if (i === Relationship.parent) {
            let i2: Sex = this.sex;
            if (i2 === Sex.male) {
                return Utils.INSTANCE.getString(R.string.Parent_Name_Dad);
            }
            if (i2 === Sex.female) {
                return Utils.INSTANCE.getString(R.string.Parent_Name_Mom);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i !== Relationship.lover) {
            if (i === Relationship.child) {
                let i3: Sex = this.sex;
                if (i3 === Sex.male) {
                    return Utils.INSTANCE.getString(R.string.Common_Son);
                }
                if (i3 === Sex.female) {
                    return Utils.INSTANCE.getString(R.string.Common_Daughter);
                }
                throw new NoWhenBranchMatchedException();
            }
            if (i !== Relationship.pet) {
                if (i === Relationship.self) {
                    return "";
                }
                throw new NoWhenBranchMatchedException();
            }
            let pet: Pet = this.petType;
            if (pet == null) {
                Intrinsics.throwNpe();
            }
            return pet.getTitle();
        }
        let i4: RomanticRelationshipStatus = GameStateManager.INSTANCE.getPersonState().getRomanticRelationshipStatus();
        if (i4 === RomanticRelationshipStatus.inRelationship) {
            let i5: Sex = this.sex;
            if (i5 === Sex.male) {
                return Utils.INSTANCE.getString(R.string.Relation_InRelationship_Male);
            }
            if (i5 === Sex.female) {
                return Utils.INSTANCE.getString(R.string.Relation_InRelationship_Female);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i4 === RomanticRelationshipStatus.engaged) {
            return Utils.INSTANCE.getString(R.string.Relation_InEngaged);
        }
        if (i4 !== RomanticRelationshipStatus.married) {
            return (i4 !== RomanticRelationshipStatus.widowed) ? "" : Utils.INSTANCE.getString(R.string.Relation_Widowed_ExLover);
        }
        let i6: Sex = this.sex;
        if (i6 === Sex.male) {
            return Utils.INSTANCE.getString(R.string.Relation_Married_Male);
        }
        if (i6 === Sex.female) {
            return Utils.INSTANCE.getString(R.string.Relation_Married_Female);
        }
        throw new NoWhenBranchMatchedException();
    }
    initializeSex(sex: Sex, shouldUpdateFirstName: boolean): void {
        Intrinsics.checkParameterIsNotNull(sex, "sex");
        this.sex = sex;
        this.gender = sex.getCorrespondingGender();
        if (shouldUpdateFirstName) {
            this.firstName = NameGenerator.INSTANCE.generateFirstName(sex);
        }
    }
    collectWeeklyValuesForPerson(): void {
        if (this.isAlive && !this.getNotYetBorn()) {
            let personState: Player = GameStateManager.INSTANCE.getPersonState();
            if ((this.relationship === Relationship.child) && this.getSupportedByParent()) {
                let moneyState: MoneyState = personState.getMoneyState();
                let valueOf: BigInteger = BigInteger.valueOf(this.childSupport.getChildSupport_cost());
                let moneyUpdateType: MoneyUpdateType = MoneyUpdateType.expense;
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.ChildSupportFor);
                let objArr = [this.getFullName()];
                let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                MoneyState.updateMoney$default(moneyState, valueOf, moneyUpdateType, format, null, 8, null);
            }
        }
    }
    advanceWeek(weeksToAdvance: number): void {
        if (this.isAlive) {
            // someone you turned into a vampire stops ageing (their true age keeps counting)
            if (Vampire.isTurned(this)) {
                if (this.trueAgeBlocks == null && (this.trueAgeInWeeks ?? 0) < this.ageInWeeks) this.trueAgeInWeeks = this.ageInWeeks;
                TrueAge.add(this, weeksToAdvance);
            }
            else this.setAgeInWeeks(this.ageInWeeks + weeksToAdvance);
            if (!this.getNotYetBorn() && (weeksToAdvance <= 1)) {
                let personState: Player = GameStateManager.INSTANCE.getPersonState();
                let i: Relationship = this.relationship;
                if (i === Relationship.child) {
                    let i2: number = this.relationshipProgress;
                    if (personState.getTempState().getPrevActionState() !== PlayerActionType.child) {
                        this.setRelationshipProgress(this.relationshipProgress + Relationships.drift(this, personState));
                    }
                    if (this.getSupportedByParent()) {
                        if ((i2 > (JMath.idiv(RelationshipProgressStatus.lacking.getStartProgressValue(), 4))) && (this.relationshipProgress <= (JMath.idiv(RelationshipProgressStatus.lacking.getStartProgressValue(), 4)))) {
                            let alertManager: AlertManager = AlertManager.INSTANCE;
                            let string: string = Utils.INSTANCE.getString(R.string.Alert_ChildRelationshipLow_Title);
                            let stringCompanionObject = StringCompanionObject.INSTANCE;
                            let string2: string = Utils.INSTANCE.getString(R.string.Alert_ChildRelationshipLow_Message);
                            let objArr = [this.getFullName(), this.gender.getPronoun()];
                            let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
                            AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, R.drawable.angry, null, null, null, null, null, null, 504, null), false, 2, null);
                        } else if (this.relationshipProgress <= 0) {
                            let alertManager2: AlertManager = AlertManager.INSTANCE;
                            let string3: string = Utils.INSTANCE.getString(R.string.Alert_ChildRelationshipChildTaken_Title);
                            let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                            let string4: string = Utils.INSTANCE.getString(R.string.Alert_ChildRelationshipChildTaken_Message);
                            let objArr2 = new Array(2).fill(null);
                            objArr2[0] = this.getFullName();
                            let pronoun: string = this.gender.getPronoun();
                            if (pronoun != null) {
                                let lowerCase: string = pronoun.toLowerCase();
                                objArr2[1] = lowerCase;
                                let format2: string = String.format(string4, Arrays.copyOf(objArr2, objArr2.length));
                                AlertManager.showAlert$default(alertManager2, new AlertViewModel(string3, format2, R.drawable.police_badge, {
                                    invoke: () => {
                                    GameStateManager.INSTANCE.getPersonState().getFamilyState().getFamilyMembers().remove(this);
                                    let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
                                    if (mainGameFragment != null) {
                                        MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
                                    }
                                    Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal());
                                }
                                }), false, 2, null);
                            } else {
                                throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
                            }
                        }
                    }
                } else if (i === Relationship.pet) {
                    if (personState.getTempState().getPrevActionState() !== PlayerActionType.pet) {
                        this.setRelationshipProgress(this.relationshipProgress + Relationships.drift(this, personState));
                    }
                } else if (personState.getTempState().getPrevActionState() !== this.relationship.getCorrespondingActionType()) {
                    this.setRelationshipProgress(this.relationshipProgress + Relationships.drift(this, personState));
                }
                this.triggerPossibleDeath();
                if ((this.ageInWeeks % Constants.Time.INSTANCE.getWeeksPerYear()) === 0) {
                    this.advanceYear();
                }
            }
        }
    }
    getDeathReason(): string {
        let pet: Pet;
        let arrayList: ArrayList = new ArrayList();
        let i: Species = this.getSpecie();
        if (i === Species.person) {
            arrayList.addAll(CollectionsKt.listOf(([Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonCarAccident), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonMotorcycleAccident), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonStrokeByMeteor), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonOverdoseOnSleepingPills), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonFallingPiano), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonHitByTrain), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonKilledByBear), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonLandmineHopscotch), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonSkydiving), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonChokingOnABanana), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonSharkEncounter), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonSnowboardingAccident), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonPlayingPokemonGo), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonCliffJumping), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonFallingAC), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonFallInManhole), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonRanOverBy18Wheeler), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonPlaneCrash), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonStruckByLignting), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonTidePodChallenge), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonFallingIntoAMeatGrinder), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonDisease), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonHeartAttack), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonKidneyFailure), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonBadFall), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonYeastInfection), Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonKitchenFire)] as unknown as any[])));
            if (!GameStateManager.INSTANCE.getPersonState().getCompletableActionState().isCompleted(CompletableAction.cancerResearch)) {
                arrayList.add(Utils.INSTANCE.getString(R.string.FamilyAlert_DeathReasonCancer));
            }
        } else if ((i === Species.pet) && ((pet = this.petType) != null)) {
            return pet.getRandomDeathReason();
        }
        return (CollectionsKt.random(arrayList, Random.INSTANCE) as string);
    }
    die(): void {
        let pregnantChild: Person;
        this.isAlive = false;
        Vampire.onFamilyDeath(this);
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        // v0.28.0: real estates and wills (the original paid a random sum when the last parent died)
        try { Legacy.onRelativeDeath(this); } catch (e) { console.error(e); }
        if (this.relationship === Relationship.lover) {
            if (((pregnantChild = personState.getFamilyState().getPregnantChild()) != null) && Babies.carrierOf(pregnantChild) === "partner") {
                personState.getFamilyState().getFamilyMembers().remove(pregnantChild);
            }
            personState.setRomanticRelationshipStatus(RomanticRelationshipStatus.widowed);
        }
    }
    advanceYear(): void {
        let jobForDegree: Job;
        if (this.relationship === Relationship.child) {
            let educationWithAge: ChildEducation = ChildEducation.INSTANCE.educationWithAge(this.getAgeInYears() - 1);
            let educationWithAge2: ChildEducation = ChildEducation.INSTANCE.educationWithAge(this.getAgeInYears());
            if (this.getAgeInYears() === 0) {
                let chooseFromPool: IProbableEvent = Utils.Random.INSTANCE.chooseFromPool(ArraysKt.toCollection(PregnancyOutcome.values(), new ArrayList()));
                if (chooseFromPool == null) {
                    throw new TypeCastException("null cannot be cast to non-null type Enums.PregnancyOutcome");
                }
                ((chooseFromPool as unknown as PregnancyOutcome)).showAlertForOutcome(this);
                return;
            }
            if ((this.getChildAgeGroup() === ChildAgeGroup.adult) && (ChildAgeGroup.INSTANCE.stateWithAge(this.getAgeInYears() - 1) !== ChildAgeGroup.adult)) {
                let alertManager: AlertManager = AlertManager.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.ChildGrownUpTitle);
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string2: string = Utils.INSTANCE.getString(R.string.ChildGrownUpMessage);
                let objArr = [this.getFullName()];
                let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
                AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, R.drawable.childsupport, Utils.INSTANCE.getString(R.string.Common_Finally)), false, 2, null);
                return;
            }
            if ((educationWithAge2 === ChildEducation.college) && (educationWithAge !== ChildEducation.college)) {
                AlertManager.INSTANCE.showChildPayForCollegeAlert(this);
                return;
            }
            if (!(((educationWithAge2 == null) && (educationWithAge === ChildEducation.college)) || ((((educationWithAge2 == null) && (this.getAgeInYears() < Constants.Time.INSTANCE.getRetirementAge())) && (this.getChildAgeGroup() === ChildAgeGroup.adult)) && (this.childJobState == null))) || ((jobForDegree = ((ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction)).getJobForDegree()) == null)) {
                return;
            }
            AlertManager.INSTANCE.showChildStartNewJob(this, jobForDegree);
        }
    }
    interactionEvent(event: PersonInteraction): void {
        let pet: Pet;
        Intrinsics.checkParameterIsNotNull(event, "event");
        let lifeTracker: MiscState.LifeTracker = GameStateManager.INSTANCE.getPersonState().getMiscState().getLifeTracker();
        lifeTracker.setRelationshipAction(lifeTracker.getRelationshipAction() + 1);
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        personState.applyAttributeAndMoneyFromEvent(event);
        personState.getTempState().setPrevActionState(this.relationship.getCorrespondingActionType());
        let i: Relationship = this.relationship;
        if (i !== Relationship.pet) {
            if (i === Relationship.parent) {
                let lifeTracker2: MiscState.LifeTracker = GameStateManager.INSTANCE.getPersonState().getMiscState().getLifeTracker();
                lifeTracker2.setFamilyAction(lifeTracker2.getFamilyAction() + 1);
            } else if (i === Relationship.lover) {
                let lifeTracker3: MiscState.LifeTracker = GameStateManager.INSTANCE.getPersonState().getMiscState().getLifeTracker();
                lifeTracker3.setRelationshipAction(lifeTracker3.getRelationshipAction() + 1);
            } else if (i === Relationship.child) {
                let lifeTracker4: MiscState.LifeTracker = GameStateManager.INSTANCE.getPersonState().getMiscState().getLifeTracker();
                lifeTracker4.setChildrenAction(lifeTracker4.getChildrenAction() + 1);
            }
        } else if ((event !== PersonInteraction.abandonPet) && ((pet = this.petType) != null)) {
            SoundManager.INSTANCE.playSound(pet.getSoundEffect());
        }
        Relationships.applyGain(this, "pi:" + event.name(), event.getRelationshipModifier());
        if (event === PersonInteraction.putUpForAdoption) {
            let alertManager: AlertManager = AlertManager.INSTANCE;
            let string: string = Utils.INSTANCE.getString(R.string.Common_AreYouSure);
            let stringCompanionObject = StringCompanionObject.INSTANCE;
            let string2: string = Utils.INSTANCE.getString(R.string.Alert_PutBabyForAdoption_Message);
            let objArr = [this.getFullName()];
            let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
            alertManager.showConfirmationAlert(new AlertViewModel(string, format, Integer.valueOf(event.getImageId()), null, null, null, null, null, null, 504, null), {
                invoke: () => {
                let familyState: FamilyState = GameStateManager.INSTANCE.getPersonState().getFamilyState();
                let familyMembers: ArrayList<Person> = GameStateManager.INSTANCE.getPersonState().getFamilyState().getFamilyMembers();
                let arrayList: ArrayList = new ArrayList();
                for (const obj of familyMembers) {
                    if (!Intrinsics.areEqual(this.getId(), ((obj as unknown as Person)).getId())) {
                        arrayList.add(obj);
                    }
                }
                familyState.setFamilyMembers((CollectionsKt.toCollection(arrayList, new ArrayList()) as unknown as ArrayList));
                Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal());
            }
            });
            return;
        }
        if (event === PersonInteraction.funeral) {
            this.isBuried = true;
            Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal());
        } else if (event === PersonInteraction.abandonPet) {
            AlertManager.INSTANCE.showAbandonPetAlert(this);
        }
    }
    triggerPossibleDeath(): void {
        if (this.isAlive) {
            let rollWithProbability: boolean = Utils.Random.INSTANCE.rollWithProbability(this.getChanceOfDeathThisWeek());
            if (DebugFlag.simulateParentDeath.getEnabled() && ((this.relationship === Relationship.child) || (this.relationship === Relationship.parent))) {
                rollWithProbability = true;
            }
            if (rollWithProbability) {
                if (((this.relationship === Relationship.parent) || (this.relationship === Relationship.child)) || (this.relationship === Relationship.lover)) {
                    AlertManager.INSTANCE.showFamilyMemberDeathAlert(this);
                } else if (this.relationship === Relationship.pet) {
                    AlertManager.INSTANCE.showPetDeathAlert(this);
                }
            }
        }
    }
    getProgressBarViewModel(): BaseViewModel {
        return new ProgressBarCellViewModel("PersonRelationshipProgress." + this.getFullName(), new ProgressBarViewModel(this.relationshipProgress, RelationshipProgressStatus.INSTANCE.getMaxValue(), true, false, 8, null));
    }
    getRelationshipDescriptorViewModel(): BaseViewModel {
        return new LeftRightCellViewModel("RelationshipDescriptor." + this.getFullName(), ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.HelpSection_Relationship) + ": ", null, null, null, 14, null), this.getRelationshipStatus().title(this.relationship), Integer.valueOf(this.getRelationshipStatus().getColor()), null, null, 12, null));
    }
    getRelationDescriptorAndProgressBarViewModels(): BaseViewModel[] {
        return [this.getRelationshipDescriptorViewModel(), this.getProgressBarViewModel()];
    }
    getPersonNameAndAgeInfoViewModel(): LeftRightCellViewModel {
        let str: string;
        let string: string;
        let str2: string;
        let title: string;
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        if (this.getNotYetBorn()) {
            // v0.15.0: whoever is actually carrying the baby (you, your partner or a surrogate)
            string = Babies.carrierPhrase(this);
            ExtensionsKt.appendBold$default(spannableStringBuilder, (string + " ") + Utils.INSTANCE.getString(R.string.Common_Pregnant), null, null, null, 14, null);
            let stringCompanionObject2 = StringCompanionObject.INSTANCE;
            let string3: string = Utils.INSTANCE.getString(R.string.BabyDueIn);
            let objArr2 = [Integer.valueOf(Math.abs(this.ageInWeeks))];
            str = String.format(string3, Arrays.copyOf(objArr2, objArr2.length));
        } else {
            ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(spannableStringBuilder, this.getTitle() + " - ", null, null, null, 14, null), this.getFullName(), null, null, null, 14, null);
            str = (Utils.INSTANCE.returnFirstIfTrue(this.isAlive, Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.Health_Header_Age), this.getPetType() != null ? String.valueOf(this.getAgeInYears()) : FamilyExtras.ageText(this)), Utils.INSTANCE.getString(R.string.Common_Deceased)) as string);
        }
        return new LeftRightCellViewModel("PersonAgeInfo." + this.getFullName(), new TextLabelViewModel(spannableStringBuilder, false, false, null, 14, null), new TextLabelViewModel(str, null, false, false, Utils.INSTANCE.returnFirstIfTrue(this.isAlive, R.color.flatBlack, R.color.flatRed), null, 46, null), null, 8, null);
    }
}
export namespace Person {
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
        getPartnerForPlayer(player: Player, personality: LoverPersonality): Person {
        Intrinsics.checkParameterIsNotNull(player, "player");
        Intrinsics.checkParameterIsNotNull(personality, "personality");
        let randomPartnerGender: Sex = player.getSex().randomPartnerGender(player.getSexuality());
        let person: Person = new Person(NameGenerator.INSTANCE.generateFirstName(randomPartnerGender), NameGenerator.INSTANCE.generateLastName(), randomPartnerGender.getCorrespondingGender(), Sexuality.straight, randomPartnerGender, Relationship.lover, ExtensionsKt.randomSimilarValue(player.getAgeInWeeks(), 0.15), personality);
        person.setRelationshipProgress(JMath.idiv(RelationshipProgressStatus.lacking.getStartProgressValue(), 2));
        return person;
    }
        makeBabyForPlayer(player: Player): Person {
        Intrinsics.checkParameterIsNotNull(player, "player");
        return new Person(Relationship.child, Sex.INSTANCE.getRandomSex(), player.getLastName(), -Constants.Time.INSTANCE.getPregnancyTimeInWeeks());
    }
        adoptChildForPlayer(player: Player): Person {
        Intrinsics.checkParameterIsNotNull(player, "player");
        return new Person(Relationship.child, Sex.INSTANCE.getRandomSex(), player.getLastName(), Utils.Random.INSTANCE.randomValueWithinRange(5, Constants.Time.INSTANCE.getWeeksPerYear() * 3));
    }
    }
}
Person.INSTANCE = new Person.Companion(null);
