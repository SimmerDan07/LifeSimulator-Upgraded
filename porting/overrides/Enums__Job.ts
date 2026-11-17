//@@ +imports
import { ValueRange } from "../Utils/ValueRange";
import { Trait } from "./Trait";
import { Perk } from "./Perk";
import { Possession } from "./Possession";
//@@ Job.pay
/** Reconstructed from bytecode (jadx/Vineflower could not fully decompile it). */
pay(level: number): ValueRange {
    const personState = GameStateManager.INSTANCE.getPersonState();
    const W = (n: number) => ValueRange.INSTANCE.getWithInt(n);
    const R = (a: number, b: number) => new ValueRange(a, b);
    let table: ValueRange[];
    let careerTrait: Trait | null = null;
    switch (this) {
        case Job.panHandler: table = [W(200)]; break;
        case Job.burgerFlipper: table = [W(400)]; break;
        case Job.dataEntry: table = [W(500), W(600)]; break;
        case Job.uber: {
            const carLevel = personState.getItemState().getState(Possession.car).getLevel();
            let d = 500.0;
            if (carLevel > 1) d = 500.0 * ((carLevel - 1) * 0.5 + 1.0);
            table = [ValueRange.INSTANCE.getWithValue(d)];
            break;
        }
        case Job.music: table = [R(0, 400), R(200, 800), W(800), W(1200), R(400, 2000), R(1000, 4000), R(3000, 8000)]; break;
        case Job.business: table = [W(600), W(800), W(1200), W(2000), W(3000), W(5000), W(8000)]; careerTrait = Trait.confident; break;
        case Job.medical: table = [W(600), W(800), W(3000), W(4000), W(6000)]; break;
        case Job.finance: table = [W(700), W(1000), W(1400), R(800, 2000), W(2500), W(4000), W(7500)]; break;
        case Job.research: table = [W(500), W(750), W(1200), W(2000), W(4000), W(6000), W(8000), W(10000)]; careerTrait = Trait.logical; break;
        case Job.programmer: table = [W(800), W(1000), W(1500), W(2000), W(3000), W(5000), W(7000)]; break;
        case Job.teacher: table = [W(600), W(800), W(1000), W(1800), W(3000), W(4500)]; break;
        case Job.police: table = [W(500), W(800), W(1000), W(1500), W(2000), W(2500), W(3000), W(4000)]; break;
        case Job.army: table = [W(700), W(1000), W(1200), W(1500), W(2000), W(3000), W(4000), W(5000)]; break;
        case Job.lawyer: table = [W(1000), W(1500), W(3000), W(5000), W(8000)]; break;
        case Job.barista: table = [W(350)]; break;
        case Job.sushiChef: table = [W(350), W(450)]; break;
        case Job.animeArtist: table = [W(500), W(700), W(1000), W(2000), W(4000)]; break;
        case Job.pastryChef: table = [W(400)]; break;
        case Job.tourGuide: table = [W(350)]; break;
        case Job.sommelier: table = [W(450), W(1000)]; break;
        case Job.royalGuard: table = [W(500), W(800)]; break;
        case Job.constructionWorker: table = [W(600)]; break;
        case Job.artist: table = [W(350), W(600), W(1000), W(1500), W(2500), W(4000), W(7000)]; break;
        case Job.actor:
            table = [ValueRange.INSTANCE.getWithIntRange(0, 1000), W(400), W(800), W(1200), W(2000), W(2500), W(5000),
                ValueRange.INSTANCE.getWithIntRange(5000, 15000), ValueRange.INSTANCE.getWithIntRange(10000, 20000)];
            careerTrait = Trait.entertainer;
            break;
        default: throw new NoWhenBranchMatchedException();
    }
    let vr = table[level - 1];
    if (careerTrait != null && personState.getTraitState().hasTrait(careerTrait)) {
        const b = Trait.INSTANCE.getChooseCareerIncomeBoost();
        vr = new ValueRange(vr.getMin() * b, vr.getMax() * b);
    }
    if (personState.getMiscState().isAdDoubleIncomeRewardActive()) {
        vr = new ValueRange(vr.getMin() * 2, vr.getMax() * 2);
    }
    if (personState.getPerkState().hasPerk(Perk.diligent)) {
        const b = Perk.INSTANCE.getDiligentEarningBoost();
        vr = new ValueRange(vr.getMin() * b, vr.getMax() * b);
    }
    return vr;
}
