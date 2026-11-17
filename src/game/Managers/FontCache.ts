export class FontCache {
    static INSTANCE: FontCache;
    static FA_FONT_SOLID = "fa_solid";
    static get(_c: any, name: string) { return name; }
    getFont(id: any) { return id; }
}
FontCache.INSTANCE = new FontCache();
