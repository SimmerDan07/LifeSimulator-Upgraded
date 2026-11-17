// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics, JMath } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { LoveEvent } from "../Enums/LoveEvent";
import { Person } from "./Person";
import { Pet } from "../Enums/Pet";
import { Player } from "./Player";
import { Relationship } from "../Enums/Relationship";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { Sex } from "../Enums/Sex";

export class FamilyState {
    static INSTANCE: any;
    familyMembers: ArrayList<Person> = null;
    constructor() {
        this.familyMembers = new ArrayList();
    }
    getFamilyMembers(): ArrayList<Person> {
        return this.familyMembers;
    }
    setFamilyMembers(arrayList: ArrayList<Person>): void {
        Intrinsics.checkParameterIsNotNull(arrayList, "<set-?>");
        this.familyMembers = arrayList;
    }
    getChildren(): ArrayList<Person> {
        return this.membersForType(Relationship.child);
    }
    getPets(): ArrayList<Person> {
        return this.membersForType(Relationship.pet);
    }
    getAlivePets(): ArrayList<Person> {
        let pets: ArrayList<Person> = this.getPets();
        let arrayList: ArrayList = new ArrayList();
        for (const obj of pets) {
            if (((obj as unknown as Person)).getIsAlive()) {
                arrayList.add(obj);
            }
        }
        return new ArrayList(arrayList);
    }
    getParents(): ArrayList<Person> {
        return this.membersForType(Relationship.parent);
    }
    getAliveChildren(): ArrayList<Person> {
        let arrayList: ArrayList<Person> = this.familyMembers;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            let person: Person = (obj as unknown as Person);
            if (((person.getRelationship() === Relationship.child) && !person.getNotYetBorn()) && person.getIsAlive()) {
                arrayList2.add(obj);
            }
        }
        return new ArrayList(arrayList2);
    }
    getAliveParents(): ArrayList<Person> {
        let arrayList: ArrayList<Person> = this.familyMembers;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            let person: Person = (obj as unknown as Person);
            if ((person.getRelationship() === Relationship.parent) && person.getIsAlive()) {
                arrayList2.add(obj);
            }
        }
        return new ArrayList(arrayList2);
    }
    getPartner(): Person {
        return (CollectionsKt.firstOrNull((this.membersForType(Relationship.lover) as unknown as ArrayList)) as unknown as Person);
    }
    getPregnantChild(): Person {
        let arrayList: ArrayList<Person> = this.familyMembers;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            let person: Person = (obj as unknown as Person);
            if (((person.getRelationship() === Relationship.child) && person.getNotYetBorn()) && person.getIsAlive()) {
                arrayList2.add(obj);
            }
        }
        return (CollectionsKt.firstOrNull((arrayList2 as unknown as ArrayList)) as unknown as Person);
    }
    getHasParents(): boolean {
        return this.getParents().size() > 0;
    }
    getParentsStillLiving(): boolean {
        let parents: ArrayList<Person> = this.getParents();
        let arrayList: ArrayList = new ArrayList();
        for (const obj of parents) {
            if (((obj as unknown as Person)).getIsAlive()) {
                arrayList.add(obj);
            }
        }
        return arrayList.size() > 0;
    }
    getCombinedParentRelationshipProgressStatus(): RelationshipProgressStatus {
        return RelationshipProgressStatus.INSTANCE.statusFromValue(this.getCombinedParentRelationshipProgress());
    }
    getCombinedParentRelationshipProgress(): number {
        let i: number = 0;
        if (!this.getHasParents()) {
            return 0;
        }
        let it = this.getParents().iterator();
        while (it.hasNext()) {
            i += ((it.next() as unknown as Person)).getRelationshipProgress();
        }
        return JMath.idiv(i, this.getParents().size());
    }
    breakUp(): void {
        let partner: Person = this.getPartner();
        if (partner != null) {
            this.familyMembers.remove(partner);
        }
        GameStateManager.INSTANCE.getPersonState().setRomanticRelationshipStatus(RomanticRelationshipStatus.single);
        if (GameStateManager.INSTANCE.getPersonState().getSex() === Sex.male) {
            let arrayList: ArrayList<Person> = this.familyMembers;
            let arrayList2: ArrayList = new ArrayList();
            for (const obj of arrayList) {
                let person: Person = (obj as unknown as Person);
                if ((person.getRelationship() === Relationship.child) && person.getNotYetBorn()) {
                    arrayList2.add(obj);
                }
            }
            arrayList.removeAll(arrayList2);
        }
    }
    getWithId(id: string): Person {
        Intrinsics.checkParameterIsNotNull(id, "id");
        let arrayList: ArrayList<Person> = this.familyMembers;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (Intrinsics.areEqual(((obj as unknown as Person)).getId(), id)) {
                arrayList2.add(obj);
            }
        }
        return (CollectionsKt.firstOrNull((arrayList2 as unknown as ArrayList)) as unknown as Person);
    }
    date(person: Person): void {
        Intrinsics.checkParameterIsNotNull(person, "person");
        GameStateManager.INSTANCE.getPersonState().setRomanticRelationshipStatus(RomanticRelationshipStatus.inRelationship);
        this.familyMembers.add(person);
        GameStateManager.INSTANCE.getPersonState().getMiscState().setHasReceivedRelationshipWarning(false);
    }
    advanceRomanticRelationship(event: LoveEvent): void {
        Intrinsics.checkParameterIsNotNull(event, "event");
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        if (event === LoveEvent.propose) {
            personState.setRomanticRelationshipStatus(RomanticRelationshipStatus.engaged);
            return;
        }
        if (event === LoveEvent.marry) {
            personState.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
            let partner: Person = this.getPartner();
            if (partner != null) {
                partner.setLastName(personState.getLastName());
            }
        }
    }
    makeBaby(): void {
        this.familyMembers.add(Person.INSTANCE.makeBabyForPlayer(GameStateManager.INSTANCE.getPersonState()));
    }
    abortBaby(): void {
        let pregnantChild: Person = this.getPregnantChild();
        if (pregnantChild != null) {
            this.familyMembers.remove(pregnantChild);
        }
    }
    static advanceWeek$default(familyState: FamilyState, i: number, i2: number, obj: any): void {
        if ((i2 & 1) !== 0) {
            i = 1;
        }
        familyState.advanceWeek(i);
    }
    advanceWeek(weeksToAdvance: number): void {
        let it = this.familyMembers.iterator();
        while (it.hasNext()) {
            ((it.next() as unknown as Person)).advanceWeek(weeksToAdvance);
        }
    }
    collectWeeklyValues(): void {
        let it = this.familyMembers.iterator();
        while (it.hasNext()) {
            ((it.next() as unknown as Person)).collectWeeklyValuesForPerson();
        }
    }
    removeWithId(id: string): void {
        Intrinsics.checkParameterIsNotNull(id, "id");
        let arrayList: ArrayList<Person> = this.familyMembers;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (!Intrinsics.areEqual(((obj as unknown as Person)).getId(), id)) {
                arrayList2.add(obj);
            }
        }
        this.familyMembers = (CollectionsKt.toCollection(arrayList2, new ArrayList()) as unknown as ArrayList);
    }
    static adoptPet$default(familyState: FamilyState, pet: Pet, num: number, i: number, obj: any): Person {
        if ((i & 2) !== 0) {
            num = 0;
        }
        return familyState.adoptPet(pet, num);
    }
    adoptPet(type: Pet, ageInWeeks: number): Person {
        Intrinsics.checkParameterIsNotNull(type, "type");
        let person: Person = new Person(Relationship.pet, Sex.INSTANCE.getRandomSex(), "", (ageInWeeks != null) ? ageInWeeks.intValue() : 0);
        person.setFirstName(type.getRandomName());
        person.setPetType(type);
        person.setRelationshipProgress(RelationshipProgressStatus.lacking.getStartProgressValue());
        this.familyMembers.add(person);
        return person;
    }
    membersForType(type: Relationship): ArrayList<Person> {
        let arrayList: ArrayList<Person> = this.familyMembers;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (((obj as unknown as Person)).getRelationship() === type) {
                arrayList2.add(obj);
            }
        }
        return new ArrayList(arrayList2);
    }
}
export namespace FamilyState {
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
    }
}
FamilyState.INSTANCE = new FamilyState.Companion(null);
