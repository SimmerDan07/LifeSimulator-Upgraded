// One property (or a bulk block of identical units bought through the classic Housing screen).
// Plain data + small helpers; the portfolio does the simulation. Saved as-is by SaveCodec.
import { PROPERTY_TYPES, NEIGHBORHOODS, COUNTRIES, RENOVATIONS, PROBLEMS, DEFAULT_COUNTRY, TypeInfo } from "./RealEstateConfig";

export type PropertyUse = "residence" | "rental" | "vacant" | "family";

export interface HistoryEntry { clock: number; text: string }
export interface Problem { type: string; weeks: number }
export interface Mortgage { original: number; balance: number; rate: number; payment: number }
export interface Tenant { name: string; weeksLeft: number }

export class OwnedProperty {
    id = "";
    /** Key into PROPERTY_TYPES (same as the Housing enum name). */
    type = "house";
    /** >1 only for bulk blocks bought through the classic "Purchase Max" buttons. */
    units = 1;
    name = "";
    city = "";
    country = DEFAULT_COUNTRY;
    neighborhood = "suburbs";
    /** Per-property price variation (lot size, views…), 0.85–1.15. */
    quality = 1;
    /** 0–100. */
    condition = 85;
    renovations: Record<string, number> = {};
    problems: Problem[] = [];
    upkeep = "standard";
    use: PropertyUse = "vacant";
    /** Ids of family members living here when use === "family". */
    occupants: string[] = [];
    tenant: Tenant | null = null;
    /** Multi-unit buildings: share of units let (0–1). */
    occupancy = 0;
    mortgage: Mortgage | null = null;
    purchasePrice = 0;
    purchasedAt = 0;
    purchasedBy = "";
    purchasedAtAge = 0;
    /** Market listings only: asking price. */
    askingPrice = 0;
    history: HistoryEntry[] = [];
    /** Rented homes only: weekly rent you pay, and who you rent from. */
    leaseRent?: number;
    landlord?: string;

    info(): TypeInfo { return PROPERTY_TYPES[this.type]; }
    typeLabel(): string { return this.info()?.label ?? this.type; }
    neighborhoodLabel(): string { return NEIGHBORHOODS[this.neighborhood]?.label ?? this.neighborhood; }
    countryInfo() { return COUNTRIES[this.country] ?? COUNTRIES[DEFAULT_COUNTRY]; }
    isResidential(): boolean { return this.info().category === "Residential"; }
    isBlock(): boolean { return this.units > 1; }
    address(): string { return this.city ? `${this.name}, ${this.city}` : this.name; }
    displayName(): string { return this.isBlock() ? `${this.units} × ${this.typeLabel()} (portfolio)` : this.name; }

    renovationBonus(): number {
        let b = 0;
        for (const [cat, lvl] of Object.entries(this.renovations)) {
            const r = RENOVATIONS[cat];
            if (!r) continue;
            for (let i = 0; i < Math.min(lvl, r.value.length); i++) b += r.value[i];
        }
        return b;
    }
    /** Weekly happiness the renovations give to whoever lives here. */
    comfort(): number {
        let c = 0;
        for (const [cat, lvl] of Object.entries(this.renovations)) c += (RENOVATIONS[cat]?.comfort ?? 0) * lvl;
        return c;
    }
    problemLabels(): string[] { return this.problems.map((p) => PROBLEMS[p.type]?.label ?? p.type); }
    log(clock: number, text: string) { this.history.push({ clock, text }); if (this.history.length > 60) this.history.splice(0, this.history.length - 60); }
}

/** Value of condition relative to a typical (85) property. */
export function conditionFactor(c: number): number { return (0.6 + 0.45 * c / 100) / 0.9825; }
export function conditionLabel(c: number): string {
    return c >= 90 ? "Excellent" : c >= 75 ? "Good" : c >= 55 ? "Fair" : c >= 35 ? "Poor" : "Dilapidated";
}
