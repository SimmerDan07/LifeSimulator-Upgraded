// Analytics were Firebase on Android; on desktop we just keep a local debug log.
export class TelemetryManager {
    static INSTANCE: TelemetryManager;
    logEvent(name: string, _params: any): void { if ((globalThis as any).LIFESIM_DEBUG) console.debug("[telemetry]", name); }
    static logEvent$default(t: TelemetryManager, name: string, params: any, _m: number, _o: any) { t.logEvent(name, params); }
}
TelemetryManager.INSTANCE = new TelemetryManager();
