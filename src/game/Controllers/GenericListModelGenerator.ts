// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { RealEstateScreens } from "../RealEstate/RealEstateScreens";
import { Generations } from "../Managers/Generations";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { ArrayList, Arrays, ArraysKt, BigInteger, Boolean, CollectionsKt, ComparisonsKt, Integer, Intrinsics, Pair, R, Ref, SpannableStringBuilder, StringBuilder, StringsKt, TypeCastException, UUID, Unit } from "../runtime";
import { Achievement } from "../Enums/Achievement";
import { AchievementBadge } from "../Enums/AchievementBadge";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { ActionProgressViewModel } from "../Models/ActionProgressViewModel";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { BenefitLevel } from "../Enums/BenefitLevel";
import { Business } from "../Enums/Business";
import { BusinessAction } from "../Enums/BusinessAction";
import { BusinessState } from "../Managers/BusinessState";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { CompletableAction } from "../Enums/CompletableAction";
import { Constants } from "../Utils/Constants";
import { CustomizeOptionsViewModel } from "../Models/CustomizeOptionsViewModel";
import { CustomizeSingleOptionViewModel } from "../Models/CustomizeSingleOptionViewModel";
import { CustomizeSliderViewModel } from "../Models/CustomizeSliderViewModel";
import { CustomizeSwitchViewModel } from "../Models/CustomizeSwitchViewModel";
import { CustomizeTextFieldViewModel } from "../Models/CustomizeTextFieldViewModel";
import { EditableTextFieldViewModel } from "../Models/EditableTextFieldViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Gender } from "../Enums/Gender";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ImageButtonViewModel } from "../Models/ImageButtonViewModel";
import { ImageCellViewModel } from "../Models/ImageCellViewModel";
import { InAppPurchaseManager } from "../Managers/InAppPurchaseManager";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { LifeScenario } from "../Enums/LifeScenario";
import { LifeScenarioState } from "../Managers/LifeScenarioState";
import { MainApplication } from "../ui/bridge";
import { Modifiers } from "../Managers/Modifiers";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { Perk } from "../Enums/Perk";
import { Person } from "../Managers/Person";
import { PersonAttribute } from "../Enums/PersonAttribute";
import { PersonInteraction } from "../Enums/PersonInteraction";
import { Pet } from "../Enums/Pet";
import { Player } from "../Managers/Player";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { SettingsManager } from "../Managers/SettingsManager";
import { Sex } from "../Enums/Sex";
import { Sexuality } from "../Enums/Sexuality";
import { SideHustle } from "../Enums/SideHustle";
import { SideHustleState } from "../Managers/SideHustleState";
import { SingleButtonViewModel } from "../Models/SingleButtonViewModel";
import { SliderViewModel } from "../Models/SliderViewModel";
import { SoundManager } from "../Managers/SoundManager";
import { SwitchViewModel } from "../Models/SwitchViewModel";
import { TelemetryManager } from "../Managers/TelemetryManager";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { TombstoneViewModel } from "../Models/TombstoneViewModel";
import { Trait } from "../Enums/Trait";
import { Utils } from "../Utils/Utils";

export class GenericListModelGenerator {
    static INSTANCE: GenericListModelGenerator = new GenericListModelGenerator();
    constructor() {

    }
    genericListViewModels(type: GenericListType, key: string, canNavigationBack: boolean): GenericListFragmentViewModel {
        if (type === GenericListType.chooseHeir) return Generations.heirListViewModel();
        if (type === GenericListType.realEstate) return RealEstateScreens.overview();
        if (type === GenericListType.propertyDetails) return RealEstateScreens.details(key);
        if (type === GenericListType.propertyMarket) return RealEstateScreens.market();
        if (type === GenericListType.propertyRenovations) return RealEstateScreens.renovations(key);
        if (type === GenericListType.propertyFamily) return RealEstateScreens.family(key);
        if (type === GenericListType.rentalMarket) return RealEstateScreens.rentalMarket();
        let hidden: SwitchViewModel;
        let additionalDescription: string;
        let obj: any;
        let i: number;
        let z: boolean;
        let z2: boolean;
        let str: string;
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(key, "key");
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let arrayList: ArrayList = new ArrayList();
        let arrayList2: ArrayList = new ArrayList();
        let arrayList3: ArrayList = new ArrayList();
        let navBarTitle: string = type.getNavBarTitle();
        if (navBarTitle != null) {
            Boolean.valueOf(arrayList2.add(new NavigationBarViewModel(navBarTitle, canNavigationBack)));
        }
        switch (type) {
            case GenericListType.weeklyModifiers:
                let collectWeeklyAttributeDeltas: Modifiers = personState.collectWeeklyAttributeDeltas();
                let values: PersonAttribute[] = PersonAttribute.values();
                let length: number = values.length;
                let i2: number = 0;
                while (i2 < length) {
                    let personAttribute: PersonAttribute = values[i2];
                    arrayList.add(new LeftRightCellViewModel(personAttribute.getTitle(), ExtensionsKt.appendBold$default(new SpannableStringBuilder(), personAttribute.getTitle(), null, null, null, 14, null)));
                    personState.collectWeeklyValues();
                    let deltaThisWeek: ArrayList<Pair<string, number>> = personState.getAttributeState().getDeltaThisWeek(personAttribute);
                    let arrayList4: ArrayList = new ArrayList();
                    for (const obj2 of deltaThisWeek) {
                        let pair: Pair = (obj2 as unknown as Pair);
                        if (((pair.getFirst() == null) || ((pair.getSecond()).doubleValue() === 0.0)) ? false : true) {
                            arrayList4.add(obj2);
                        }
                    }
                    let arrayList5: ArrayList<Pair> = arrayList4;
                    for (const pair2 of arrayList5) {
                        let str2: string = (pair2.component1() as string);
                        let doubleValue: number = (pair2.component2()).doubleValue();
                        if (str2 == null) {
                            Intrinsics.throwNpe();
                        }
                        arrayList.add(new LeftRightCellViewModel(str2, new TextLabelViewModel(str2, null, false, false, null, null, 62, null), new TextLabelViewModel(ExtensionsKt.appendAttributesString$default(new SpannableStringBuilder(), Modifiers.INSTANCE.modifier(personAttribute, doubleValue), null, null, null, 14, null), false, false, null, 14, null), null, 8, null));
                        arrayList2 = arrayList2;
                        arrayList3 = arrayList3;
                    }
                    let arrayList6: ArrayList = arrayList2;
                    let arrayList7: ArrayList = arrayList3;
                    if (arrayList5.size() > 0) {
                        arrayList.add(new LeftRightCellViewModel("TotalLine", new TextLabelViewModel(Utils.INSTANCE.getString(R.string.Common_Total) + ":", null, false, true, null, null, 54, null), new TextLabelViewModel(ExtensionsKt.appendAttributesString$default(new SpannableStringBuilder(), Modifiers.INSTANCE.modifier(personAttribute, collectWeeklyAttributeDeltas.get(personAttribute)), null, null, personAttribute, 6, null), false, false, null, 14, null), null, 8, null));
                    }
                    personState.resetValuesThisWeek();
                    i2++;
                    arrayList2 = arrayList6;
                    arrayList3 = arrayList7;
                }
                break;
            case GenericListType.cashFlow:
                let sortedWith: ArrayList = CollectionsKt.sortedWith(personState.collectWeeklyCashFlow(), {
                    compare: (t: any, t2: any) => {
                    return ComparisonsKt.compareValues((((t as unknown as Pair)).getSecond() as unknown as BigInteger), (((t2 as unknown as Pair)).getSecond() as unknown as BigInteger));
                }
                });
                let arrayList8: ArrayList<Pair> = new ArrayList();
                for (const obj3 of sortedWith) {
                    if (((obj3 as unknown as Pair)).getFirst() != null) {
                        arrayList8.add(obj3);
                    }
                }
                for (const pair3 of arrayList8) {
                    let str3: string = (pair3.component1() as string);
                    let bigInteger: BigInteger = (pair3.component2() as unknown as BigInteger);
                    if (str3 == null) {
                        Intrinsics.throwNpe();
                    }
                    arrayList.add(new LeftRightCellViewModel(str3, new TextLabelViewModel(str3, null, false, false, null, null, 62, null), new TextLabelViewModel(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), ExtensionsKt.numberDisplayString$default(bigInteger, false, 1, null), Integer.valueOf(ExtensionsKt.displayColorForMoney(bigInteger)), null, null, 12, null), false, false, null, 14, null), null, 8, null));
                }
                let totalCashFlowPerWeek: BigInteger = personState.getTotalCashFlowPerWeek();
                arrayList.add(new LeftRightCellViewModel("TotalCash", new TextLabelViewModel(Utils.INSTANCE.getString(R.string.Common_Total) + ":", null, false, true, null, null, 54, null), new TextLabelViewModel(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), ExtensionsKt.numberDisplayString$default(totalCashFlowPerWeek, false, 1, null), Integer.valueOf(ExtensionsKt.displayColorForMoney(totalCashFlowPerWeek)), null, null, 12, null), false, false, null, 14, null), null, 8, null));
                break;
            case GenericListType.childDetails:
                let familyMembers: ArrayList<Person> = personState.getFamilyState().getFamilyMembers();
                let arrayList9: ArrayList = new ArrayList();
                for (const obj4 of familyMembers) {
                    if (Intrinsics.areEqual(((obj4 as unknown as Person)).getId(), key)) {
                        arrayList9.add(obj4);
                    }
                }
                let person: Person = (CollectionsKt.first((arrayList9 as unknown as ArrayList)) as unknown as Person);
                arrayList2.add(new NavigationBarViewModel(person.getFullName(), false, 2, null));
                arrayList.add(new ImageCellViewModel("ChildProfileImage", person.getAgeGroup().imageId(person.getSex()), null, 4, null));
                arrayList.add(Utils.ViewModel.INSTANCE.getPropertyListViewModel([new Pair(Utils.INSTANCE.getString(R.string.identity_name_name), String.valueOf(person.getFullName())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_relation), String.valueOf(person.getTitle())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_age), String.valueOf(person.getAgeInYears())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_gender), String.valueOf(person.getGender().getTitle())), new Pair(Utils.INSTANCE.getString(R.string.Common_Status), String.valueOf(person.getChildStatus()))]));
                CollectionsKt.addAll(arrayList, person.getRelationDescriptorAndProgressBarViewModels());
                if (person.getSupportedByParent()) {
                    arrayList.add(person.getChildSupport().getViewModelForChildSupport(person));
                }
                for (const personInteraction of PersonInteraction.INSTANCE.actionWithChild(person)) {
                    arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, personInteraction, null, 2, null));
                }
                break;
            case GenericListType.petDetails:
                let familyMembers2: ArrayList<Person> = personState.getFamilyState().getFamilyMembers();
                let arrayList10: ArrayList = new ArrayList();
                for (const obj5 of familyMembers2) {
                    if (Intrinsics.areEqual(((obj5 as unknown as Person)).getId(), key)) {
                        arrayList10.add(obj5);
                    }
                }
                let person2: Person = (CollectionsKt.first((arrayList10 as unknown as ArrayList)) as unknown as Person);
                let petType: Pet = person2.getPetType();
                if ((petType == null) || (petType == null)) {
                    petType = Pet.dog;
                }
                arrayList2.add(new NavigationBarViewModel(person2.getFullName(), false, 2, null));
                let imageId: number = petType.getImageId();
                let easternEggImage: number = petType.easternEggImage(person2.getFirstName());
                if (easternEggImage != null) {
                    imageId = easternEggImage.intValue();
                    let unit = Unit.INSTANCE;
                }
                arrayList.add(new ImageCellViewModel("PetProfileImage", imageId, null, 4, null));
                arrayList.add(Utils.ViewModel.INSTANCE.getPropertyListViewModel([new Pair(Utils.INSTANCE.getString(R.string.identity_name_name), String.valueOf(person2.getFirstName())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_age), String.valueOf(person2.getAgeInYears())), new Pair(Utils.INSTANCE.getString(R.string.Common_Animal), String.valueOf(petType.getTitle()))]));
                arrayList.add(new LeftRightCellViewModel("PetBenefit", ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Common_Benefits) + ": ", null, null, null, 14, null), petType.getModifiers(), null, null, null, 14, null)));
                CollectionsKt.addAll(arrayList, person2.getRelationDescriptorAndProgressBarViewModels());
                for (const personInteraction2 of PersonInteraction.INSTANCE.getPetActions()) {
                    arrayList.add(ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(personInteraction2, person2));
                }
                break;
            case GenericListType.choosePet:
                for (const pet of Pet.INSTANCE.getAllPurchasable()) {
                    arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, pet, null, 2, null));
                }
                break;
            case GenericListType.chooseDiet:
                for (const diet of personState.getCountry().getDietOptions()) {
                    let initWithActionDescriptor$default: ActionCellSingleViewModel = ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, diet, null, 2, null);
                    if (personState.getDiet() === diet) {
                        initWithActionDescriptor$default.getActionButton().setEnabled(false);
                    } else if (!initWithActionDescriptor$default.getActionButton().getShowLock()) {
                        initWithActionDescriptor$default.getActionButton().setEnabled(true);
                    }
                    arrayList.add(initWithActionDescriptor$default);
                }
                break;
            case GenericListType.sideHustleProjects:
                let valueOf: SideHustle = SideHustle.valueOf(key);
                let state: SideHustleState.SingleSideHustleState = personState.getSideHustleState().getState(valueOf);
                arrayList2.add(new NavigationBarViewModel(StringsKt.capitalize(valueOf.getProjectNamePlural()), false, 2, null));
                let array = ArraysKt.sortedWith(state.getCompletedProjects(), {
                    compare: (t: any, t2: any) => {
                    return ComparisonsKt.compareValues(((t2 as unknown as SideHustleState.SideHustleProject)).getQuality(), ((t as unknown as SideHustleState.SideHustleProject)).getQuality());
                }
                }).toArray(new Array(0).fill(null));
                if (array != null) {
                    for (const sideHustleProject of (array as unknown as SideHustleState.SideHustleProject[])) {
                        arrayList.add(new LeftRightCellViewModel("ProjectRow", new TextLabelViewModel(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), sideHustleProject.getQuality().getTitle(), Integer.valueOf(sideHustleProject.getQuality().getColor()), null, null, 12, null)), sideHustleProject.getName(), null, null, null, 14, null), false, false, null, 14, null), new TextLabelViewModel(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), ExtensionsKt.numberDisplayString$default(sideHustleProject.getQuality().weeklyIncome(valueOf), false, 1, null), R.color.flatGreen, null, null, 12, null), "/" + Utils.INSTANCE.getString(R.string.Common_Week), null, null, null, 14, null)), (ExtensionsKt.numberDisplayString(sideHustleProject.getTotalUnits(), false) + " ") + sideHustleProject.getType().getConsumptionUnitName(), null, null, null, 14, null), false, false, null, 14, null), null, 8, null));
                    }
                    arrayList.add(new LeftRightCellViewModel("ProjectTotal", new TextLabelViewModel(Utils.INSTANCE.getString(R.string.Common_Total), null, false, false, null, null, 62, null), new TextLabelViewModel(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), ExtensionsKt.numberDisplayString$default(state.getWeeklyRevenue(), false, 1, null), R.color.flatGreen, null, null, 12, null), "/" + Utils.INSTANCE.getString(R.string.Common_Week), null, null, null, 14, null), false, false, null, 14, null), null, 8, null));
                    break;
                } else {
                    throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
                }
            case GenericListType.settingsMenu:
                return SettingsManager.INSTANCE.getSettingsViewModel();
            case GenericListType.parentDetails:
                let familyMembers3: ArrayList<Person> = personState.getFamilyState().getFamilyMembers();
                let arrayList11: ArrayList = new ArrayList();
                for (const obj6 of familyMembers3) {
                    if (Intrinsics.areEqual(((obj6 as unknown as Person)).getId(), key)) {
                        arrayList11.add(obj6);
                    }
                }
                let person3: Person = (CollectionsKt.first((arrayList11 as unknown as ArrayList)) as unknown as Person);
                arrayList2.add(new NavigationBarViewModel(person3.getFullName(), false, 2, null));
                arrayList.add(new ImageCellViewModel("ParentProfileImage", person3.getAgeGroup().imageId(person3.getSex()), null, 4, null));
                arrayList.add(Utils.ViewModel.INSTANCE.getPropertyListViewModel([new Pair(Utils.INSTANCE.getString(R.string.identity_name_name), String.valueOf(person3.getFullName())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_relation), String.valueOf(person3.getTitle())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_age), String.valueOf(person3.getAgeInYears())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_gender), String.valueOf(person3.getGender().getTitle()))]));
                CollectionsKt.addAll(arrayList, person3.getRelationDescriptorAndProgressBarViewModels());
                for (const personInteraction3 of PersonInteraction.INSTANCE.getParentActions()) {
                    arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, personInteraction3, null, 2, null));
                }
                break;
            case GenericListType.scenarioSelection:
                arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.NewGame_HeaderTitle)));
                let states: ArrayList<LifeScenarioState.SingleLifeScenarioState> = GameStateManager.INSTANCE.getGlobalStateManager().getLifeScenarioState().getStates();
                let arrayList12: ArrayList = new ArrayList();
                for (const obj7 of states) {
                    let singleLifeScenarioState: LifeScenarioState.SingleLifeScenarioState = (obj7 as unknown as LifeScenarioState.SingleLifeScenarioState);
                    if (singleLifeScenarioState.getUnlocked() || singleLifeScenarioState.getType().getInitiallyUnlocked()) {
                        arrayList12.add(obj7);
                    }
                }
                for (const singleLifeScenarioState2 of CollectionsKt.sortedWith(arrayList12, {
                    compare: (t: any, t2: any) => {
                    return ComparisonsKt.compareValues(Integer.valueOf(((t as unknown as LifeScenarioState.SingleLifeScenarioState)).getType().getDifficulty().getRaw()), Integer.valueOf(((t2 as unknown as LifeScenarioState.SingleLifeScenarioState)).getType().getDifficulty().getRaw()));
                }
                })) {
                    let type2: LifeScenario = singleLifeScenarioState2.getType();
                    let title: string = type2.getTitle();
                    let appendBold$default: SpannableStringBuilder = ExtensionsKt.appendBold$default(new SpannableStringBuilder(), type2.getDifficulty().getTitle(), Integer.valueOf(type2.getDifficulty().getColor()), 17, null, 8, null);
                    if (singleLifeScenarioState2.getCompleted()) {
                        ExtensionsKt.appendFontAwesomeCharacter(appendBold$default, "  " + Utils.INSTANCE.getString(R.string.fa_trophy_solid), R.color.flatYellow, 15);
                    }
                    ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(appendBold$default), type2.getDescription(), null, null, null, 14, null);
                    arrayList.add(new ActionCellSingleViewModel(null, title, new TextLabelViewModel(appendBold$default, false, false, null, 14, null), new ButtonViewModel(Utils.INSTANCE.getString(R.string.Common_Choose), null, false, false, !singleLifeScenarioState2.getPurchased(), false, false, {
                        invoke: () => {
                        GameStateManager.INSTANCE.startNewGameFlow(type2);
                        Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.customizeGame, null, false, 6, null);
                    }
                    }, 110, null), null, null, 48, null));
                }
                break;
            case GenericListType.customizeGame:
                let newGamePlayerState: Player = GameStateManager.INSTANCE.getNewGamePlayerState();
                if (newGamePlayerState == null) {
                    Intrinsics.throwNpe();
                }
                let booleanRef: Ref.BooleanRef = new Ref.BooleanRef();
                // Fix: remember a typed name across screen refreshes (the original kept this flag per render, so
                // picking a sex afterwards re-rolled the first name, and the boxes were redrawn empty).
                const np: any = newGamePlayerState;
                booleanRef.element = np.customFirstName === true;
                arrayList.add(new CustomizeTextFieldViewModel(Utils.INSTANCE.getString(R.string.CustomGame_FirstName), new EditableTextFieldViewModel(Utils.INSTANCE.getString(R.string.CustomGame_TapToCustomize), {
                    invoke: (it: string) => {
                    Intrinsics.checkParameterIsNotNull(it, "it");
                    const name = it.trim();
                    if (name.length === 0) { np.customFirstName = false; booleanRef.element = false; return; }
                    newGamePlayerState.setFirstName(name);
                    np.customFirstName = true;
                    booleanRef.element = true;
                }
                }, false, 4, null).withInitialText(np.customFirstName ? newGamePlayerState.getFirstName() : null)));
                arrayList.add(new CustomizeTextFieldViewModel(Utils.INSTANCE.getString(R.string.CustomGame_LastName), new EditableTextFieldViewModel(Utils.INSTANCE.getString(R.string.CustomGame_TapToCustomize), {
                    invoke: (it: string) => {
                    Intrinsics.checkParameterIsNotNull(it, "it");
                    const name = it.trim();
                    if (name.length === 0) { np.customLastName = false; return; }
                    newGamePlayerState.initializeLastName(name);
                    np.customLastName = true;
                }
                }, false, 4, null).withInitialText(np.customLastName ? newGamePlayerState.getLastName() : null)));
                arrayList.add(new CustomizeOptionsViewModel(Utils.INSTANCE.getString(R.string.Common_Sex), newGamePlayerState.getMiscState().getIsSexExplicitlySet() ? newGamePlayerState.getSex().getTitle() : Utils.INSTANCE.getString(R.string.Common_Random), [new CustomizeSingleOptionViewModel(Sex.male.getTitle(), Sex.male.getImageId(), {
                    invoke: () => {
                    newGamePlayerState.initializeSex(Sex.male, !booleanRef.element);
                    newGamePlayerState.getMiscState().setSexExplicitlySet(true);
                    Utils.INSTANCE.reloadGenericList(GenericListType.customizeGame);
                }
                }), new CustomizeSingleOptionViewModel(Sex.female.getTitle(), Sex.female.getImageId(), {
                    invoke: () => {
                    newGamePlayerState.initializeSex(Sex.female, !booleanRef.element);
                    newGamePlayerState.getMiscState().setSexExplicitlySet(true);
                    Utils.INSTANCE.reloadGenericList(GenericListType.customizeGame);
                }
                }), new CustomizeSingleOptionViewModel(Utils.INSTANCE.getString(R.string.Common_Random), R.drawable.random, {
                    invoke: () => {
                    newGamePlayerState.initializeSex(Sex.INSTANCE.getRandomSex(), !booleanRef.element);
                    newGamePlayerState.getMiscState().setSexExplicitlySet(false);
                    Utils.INSTANCE.reloadGenericList(GenericListType.customizeGame);
                }
                })]));
                if (newGamePlayerState.getMiscState().getIsSexExplicitlySet()) {
                    arrayList.add(new CustomizeOptionsViewModel(Utils.INSTANCE.getString(R.string.Common_Gender), newGamePlayerState.getGender().getTitle(), [new CustomizeSingleOptionViewModel(Gender.male.getTitle(), Gender.male.getImageId(), {
                        invoke: () => {
                        newGamePlayerState.setGender(Gender.male);
                    }
                    }), new CustomizeSingleOptionViewModel(Gender.female.getTitle(), Gender.female.getImageId(), {
                        invoke: () => {
                        newGamePlayerState.setGender(Gender.female);
                    }
                    }), new CustomizeSingleOptionViewModel(Gender.nonbinary.getTitle(), Gender.nonbinary.getImageId(), {
                        invoke: () => {
                        newGamePlayerState.setGender(Gender.nonbinary);
                    }
                    })]));
                }
                arrayList.add(new CustomizeOptionsViewModel(Utils.INSTANCE.getString(R.string.Common_Sexuality), newGamePlayerState.getSexuality().getTitle(), [new CustomizeSingleOptionViewModel(Sexuality.straight.getTitle(), Sexuality.straight.getImageId(), {
                    invoke: () => {
                    newGamePlayerState.initializeSexuality(Sexuality.straight);
                }
                }), new CustomizeSingleOptionViewModel(Sexuality.gay.getTitle(), Sexuality.gay.getImageId(), {
                    invoke: () => {
                    newGamePlayerState.initializeSexuality(Sexuality.gay);
                }
                }), new CustomizeSingleOptionViewModel(Sexuality.bisexual.getTitle(), Sexuality.bisexual.getImageId(), {
                    invoke: () => {
                    newGamePlayerState.initializeSexuality(Sexuality.bisexual);
                }
                })]));
                if (newGamePlayerState.getLifeScenario().isCustomizable()) {
                    arrayList.add(new CustomizeSliderViewModel(Utils.INSTANCE.getString(R.string.identity_name_age), new SliderViewModel(8, 80, newGamePlayerState.getAgeInYears(), false, {
                        invoke: (i3: number) => {
                        newGamePlayerState.initializeAge(i3, true);
                    }
                    }, null, 32, null)));
                    let numArr: number[] = [-250000, -100000, 0, 50000, 200000, 500000, 1000000, 2000000, 5000000, 20000000, 50000000];
                    arrayList.add(new CustomizeSliderViewModel(Utils.INSTANCE.getString(R.string.CustomGame_StartingMoney), new SliderViewModel(0, numArr.length - 1, ArraysKt.indexOf(numArr, Integer.valueOf(newGamePlayerState.getMoneyState().getCash().intValue())), true, {
                        invoke: (i3: number) => {
                        newGamePlayerState.getMoneyState().initializeWithValues(i3, 0);
                    }
                    }, numArr)));
                    let getSandboxCustomizableEducation: CompletableAction[] = CompletableAction.INSTANCE.getGetSandboxCustomizableEducation();
                    let length2: number = getSandboxCustomizableEducation.length;
                    let i3: number = 0;
                    while (i3 < length2) {
                        let completableAction: CompletableAction = getSandboxCustomizableEducation[i3];
                        arrayList.add(new CustomizeSwitchViewModel(completableAction.getTitle(), new SwitchViewModel(newGamePlayerState.getCompletableActionState().isCompleted(completableAction), false, {
                            invoke: (z3: boolean) => {
                            if (z3) {
                                newGamePlayerState.getCompletableActionState().completeAction(completableAction);
                            } else {
                                newGamePlayerState.getCompletableActionState().clearAction(completableAction);
                            }
                        }
                        }, 2, null)));
                        i3++;
                        newGamePlayerState = newGamePlayerState;
                    }
                }
                arrayList3.add(new SingleButtonViewModel(new ButtonViewModel(Utils.INSTANCE.getString(R.string.Common_Next), null, false, false, false, false, false, {
                    invoke: () => {
                    Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.perkSelection, null, false, 6, null);
                }
                }, 126, null)));
                break;
            case GenericListType.perkSelection:
                let newGamePlayerState2: Player = GameStateManager.INSTANCE.getNewGamePlayerState();
                if (newGamePlayerState2 == null) {
                    Intrinsics.throwNpe();
                }
                arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.Perk_HeaderTitle)));
                let it = GameStateManager.INSTANCE.getGlobalStateManager().getPerkState().getStates().iterator();
                while (it.hasNext()) {
                    let type3: Perk = it.next().getType();
                    let isPerkUnlocked: boolean = GameStateManager.INSTANCE.getGlobalStateManager().getPerkState().isPerkUnlocked(type3);
                    if (isPerkUnlocked) {
                        newGamePlayerState2.getPerkState().addPerk(type3);
                    }
                    let description: string = isPerkUnlocked ? type3.getDescription() : type3.getLockedString();
                    let companion = ButtonViewModel.INSTANCE;
                    let hidden2: ButtonViewModel = isPerkUnlocked ? companion.getHidden() : companion.getLocked();
                    if (isPerkUnlocked) {
                        hidden = new SwitchViewModel(true, false, {
                            invoke: (z3: boolean) => {
                            if (z3) {
                                newGamePlayerState2.getPerkState().addPerk(type3);
                            } else {
                                newGamePlayerState2.getPerkState().getPerks().remove(type3);
                            }
                        }
                        });
                    } else {
                        hidden = SwitchViewModel.INSTANCE.getHidden();
                    }
                    arrayList.add(new ActionCellSingleViewModel(Integer.valueOf(type3.getImageId()), type3.getTitle(), new TextLabelViewModel(description, null, false, false, null, null, 62, null), hidden2, hidden, null, 32, null));
                }
                arrayList3.add(new SingleButtonViewModel(new ButtonViewModel(Utils.INSTANCE.getString(R.string.Perk_StartGameButton), null, false, false, false, false, false, {
                    invoke: () => {
                    GameStateManager.INSTANCE.startNewGame(newGamePlayerState2);
                    Utils.INSTANCE.navigationBackToMainGame();
                }
                }, 126, null)));
                break;
            case GenericListType.perkList:
                let it2 = personState.getPerkState().getPerks().iterator();
                while (it2.hasNext()) {
                    let next: Perk = it2.next();
                    arrayList.add(new LeftRightCellViewModel(next.getTitle(), new TextLabelViewModel(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), next.getTitle(), null, null, null, 14, null), false, false, null, 14, null), new TextLabelViewModel(next.getDescription(), null, false, false, null, null, 62, null), null, 8, null));
                }
                break;
            case GenericListType.traitList:
                for (const trait of CollectionsKt.sortedWith(personState.getTraitState().getTraits(), {
                    compare: (t: any, t2: any) => {
                    return ComparisonsKt.compareValues(Boolean.valueOf(((t2 as unknown as Trait)).isPositiveTrait()), Boolean.valueOf(((t as unknown as Trait)).isPositiveTrait()));
                }
                })) {
                    arrayList.add(new LeftRightCellViewModel(trait.getTitle(), new TextLabelViewModel(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), trait.getTitle(), Integer.valueOf(trait.isPositiveTrait() ? R.color.flatGreen : R.color.flatOrange), null, null, 12, null), false, false, null, 14, null), new TextLabelViewModel(trait.getDescription(), false, false, null, 14, null), null, 8, null));
                }
                break;
            case GenericListType.badgeList:
                CollectionsKt.addAll(arrayList, AchievementBadge.INSTANCE.getBadgeViewModels(personState));
                break;
            case GenericListType.achivementList:
                for (const achievement of Achievement.INSTANCE.getAvailableAchievements()) {
                    arrayList.add(new ActionProgressViewModel(achievement.getImageId(), achievement.getTitle(), new TextLabelViewModel(achievement.getDescription(), null, false, false, null, null, 62, null), GameStateManager.INSTANCE.getGlobalStateManager().getAchievementState().isAchievementComplete(achievement) ? Utils.INSTANCE.getString(R.string.Common_Complete) : null, achievement.getProgressState(personState), ImageButtonViewModel.INSTANCE.getHidden(), ButtonViewModel.INSTANCE.getHidden()));
                }
                break;
            case GenericListType.saveSlots:
                for (const singleSaveSlotState of GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getSlots()) {
                    arrayList.add(singleSaveSlotState.getViewModel());
                }
                break;
            case GenericListType.gameSettings:
                let customizeSwitchViewModel: CustomizeSwitchViewModel = new CustomizeSwitchViewModel(Utils.INSTANCE.getString(R.string.Switch_MusicEnabled), new SwitchViewModel(GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings().getMusicEnabled(), false, {
                    invoke: (z3: boolean) => {
                    GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings().setMusicEnabled(z3);
                    SoundManager.INSTANCE.toggleMusic(z3);
                }
                }));
                let customizeSwitchViewModel2: CustomizeSwitchViewModel = new CustomizeSwitchViewModel(Utils.INSTANCE.getString(R.string.Switch_SoundEnabled), new SwitchViewModel(GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings().getSoundEffectEnabled(), false, {
                    invoke: (z3: boolean) => {
                    GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings().setSoundEffectEnabled(z3);
                }
                }));
                let customizeSwitchViewModel3: CustomizeSwitchViewModel = new CustomizeSwitchViewModel(Utils.INSTANCE.getString(R.string.Haptics_Enabled), new SwitchViewModel(GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings().getHapticsEnabled(), false, {
                    invoke: (z3: boolean) => {
                    GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings().setHapticsEnabled(z3);
                }
                }));
                arrayList.add(customizeSwitchViewModel);
                arrayList.add(customizeSwitchViewModel2);
                arrayList.add(customizeSwitchViewModel3);
                break;
            case GenericListType.gameSummary:
                if (!Intrinsics.areEqual(key, Constants.ViewModel.INSTANCE.getTombstoneModeDeath())) {
                    UUID.fromString(key);
                    let pastLives: ArrayList<Player> = GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().getPastLives();
                    let arrayList13: ArrayList = new ArrayList();
                    for (const obj8 of pastLives) {
                        if (Intrinsics.areEqual(((obj8 as unknown as Player)).getId(), key)) {
                            arrayList13.add(obj8);
                        }
                    }
                    personState = (CollectionsKt.first((arrayList13 as unknown as ArrayList)) as unknown as Player);
                }
                arrayList.add(new TombstoneViewModel(personState.getGetDeathTombstoneString()));
                let singleButtonViewModel: SingleButtonViewModel = new SingleButtonViewModel(new ButtonViewModel(ExtensionsKt.appendFontAwesomeCharacter$default(ExtensionsKt.appendBold$default(ExtensionsKt.appendFontAwesomeCharacter$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.fa_star_solid), R.color.flatYellow, null, 4, null), ("  " + Utils.INSTANCE.getString(R.string.DeathLifeSummaryButtonShare)) + "  ", R.color.flatWhite, null, null, 12, null), Utils.INSTANCE.getString(R.string.fa_star_solid), R.color.flatYellow, null, 4, null), false, false, false, false, false, {
                    invoke: () => {
                    TelemetryManager.logEvent$default(TelemetryManager.INSTANCE, "DeathSummaryShareTapped", null, 2, null);
                    Utils.Share.INSTANCE.shareCurrentScreenshot(((Utils.INSTANCE.getString(R.string.DeathTombstoneShareMessage) + "\n") + Constants.App.INSTANCE.getShareGameLink()) + MainApplication.INSTANCE.applicationContext().getPackageName());
                }
                }, 62, null));
                let singleButtonViewModel2: SingleButtonViewModel = new SingleButtonViewModel(new ButtonViewModel(Utils.INSTANCE.getString(R.string.Alert_DeathAction_SecondChance), null, false, false, false, false, false, {
                    invoke: () => {
                    AlertManager.INSTANCE.showConfirmationAlert(new AlertViewModel(Utils.INSTANCE.getString(R.string.Common_AreYouSure), Utils.INSTANCE.getString(R.string.Revive_Confirmation_Text), R.drawable.iap_revive, null, null, null, null, null, null, 504, null), {
                        invoke: () => {
                        InAppPurchaseManager.INSTANCE.purchaseProduct(GameInAppPurchase.revive);
                    }
                    });
                }
                }, 126, null));
                let singleButtonViewModel3: SingleButtonViewModel = new SingleButtonViewModel(new ButtonViewModel(Utils.INSTANCE.getString(R.string.Common_NewGame), null, false, false, false, false, false, {
                    invoke: () => {
                    Utils.INSTANCE.triggerNewGameStart();
                }
                }, 126, null));
                if (Intrinsics.areEqual(key, Constants.ViewModel.INSTANCE.getTombstoneModeDeath()) && Generations.eligibleHeirs(personState).length > 0) {
                    arrayList3.add(new SingleButtonViewModel(new ButtonViewModel("Continue as your child", null, false, false, false, false, false, {
                        invoke: () => Generations.openHeirScreen(),
                    }, 126, null)));
                }
                // The "Share" (social media) button is removed in this edition.
                void singleButtonViewModel;
                if (Intrinsics.areEqual(key, Constants.ViewModel.INSTANCE.getTombstoneModeDeath())) {
                    arrayList3.add(singleButtonViewModel3);
                    break;
                } else {
                    arrayList3.add(singleButtonViewModel2);
                    break;
                }
            case GenericListType.cemetery:
                if (GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().getPastLives().size() === 0) {
                    arrayList.add(new LeftRightCellViewModel("EmptyCell", Utils.INSTANCE.getString(R.string.Cemetery_Empty_String)));
                    break;
                } else {
                    for (let it3 = GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().getPastLives().iterator(); it3.hasNext(); ) {
                        let live: Player = it3.next();
                        let appendNewline: SpannableStringBuilder = ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.identity_name_age), String.valueOf(live.getAgeInYears())), null, null, null, 14, null));
                        let sb: StringBuilder = new StringBuilder();
                        let companion2 = AchievementBadge.INSTANCE;
                        sb.append(companion2.getBadges(live).size());
                        sb.append(" ");
                        sb.append(Utils.INSTANCE.getString(R.string.Menu_Leaderboard_Badges));
                        arrayList.add(new LeftRightCellViewModel(live.getFullName(), new TextLabelViewModel(live.getFullName(), null, false, false, null, null, 62, null), new TextLabelViewModel(ExtensionsKt.appendBold$default(appendNewline, sb.toString(), R.color.flatGreen, 14, null, 8, null), false, false, null, 14, null), {
                            invoke: () => {
                            Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.gameSummary, live.getId(), false, 4, null);
                        }
                        }));
                    }
                    break;
                }
            case GenericListType.help:
                let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
                ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendBold$default(spannableStringBuilder, Utils.INSTANCE.getString(R.string.HelpPage_Attributes), null, 22, null, 10, null));
                for (const personAttribute2 of PersonAttribute.values()) {
                    ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(ExtensionsKt.appendNormal$default(ExtensionsKt.appendAttributeIcon$default(spannableStringBuilder, personAttribute2, null, 2, null), "  ", null, null, null, 14, null), personAttribute2.getTitle(), null, null, null, 14, null), " - " + personAttribute2.getHelpText(), null, null, null, 14, null));
                }
                ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendBold$default(spannableStringBuilder, Utils.INSTANCE.getString(R.string.HelpPage_Finance), null, 22, null, 10, null));
                for (const pair4 of [new Pair(Utils.INSTANCE.getString(R.string.Common_Wallet), Utils.INSTANCE.getString(R.string.HelpPage_Wallet)), new Pair(Utils.INSTANCE.getString(R.string.Common_Bank), Utils.INSTANCE.getString(R.string.HelpPage_Bank)), new Pair(Utils.INSTANCE.getString(R.string.Common_Bankruptcy), Utils.INSTANCE.getString(R.string.HelpPage_Bankruptcy)), new Pair(Utils.INSTANCE.getString(R.string.Bank_Label_LoanLimit), Utils.INSTANCE.getString(R.string.HelpPage_CreditLimit)), new Pair(Utils.INSTANCE.getString(R.string.SectionHeader_WeeklyCash), Utils.INSTANCE.getString(R.string.HelpPage_CashFlow))]) {
                    ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(spannableStringBuilder, (pair4.getFirst() as string), null, null, null, 14, null), " - " + ((pair4.getSecond() as string)), null, null, null, 14, null));
                }
                ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendBold$default(spannableStringBuilder, Utils.INSTANCE.getString(R.string.HelpSection_Relationship), null, 22, null, 10, null));
                for (const pair5 of [new Pair(Utils.INSTANCE.getString(R.string.SectionHeader_Love), Utils.INSTANCE.getString(R.string.HelpPage_Love)), new Pair(Utils.INSTANCE.getString(R.string.Common_Children), Utils.INSTANCE.getString(R.string.HelpPage_Children)), new Pair(Utils.INSTANCE.getString(R.string.HelpSection_Parents), Utils.INSTANCE.getString(R.string.HelpPage_Family))]) {
                    ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(spannableStringBuilder, (pair5.getFirst() as string), null, null, null, 14, null), " - " + ((pair5.getSecond() as string)), null, null, null, 14, null));
                }
                ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendBold$default(spannableStringBuilder, Utils.INSTANCE.getString(R.string.Job_Action_Work1), null, 22, null, 10, null));
                let pairArr: Pair[] = [new Pair(Utils.INSTANCE.getString(R.string.Common_Career), Utils.INSTANCE.getString(R.string.HelpSection_Career)), new Pair(Utils.INSTANCE.getString(R.string.SectionHeader_SideHustle), Utils.INSTANCE.getString(R.string.HelpSection_SideHustle))];
                for (const pair6 of pairArr) {
                    ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(spannableStringBuilder, (pair6.getFirst() as string), null, null, null, 14, null), " - " + ((pair6.getSecond() as string)), null, null, null, 14, null));
                }
                ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendBold$default(spannableStringBuilder, Utils.INSTANCE.getString(R.string.HelpPage_Goals), null, 22, null, 10, null));
                let pairArr2: Pair[] = [new Pair(Utils.INSTANCE.getString(R.string.HelpPage_Achievement), Utils.INSTANCE.getString(R.string.HelpPage_AchievementDescription)), new Pair(Utils.INSTANCE.getString(R.string.Common_Perks), Utils.INSTANCE.getString(R.string.HelpPage_PerksDescription)), new Pair(Utils.INSTANCE.getString(R.string.Common_Traits), Utils.INSTANCE.getString(R.string.Traits_HelpText))];
                for (const pair7 of pairArr) {
                    ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(spannableStringBuilder, (pair7.getFirst() as string), null, null, null, 14, null), " - " + ((pair7.getSecond() as string)), null, null, null, 14, null));
                }
                arrayList.add(new LeftRightCellViewModel("HelpText", new TextLabelViewModel(spannableStringBuilder, false, false, null, 14, null), TextLabelViewModel.INSTANCE.getHidden(), null, 8, null));
                break;
            case GenericListType.credits:
                let spannableStringBuilder2: SpannableStringBuilder = new SpannableStringBuilder();
                ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(ExtensionsKt.appendDoubleNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(spannableStringBuilder2, Utils.INSTANCE.getString(R.string.CreditText_Music), null, null, null, 14, null)), "bensound.com", null, null, null, 14, null)), Utils.INSTANCE.getString(R.string.CreditText_Icons), null, null, null, 14, null)), "flaticon.com", null, null, null, 14, null));
                arrayList.add(new LeftRightCellViewModel("CreditText", new TextLabelViewModel(spannableStringBuilder2, false, false, null, 14, null), TextLabelViewModel.INSTANCE.getHidden(), null, 8, null));
                break;
            case GenericListType.businessDetails:
                let states2: BusinessState.SingleBusinessState[] = GameStateManager.INSTANCE.getPersonState().getBusinessState().getStates();
                let arrayList14: ArrayList = new ArrayList();
                for (const singleBusinessState of states2) {
                    if (Intrinsics.areEqual(singleBusinessState.getId(), key)) {
                        arrayList14.add(singleBusinessState);
                    }
                }
                let singleBusinessState2: BusinessState.SingleBusinessState = (CollectionsKt.first((arrayList14 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState);
                let type4: Business = singleBusinessState2.getType();
                arrayList2.add(new NavigationBarViewModel(type4.companyTitle(singleBusinessState2.getLevel()), false, 2, null));
                arrayList.add(new ImageCellViewModel("CompanyLogo", type4.imageId(singleBusinessState2.getLevel()), singleBusinessState2.getHasIncorporated() ? type4.companyLogoImageEasternEgg(singleBusinessState2.getName()) : null));
                let spannableStringBuilder3: SpannableStringBuilder = new SpannableStringBuilder();
                let objectRef: Ref.ObjectRef = new Ref.ObjectRef();
                if (singleBusinessState2.getHasIncorporated()) {
                    let r8 = new Array(8).fill(null);
                    r8[0] = new Pair(Utils.INSTANCE.getString(R.string.Common_Type), type4.getBaseBusinessName());
                    r8[1] = new Pair(Utils.INSTANCE.getString(R.string.Common_Name), singleBusinessState2.getName());
                    r8[2] = new Pair(Utils.INSTANCE.getString(R.string.Common_Level), (singleBusinessState2.getLevel() + " - ") + singleBusinessState2.getBusinessName());
                    r8[3] = new Pair(StringsKt.capitalize(type4.getBusinessUnitTitle()), String.valueOf(ExtensionsKt.numberDisplayString(singleBusinessState2.getNumberOfBusinessUnits(), false)));
                    let string: string = Utils.INSTANCE.getString(R.string.BusinessAttribute_RevenuePer);
                    let objArr = new Array(1).fill(null);
                    let businessUnitSingularTitle: string = type4.getBusinessUnitSingularTitle();
                    if (businessUnitSingularTitle != null) {
                        let lowerCase: string = businessUnitSingularTitle.toLowerCase();
                        objArr[0] = lowerCase;
                        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                        r8[4] = new Pair(format, ExtensionsKt.numberDisplayString$default(singleBusinessState2.getRevenuePerEmployee(), false, 1, null));
                        let string2: string = Utils.INSTANCE.getString(R.string.BusinessAttribute_SalarayPer);
                        let objArr2 = new Array(2).fill(null);
                        objArr2[0] = type4.getUpkeepName();
                        let businessUnitSingularTitle2: string = type4.getBusinessUnitSingularTitle();
                        if (businessUnitSingularTitle2 != null) {
                            let lowerCase2: string = businessUnitSingularTitle2.toLowerCase();
                            objArr2[1] = lowerCase2;
                            let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
                            r8[5] = new Pair(format2, ExtensionsKt.numberDisplayString$default(singleBusinessState2.getSalaryPerEmployeePerWeek(), false, 1, null));
                            let string3: string = Utils.INSTANCE.getString(R.string.BusinessAttribute_ProfitPer);
                            let objArr3 = new Array(1).fill(null);
                            let businessUnitSingularTitle3: string = type4.getBusinessUnitSingularTitle();
                            if (businessUnitSingularTitle3 != null) {
                                let lowerCase3: string = businessUnitSingularTitle3.toLowerCase();
                                objArr3[0] = lowerCase3;
                                let format3: string = String.format(string3, Arrays.copyOf(objArr3, objArr3.length));
                                r8[6] = new Pair(format3, ExtensionsKt.numberDisplayString$default(singleBusinessState2.getProfitPerEmployee(), false, 1, null));
                                r8[7] = new Pair(Utils.INSTANCE.getString(R.string.BusinessAttribute_ProfitTotal), ExtensionsKt.numberDisplayString$default(singleBusinessState2.getTotalProfit(), false, 1, null));
                                objectRef.element = r8;
                            } else {
                                throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
                            }
                        } else {
                            throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
                        }
                    } else {
                        throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
                    }
                } else {
                    objectRef.element = [new Pair(Utils.INSTANCE.getString(R.string.Common_Type), type4.getBaseBusinessName())];
                }
                let pairArr3: Pair[] = (objectRef.element as unknown as Pair[]);
                let length3: number = pairArr3.length;
                let i4: number = 0;
                let i5: number = 0;
                while (i4 < length3) {
                    let pair8: Pair = pairArr3[i4];
                    let i6: number = i5 + 1;
                    ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(spannableStringBuilder3, (pair8.getFirst() as string), null, null, null, 14, null), ": " + pair8.getSecond(), null, null, null, 14, null);
                    if (i5 < (((objectRef.element as unknown as Pair[])).length - 1)) {
                        ExtensionsKt.appendNewline(spannableStringBuilder3);
                    }
                    i4++;
                    i5 = i6;
                }
                arrayList.add(new LeftRightCellViewModel("HelpText", new TextLabelViewModel(spannableStringBuilder3, false, false, null, 14, null), TextLabelViewModel.INSTANCE.getHidden(), null, 8, null));
                if (singleBusinessState2.getHasIncorporated()) {
                    let spannableStringBuilder4: SpannableStringBuilder = new SpannableStringBuilder();
                    ExtensionsKt.appendBold$default(spannableStringBuilder4, type4.getMoraleTitle() + ": ", null, null, null, 14, null);
                    ExtensionsKt.appendNormal$default(spannableStringBuilder4, type4.moraleText(singleBusinessState2.getMoraleProgressStatus()), Integer.valueOf(singleBusinessState2.getMoraleProgressStatus().getColor()), null, null, 12, null);
                    ExtensionsKt.appendNormal$default(spannableStringBuilder4, ((" • " + ExtensionsKt.toPercentString(singleBusinessState2.getMoraleRevenueModifier())) + " ") + Utils.INSTANCE.getString(R.string.Common_Revenue), Integer.valueOf(singleBusinessState2.getMoraleProgressStatus().getColor()), null, null, 12, null);
                    arrayList.add(new LeftRightCellViewModel("BusinessMorale", spannableStringBuilder4));
                    arrayList.add(RelationshipProgressStatus.INSTANCE.getProgressBarViewModel(singleBusinessState2.getMoraleProgress()));
                    let moraleLevel: BenefitLevel = singleBusinessState2.getMoraleLevel();
                    let spannableStringBuilder5: SpannableStringBuilder = new SpannableStringBuilder();
                    ExtensionsKt.appendNormal$default(spannableStringBuilder5, Utils.INSTANCE.getString(R.string.Common_Current) + ": ", null, null, null, 14, null);
                    ExtensionsKt.appendBold$default(spannableStringBuilder5, moraleLevel.getTitle(), Integer.valueOf(moraleLevel.getColor()), null, null, 12, null);
                    ExtensionsKt.appendNewline(spannableStringBuilder5);
                    ExtensionsKt.appendNormal$default(spannableStringBuilder5, (((("+" + ExtensionsKt.toPercentString(moraleLevel.getCostSalaryModifier())) + " ") + type4.getBusinessUnitSingularTitle()) + " ") + type4.getUpkeepName(), null, null, null, 14, null);
                    ExtensionsKt.appendNewline(spannableStringBuilder5);
                    ExtensionsKt.appendNormal$default(spannableStringBuilder5, (((ExtensionsKt.stringWithExplicitPlusMinusSign(moraleLevel.getWeeklyMoraleModifier()) + " ") + type4.getMoraleTitle()) + "/") + Utils.INSTANCE.getString(R.string.Common_Week), null, null, null, 14, null);
                    let arrayList15: ArrayList = new ArrayList();
                    let values2: BenefitLevel[] = BenefitLevel.values();
                    let length4: number = values2.length;
                    for (let i7 = 0; i7 < length4; i7++) {
                        let benefitLevel: BenefitLevel = values2[i7];
                        arrayList15.add(new ButtonViewModel(benefitLevel.getTitle(), null, benefitLevel !== moraleLevel, false, false, false, false, {
                            invoke: () => {
                            singleBusinessState2.setMoraleLevel(benefitLevel);
                            Utils.INSTANCE.reloadGenericList(GenericListType.businessDetails);
                        }
                        }, 122, null));
                    }
                    let valueOf2: number = Integer.valueOf(type4.getBenefitsImageId());
                    let upkeepTitle: string = type4.getUpkeepTitle();
                    let textLabelViewModel: TextLabelViewModel = new TextLabelViewModel(spannableStringBuilder5, false, false, null, 14, null);
                    let hidden3: TextLabelViewModel = TextLabelViewModel.INSTANCE.getHidden();
                    let array2 = arrayList15.toArray(new Array(0).fill(null));
                    if (array2 != null) {
                        arrayList.add(new ActionCellMultipleOptionsViewModel(valueOf2, upkeepTitle, textLabelViewModel, hidden3, (array2 as unknown as ButtonViewModel[]), null, 32, null));
                    } else {
                        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
                    }
                }
                for (const businessAction of singleBusinessState2.getHasIncorporated() ? BusinessAction.INSTANCE.getAllValues() : [BusinessAction.incorporate]) {
                    let spannableStringBuilder6: SpannableStringBuilder = new SpannableStringBuilder();
                    let requirementNotMetString: string = businessAction.requirementNotMetString(singleBusinessState2);
                    if (((requirementNotMetString == null) || (ExtensionsKt.appendNormal$default(spannableStringBuilder6, requirementNotMetString, null, null, null, 14, null) == null)) && ((additionalDescription = businessAction.additionalDescription(singleBusinessState2)) != null)) {
                        ExtensionsKt.appendNormal$default(spannableStringBuilder6, additionalDescription, null, null, null, 14, null);
                    }
                    let cost: BigInteger = businessAction.cost(singleBusinessState2);
                    let z3: boolean = requirementNotMetString != null;
                    if ((personState.getMoneyState().getCash().compareTo(cost) < 0) || z3) {
                        obj = null;
                        i = 1;
                        z = false;
                        z2 = false;
                    } else {
                        obj = null;
                        i = 1;
                        z = false;
                        z2 = true;
                    }
                    let numberDisplayString$default: string = ExtensionsKt.numberDisplayString$default(cost, z, i, obj);
                    let buttonTitle: string = businessAction.getButtonTitle();
                    if (buttonTitle != null) {
                        let unit2 = Unit.INSTANCE;
                        str = buttonTitle;
                    } else {
                        str = numberDisplayString$default;
                    }
                    arrayList.add(new ActionCellSingleViewModel(Integer.valueOf(businessAction.imageId(type4)), businessAction.title(type4), new TextLabelViewModel(spannableStringBuilder6, false, false, null, 14, null), new ButtonViewModel(str, null, z2, false, z3, false, false, {
                        invoke: () => {
                        GameStateManager.INSTANCE.getPersonState().businessAction(businessAction, singleBusinessState2);
                        Utils.INSTANCE.reloadGenericList(GenericListType.businessDetails);
                    }
                    }, 98, null), null, null, 48, null));
                }
                break;
        }
        return new GenericListFragmentViewModel(arrayList, arrayList2, arrayList3);
    }
}
