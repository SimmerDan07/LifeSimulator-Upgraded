//@@ +imports
import { Perk } from "./Perk";
//@@ BenefitLevel.getWeeklyRelationshipModifier
/** Reconstructed from bytecode. */
getWeeklyRelationshipModifier(): number {
    let v = 0;
    if (this === BenefitLevel.minimum) v = -2;
    else if (this === BenefitLevel.low) v = 0;
    else if (this === BenefitLevel.medium) v = 1;
    else if (this === BenefitLevel.high) v = 2;
    if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.goodParenting)) {
        v += JMath.toInt(Perk.INSTANCE.getGoodParentingChildSupportBoost());
    }
    return v;
}
