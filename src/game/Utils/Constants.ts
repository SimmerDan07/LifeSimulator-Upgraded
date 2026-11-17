// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Double, HashMap, Intent as rt_Intent, MapsKt, TuplesKt, Uri } from "../runtime";
import { ExtensionsKt } from "./ExtensionsKt";
import { ValueRange } from "./ValueRange";

export class Constants {
}
export namespace Constants {
    export class Font {
    }
    export class Attribute {
        static INSTANCE: any;
        static maxAttributeValue: number;
    }
    export namespace Attribute {
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
            getMaxAttributeValue(): number {
        return Constants.Attribute.maxAttributeValue;
    }
        }
    }
    export class Time {
        static INSTANCE: any;
        static weeksPerMonth: number;
        static monthsPerYear: number;
        static weeksPerYear: number;
        static workYearLengthWeeks: number;
        static pregnancyTimeInWeeks: number;
        static retirementAge: number;
        static pregnancyAgeRange: ValueRange;
        static maxBackgroundIncomeRewardInDays: number;
        static incomeMultiplePerBackgroundMinute: number;
    }
    export namespace Time {
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
            getWeeksPerMonth(): number {
        return Constants.Time.weeksPerMonth;
    }
            getMonthsPerYear(): number {
        return Constants.Time.monthsPerYear;
    }
            getWeeksPerYear(): number {
        return Constants.Time.weeksPerYear;
    }
            getWorkYearLengthWeeks(): number {
        return Constants.Time.workYearLengthWeeks;
    }
            setWorkYearLengthWeeks(i: number): void {
        Constants.Time.workYearLengthWeeks = i;
    }
            getPregnancyTimeInWeeks(): number {
        return Constants.Time.pregnancyTimeInWeeks;
    }
            getRetirementAge(): number {
        return Constants.Time.retirementAge;
    }
            getPregnancyAgeRange(): ValueRange {
        return Constants.Time.pregnancyAgeRange;
    }
            getMaxBackgroundIncomeRewardInDays(): number {
        return Constants.Time.maxBackgroundIncomeRewardInDays;
    }
            getIncomeMultiplePerBackgroundMinute(): number {
        return Constants.Time.incomeMultiplePerBackgroundMinute;
    }
        }
    }
    export class App {
        static INSTANCE: any;
        static shareGameLink: string;
        static twitterLink: string;
        static instagramLink: string;
        static redditLink: string;
        static discordLink: string;
        static appLink: string;
        static saveGameEveryXWeeks: number;
    }
    export namespace App {
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
            getShareGameLink(): string {
        return Constants.App.shareGameLink;
    }
            getTwitterLink(): string {
        return Constants.App.twitterLink;
    }
            getInstagramLink(): string {
        return Constants.App.instagramLink;
    }
            getRedditLink(): string {
        return Constants.App.redditLink;
    }
            getDiscordLink(): string {
        return Constants.App.discordLink;
    }
            getAppLink(): string {
        return Constants.App.appLink;
    }
            getSaveGameEveryXWeeks(): number {
        return Constants.App.saveGameEveryXWeeks;
    }
        }
    }
    export class Person {
        static INSTANCE: any;
        static minAgeInYears: number;
        static personLifeExpectancy: number;
        static weeksTillZeroAttributeDeath: number;
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
            getMinAgeInYears(): number {
        return Constants.Person.minAgeInYears;
    }
            getPersonLifeExpectancy(): number {
        return Constants.Person.personLifeExpectancy;
    }
            getWeeksTillZeroAttributeDeath(): number {
        return Constants.Person.weeksTillZeroAttributeDeath;
    }
            chanceOfDeathAtAgePerWeek(currentAge: number, lifeExpectancy: number): number {
        let valueOf: number = Double.valueOf(0.6);
        let valueOf2: number = Double.valueOf(0.9);
        let valueOf3: number = Double.valueOf(1.0);
        let mapOf: HashMap = MapsKt.mapOf(TuplesKt.to(Double.valueOf(0.0), Double.valueOf(5.0E-4)), TuplesKt.to(Double.valueOf(0.1), Double.valueOf(2.6E-4)), TuplesKt.to(Double.valueOf(0.2), Double.valueOf(8.6E-4)), TuplesKt.to(Double.valueOf(0.3), Double.valueOf(0.00155)), TuplesKt.to(Double.valueOf(0.4), Double.valueOf(0.0019)), TuplesKt.to(Double.valueOf(0.5), Double.valueOf(0.0025)), TuplesKt.to(valueOf, Double.valueOf(0.0034)), TuplesKt.to(Double.valueOf(0.7), Double.valueOf(0.00632)), TuplesKt.to(Double.valueOf(0.8), Double.valueOf(0.012)), TuplesKt.to(valueOf2, Double.valueOf(0.026)), TuplesKt.to(valueOf3, Double.valueOf(0.0367)), TuplesKt.to(Double.valueOf(1.1), Double.valueOf(0.06127)), TuplesKt.to(Double.valueOf(1.2), Double.valueOf(0.14)), TuplesKt.to(Double.valueOf(1.3), Double.valueOf(0.204)), TuplesKt.to(Double.valueOf(1.4), Double.valueOf(0.38)), TuplesKt.to(Double.valueOf(1.5), valueOf), TuplesKt.to(Double.valueOf(1.6), valueOf2), TuplesKt.to(Double.valueOf(1.7), valueOf3), TuplesKt.to(Double.valueOf(1.8), valueOf3));
        let d: number = currentAge;
        let d2: number = lifeExpectancy;
        Double.isNaN(d);
        Double.isNaN(d2);
        let d3: number = mapOf.get(Double.valueOf(Math.min(ExtensionsKt.round(d / d2, 1), 1.8)));
        let doubleValue: number = (d3 != null) ? d3.doubleValue() : 1.0;
        let d4: number = 1;
        Double.isNaN(d4);
        let weeksPerYear: number = Constants.Time.INSTANCE.getWeeksPerYear();
        Double.isNaN(weeksPerYear);
        let pow: number = Math.pow(d4 - doubleValue, 1.0 / weeksPerYear);
        Double.isNaN(d4);
        return d4 - pow;
    }
        }
    }
    export class Animation {
        static INSTANCE: any;
        static animatingSteps: number;
        static animationDuration: number;
    }
    export namespace Animation {
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
            getAnimatingSteps(): number {
        return Constants.Animation.animatingSteps;
    }
            getAnimationDuration(): number {
        return Constants.Animation.animationDuration;
    }
        }
    }
    export class Skill {
        static INSTANCE: any;
        static financialLiteracyInterestIncrease: number;
    }
    export namespace Skill {
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
            getFinancialLiteracyInterestIncrease(): number {
        return Constants.Skill.financialLiteracyInterestIncrease;
    }
        }
    }
    export class Intent {
        static INSTANCE: any;
        static popModal: any;
        static reloadGenericList: any;
    }
    export namespace Intent {
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
            getPopModal(): any {
        return Constants.Intent.popModal;
    }
            getReloadGenericList(): any {
        return Constants.Intent.reloadGenericList;
    }
            getInstagramProfileDeepLink(): any {
        let intent = new rt_Intent("android.intent.action.VIEW", Uri.parse("http://instagram.com/_u/lifesimulatorapp"));
        intent.setPackage("com.instagram.android");
        intent.addFlags(268435456);
        return intent;
    }
        }
    }
    export class Money {
        static INSTANCE: any;
        static baseInterestRate: number;
        static baseLoanInterestRate: number;
        static lotteryTicketPrice: number;
    }
    export namespace Money {
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
            getBaseInterestRate(): number {
        return Constants.Money.baseInterestRate;
    }
            getBaseLoanInterestRate(): number {
        return Constants.Money.baseLoanInterestRate;
    }
            getLotteryTicketPrice(): number {
        return Constants.Money.lotteryTicketPrice;
    }
        }
    }
    export class Test {
        static INSTANCE: any;
        static fakeProductID: string;
        static testAdMobAdID: string;
    }
    export namespace Test {
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
            getFakeProductID(): string {
        return Constants.Test.fakeProductID;
    }
            getTestAdMobAdID(): string {
        return Constants.Test.testAdMobAdID;
    }
        }
    }
    export class File {
        static INSTANCE: any;
        static saveFileName: string;
    }
    export namespace File {
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
            getSaveFileName(): string {
        return Constants.File.saveFileName;
    }
        }
    }
    export class Ad {
        static INSTANCE: any;
        static admobAdUnitID: string;
        static frequencyToPromptIncomeReward: number;
    }
    export namespace Ad {
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
            getAdmobAdUnitID(): string {
        return Constants.Ad.admobAdUnitID;
    }
            getFrequencyToPromptIncomeReward(): number {
        return Constants.Ad.frequencyToPromptIncomeReward;
    }
        }
    }
    export class ViewModel {
        static INSTANCE: any;
        static tombstoneModeDeath: string;
        static tombstoneModeView: string;
        static defaultFontSize: number;
    }
    export namespace ViewModel {
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
            getTombstoneModeDeath(): string {
        return Constants.ViewModel.tombstoneModeDeath;
    }
            getTombstoneModeView(): string {
        return Constants.ViewModel.tombstoneModeView;
    }
            getDefaultFontSize(): number {
        return Constants.ViewModel.defaultFontSize;
    }
        }
    }
    export class RemoteNotificationKey {
        static INSTANCE: any;
        static usage: string;
        static rewardAmount: string;
        static rewardType: string;
        static notificationTitle: string;
        static notificationBody: string;
    }
    export namespace RemoteNotificationKey {
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
            getUsage(): string {
        return Constants.RemoteNotificationKey.usage;
    }
            getRewardAmount(): string {
        return Constants.RemoteNotificationKey.rewardAmount;
    }
            getRewardType(): string {
        return Constants.RemoteNotificationKey.rewardType;
    }
            getNotificationTitle(): string {
        return Constants.RemoteNotificationKey.notificationTitle;
    }
            getNotificationBody(): string {
        return Constants.RemoteNotificationKey.notificationBody;
    }
        }
    }
    export class RandomEvent {
        static INSTANCE: any;
        static stockCrashPercent: number;
        static resetValueConstant: number;
    }
    export namespace RandomEvent {
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
            getStockCrashPercent(): number {
        return Constants.RandomEvent.stockCrashPercent;
    }
            getResetValueConstant(): number {
        return Constants.RandomEvent.resetValueConstant;
    }
        }
        export class Probability {
            static INSTANCE: any;
            static work: number;
            static leisure: number;
            static school: number;
            static loveSingle: number;
            static loveRelationship: number;
            static parentAction: number;
            static sideHustle: number;
            static sports: number;
            static health: number;
            static birthDiseaseRate: number;
        }
        export namespace Probability {
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
                getWork(): number {
        return Constants.RandomEvent.Probability.work;
    }
                getLeisure(): number {
        return Constants.RandomEvent.Probability.leisure;
    }
                getSchool(): number {
        return Constants.RandomEvent.Probability.school;
    }
                getLoveSingle(): number {
        return Constants.RandomEvent.Probability.loveSingle;
    }
                getLoveRelationship(): number {
        return Constants.RandomEvent.Probability.loveRelationship;
    }
                getParentAction(): number {
        return Constants.RandomEvent.Probability.parentAction;
    }
                getSideHustle(): number {
        return Constants.RandomEvent.Probability.sideHustle;
    }
                getSports(): number {
        return Constants.RandomEvent.Probability.sports;
    }
                getHealth(): number {
        return Constants.RandomEvent.Probability.health;
    }
                getBirthDiseaseRate(): number {
        return Constants.RandomEvent.Probability.birthDiseaseRate;
    }
            }
        }
    }
    export class Notifications {
        static INSTANCE: any;
        static DAILY_REMINDER_REQUEST_CODE: number;
    }
    export namespace Notifications {
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
            getDAILY_REMINDER_REQUEST_CODE(): number {
        return Constants.Notifications.DAILY_REMINDER_REQUEST_CODE;
    }
        }
    }
    export class Business {
        static INSTANCE: any;
        static maxLevel: number;
        static defaultBusinessMorale: number;
    }
    export namespace Business {
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
            getMaxLevel(): number {
        return Constants.Business.maxLevel;
    }
            getDefaultBusinessMorale(): number {
        return Constants.Business.defaultBusinessMorale;
    }
        }
    }
}
Constants.Attribute.INSTANCE = new Constants.Attribute.Companion(null);
Constants.Attribute.maxAttributeValue = 100.0;
Constants.Time.INSTANCE = new Constants.Time.Companion(null);
Constants.Time.weeksPerMonth = 4;
Constants.Time.monthsPerYear = 12;
Constants.Time.weeksPerYear = Constants.Time.weeksPerMonth * Constants.Time.monthsPerYear;
Constants.Time.workYearLengthWeeks = 40;
Constants.Time.pregnancyTimeInWeeks = 40;
Constants.Time.retirementAge = 65;
Constants.Time.pregnancyAgeRange = new ValueRange(16.0, 55.0);
Constants.Time.maxBackgroundIncomeRewardInDays = 5;
Constants.Time.incomeMultiplePerBackgroundMinute = 0.05;
Constants.App.INSTANCE = new Constants.App.Companion(null);
Constants.App.shareGameLink = "https://lifesimulatorapp.page.link/install";
Constants.App.twitterLink = "https://twitter.com/LifeSimulator3";
Constants.App.instagramLink = "https://www.instagram.com/lifesimulatorapp";
Constants.App.redditLink = "https://www.reddit.com/r/lifesimulatorapp";
Constants.App.discordLink = "https://discord.gg/P9pryG7";
Constants.App.appLink = "http://play.google.com/store/apps/details?id=com.mindvacation.lifesimulator";
Constants.App.saveGameEveryXWeeks = 10;
Constants.Person.INSTANCE = new Constants.Person.Companion(null);
Constants.Person.minAgeInYears = 8;
Constants.Person.personLifeExpectancy = 70;
Constants.Person.weeksTillZeroAttributeDeath = 6;
Constants.Animation.INSTANCE = new Constants.Animation.Companion(null);
Constants.Animation.animatingSteps = 30;
Constants.Animation.animationDuration = 0.6;
Constants.Skill.INSTANCE = new Constants.Skill.Companion(null);
Constants.Skill.financialLiteracyInterestIncrease = 1;
Constants.Intent.INSTANCE = new Constants.Intent.Companion(null);
Constants.Intent.popModal = new rt_Intent("popModal");
Constants.Intent.reloadGenericList = new rt_Intent("reloadGenericList");
Constants.Money.INSTANCE = new Constants.Money.Companion(null);
Constants.Money.baseInterestRate = 5.0;
Constants.Money.baseLoanInterestRate = 10.0;
Constants.Money.lotteryTicketPrice = 10;
Constants.Test.INSTANCE = new Constants.Test.Companion(null);
Constants.Test.fakeProductID = "android.test.purchased";
Constants.Test.testAdMobAdID = "ca-app-pub-3940256099942544/5224354917";
Constants.File.INSTANCE = new Constants.File.Companion(null);
Constants.File.saveFileName = "saveFile.txt";
Constants.Ad.INSTANCE = new Constants.Ad.Companion(null);
Constants.Ad.admobAdUnitID = "ca-app-pub-6013626570117920/2093015339";
Constants.Ad.frequencyToPromptIncomeReward = Constants.Time.INSTANCE.getWeeksPerYear() * 3;
Constants.ViewModel.INSTANCE = new Constants.ViewModel.Companion(null);
Constants.ViewModel.tombstoneModeDeath = "OnDeath";
Constants.ViewModel.tombstoneModeView = "OnView";
Constants.ViewModel.defaultFontSize = 16;
Constants.RemoteNotificationKey.INSTANCE = new Constants.RemoteNotificationKey.Companion(null);
Constants.RemoteNotificationKey.usage = "usage";
Constants.RemoteNotificationKey.rewardAmount = "amount";
Constants.RemoteNotificationKey.rewardType = "type";
Constants.RemoteNotificationKey.notificationTitle = "title";
Constants.RemoteNotificationKey.notificationBody = "body";
Constants.RandomEvent.INSTANCE = new Constants.RandomEvent.Companion(null);
Constants.RandomEvent.stockCrashPercent = 0.1;
Constants.RandomEvent.resetValueConstant = -999;
Constants.RandomEvent.Probability.INSTANCE = new Constants.RandomEvent.Probability.Companion(null);
Constants.RandomEvent.Probability.work = 0.08;
Constants.RandomEvent.Probability.leisure = 0.12;
Constants.RandomEvent.Probability.school = 0.1;
Constants.RandomEvent.Probability.loveSingle = 0.33;
Constants.RandomEvent.Probability.loveRelationship = 0.12;
Constants.RandomEvent.Probability.parentAction = 0.15;
Constants.RandomEvent.Probability.sideHustle = 0.08;
Constants.RandomEvent.Probability.sports = 0.1;
Constants.RandomEvent.Probability.health = 0.1;
Constants.RandomEvent.Probability.birthDiseaseRate = 0.15;
Constants.Notifications.INSTANCE = new Constants.Notifications.Companion(null);
Constants.Notifications.DAILY_REMINDER_REQUEST_CODE = 5923;
Constants.Business.INSTANCE = new Constants.Business.Companion(null);
Constants.Business.maxLevel = 12;
Constants.Business.defaultBusinessMorale = 200;
