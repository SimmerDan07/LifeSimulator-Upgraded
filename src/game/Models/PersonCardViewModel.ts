// Love tab remodel: the relationship card from the user's concept — avatar head, "Daughter - Marcene Larson",
// "Age: 46", and a coloured bar printed "906/1000". Also used, larger, as the header of the person screen.
import { BaseViewModel } from "./BaseViewModel";

export class PersonCardViewModel extends BaseViewModel {
    constructor(
        public id: string,
        public imageId: any,
        /** Bold part, e.g. "Daughter". */
        public relation: string,
        public name: string,
        /** e.g. "Age: 46 (true age 56)" or "Deceased". */
        public ageText: string,
        /** 0–1000, or null for no bar (unborn baby). */
        public score: number | null,
        public maxScore: number,
        /** distant | lacking | good | close | besties */
        public status: string,
        /** Status word, e.g. "Close". Shown on the large card. */
        public statusTitle: string,
        public badges: string[] = [],
        public onClick: { invoke: () => any } | null = null,
        public large = false,
        public greyed = false,
        /** Extra line under the age (large card): mood etc. */
        public note: string | null = null,
    ) {
        super();
        this.identifier = "PersonCard." + id;
    }
}

/** A small label inside a group ("In memory", "Find Love"). */
export class SubHeaderViewModel extends BaseViewModel {
    constructor(public title: string) { super(); this.identifier = "SubHeader." + title; }
}

/** A labelled 0–max meter (Lifepaths: Thirst, Suspicion). */
export class MeterViewModel extends BaseViewModel {
    constructor(public title: string, public value: number, public max: number, public tone: string, public note: string | null = null) {
        super();
        this.identifier = "Meter." + title;
    }
}
