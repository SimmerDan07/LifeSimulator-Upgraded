// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class MainGameTab extends JEnum {
    static readonly Profile: MainGameTab = new MainGameTab("Profile", 0);
    static readonly Leisure: MainGameTab = new MainGameTab("Leisure", 1);
    static readonly Love: MainGameTab = new MainGameTab("Love", 2);
    static readonly Education: MainGameTab = new MainGameTab("Education", 3);
    static readonly Work: MainGameTab = new MainGameTab("Work", 4);
    static readonly Health: MainGameTab = new MainGameTab("Health", 5);
    static readonly Bank: MainGameTab = new MainGameTab("Bank", 6);
    static readonly Lifepaths: MainGameTab = new MainGameTab("Lifepaths", 7);
    static values(): MainGameTab[] { return [MainGameTab.Profile, MainGameTab.Leisure, MainGameTab.Love, MainGameTab.Education, MainGameTab.Work, MainGameTab.Health, MainGameTab.Bank, MainGameTab.Lifepaths]; }
    static valueOf(n: string): MainGameTab { return (MainGameTab as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
