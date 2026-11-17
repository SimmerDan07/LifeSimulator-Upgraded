//@@ +imports
import { Collections } from "../runtime";
//@@ SideHustleState.SingleSideHustleState.getProject
/** Ported from Vineflower output (jadx could not decompile it). */
getProject(effort: SideHustle.ProjectEffort): SideHustleState.SideHustleProject {
    const outcomes = effort.getPossibleQualityOutcomes();
    const boost = effort.getQualityProbabilityBoost() * this.getSkillLevel().getSkillQualityProbabilityBoost();
    const pool: Pair<any, number>[] = outcomes.map((q) => new Pair<any, number>(q, q.getRelativeProbability()));
    if (pool.length > 2) {
        pool[1] = new Pair(pool[1].getFirst(), pool[1].getSecond() * boost);
        pool[2] = new Pair(pool[2].getFirst(), pool[2].getSecond() * boost);
    }
    const quality = CollectionsKt.first(Utils.Random.INSTANCE.chooseFromPoolWithProbability(pool, 1)) as SideHustle.ProjectQuality;
    const names = quality.projectName(this.type);
    Collections.shuffle(names);
    const existing = this.projects.map((p) => p.getName());
    let name = "";
    let n = 1;
    while (name.length === 0) {
        let candidate = "";
        for (const possible of names) {
            const c = n >= 2 ? possible + " " + n : possible;
            if (!existing.includes(c)) { candidate = c; break; }
        }
        if (names.length === 0) candidate = "Project " + n;
        n++;
        name = candidate;
    }
    return new SideHustleState.SideHustleProject(this.type, quality, name, effort.progressRequirement(this.type), 0, 16, null);
}
