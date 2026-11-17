# Small text fixes for spots where the decompilers lost a variable name.
import sys, os
root = sys.argv[1]
P = [
 ("Enums/Housing.java", "return !Intrinsics.areEqual(purchasePrice, r1);", "return !Intrinsics.areEqual(purchasePrice, BigInteger.valueOf(0));"),
 ("Enums/PersonInteraction.java", "BigInteger.valueOf(r0.getTreatCost())", "BigInteger.valueOf(((Person) metadata).getPetType().getTreatCost())"),
 ("Models/SliderViewModel.java", "return r0.length - 1;", "return this.segments.length - 1;"),
 ("Enums/RandomEvent.java", "int i;\n        EventChoice[] choices = getChoices();", "Object i;\n        EventChoice[] choices = getChoices();"),
 ("Managers/BusinessState.java", "Intrinsics.areEqual(totalProfit, r10)", "Intrinsics.areEqual(totalProfit, BigInteger.valueOf(0))"),
 ("Controllers/GenericListModelGenerator.java", "for (Iterator<Player> it3 = r0.iterator(); it3.hasNext(); it3 = it3) {",
  "for (Iterator<Player> it3 = GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().getPastLives().iterator(); it3.hasNext(); ) {"),
]
for f, a, b in P:
    p = os.path.join(root, f); s = open(p).read()
    if a not in s: print("PATCH NOT APPLIED:", f, a[:60]); continue
    open(p, "w").write(s.replace(a, b))
print("patches done")
