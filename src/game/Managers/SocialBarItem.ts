// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intent, JEnum, NoWhenBranchMatchedException, R, Uri } from "../runtime";
import { Constants } from "../Utils/Constants";
import { MainApplication } from "../ui/bridge";
import { Utils } from "../Utils/Utils";

export class SocialBarItem extends JEnum {
    static readonly instagram: SocialBarItem = new SocialBarItem("instagram", 0);
    static readonly twitter: SocialBarItem = new SocialBarItem("twitter", 1);
    static readonly reddit: SocialBarItem = new SocialBarItem("reddit", 2);
    static readonly discord: SocialBarItem = new SocialBarItem("discord", 3);
    static readonly rateGame: SocialBarItem = new SocialBarItem("rateGame", 4);
    static readonly share: SocialBarItem = new SocialBarItem("share", 5);
    static values(): SocialBarItem[] { return [SocialBarItem.instagram, SocialBarItem.twitter, SocialBarItem.reddit, SocialBarItem.discord, SocialBarItem.rateGame, SocialBarItem.share]; }
    static valueOf(n: string): SocialBarItem { return (SocialBarItem as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getDescription(): string {
        switch (this) {
            case SocialBarItem.instagram:
                return Utils.INSTANCE.getString(R.string.Social_Instagram);
            case SocialBarItem.twitter:
                return Utils.INSTANCE.getString(R.string.Social_Twitter);
            case SocialBarItem.reddit:
                return Utils.INSTANCE.getString(R.string.Social_Reddit);
            case SocialBarItem.discord:
                return Utils.INSTANCE.getString(R.string.Social_Discord);
            case SocialBarItem.rateGame:
                return Utils.INSTANCE.getString(R.string.Social_Rate);
            case SocialBarItem.share:
                return Utils.INSTANCE.getString(R.string.Social_Share);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case SocialBarItem.instagram:
                return R.drawable.hud_menu_instagram;
            case SocialBarItem.twitter:
                return R.drawable.menu_twitter;
            case SocialBarItem.reddit:
                return R.drawable.menu_reddit;
            case SocialBarItem.discord:
                return R.drawable.menu_discord;
            case SocialBarItem.rateGame:
                return R.drawable.menu_rate;
            case SocialBarItem.share:
                return R.drawable.menu_share;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getIntent(): Intent {
        switch (this) {
            case SocialBarItem.instagram:
                let instagramProfileDeepLink: Intent = Constants.Intent.INSTANCE.getInstagramProfileDeepLink();
                return Utils.IntentUtils.INSTANCE.isIntentAvailable(MainApplication.INSTANCE.applicationContext(), instagramProfileDeepLink) ? instagramProfileDeepLink : Utils.IntentUtils.INSTANCE.getOpenURLIntent(Constants.App.INSTANCE.getInstagramLink());
            case SocialBarItem.twitter:
                return Utils.IntentUtils.INSTANCE.getOpenURLIntent(Constants.App.INSTANCE.getTwitterLink());
            case SocialBarItem.reddit:
                return Utils.IntentUtils.INSTANCE.getOpenURLIntent(Constants.App.INSTANCE.getRedditLink());
            case SocialBarItem.discord:
                return Utils.IntentUtils.INSTANCE.getOpenURLIntent(Constants.App.INSTANCE.getDiscordLink());
            case SocialBarItem.rateGame:
                let intent: Intent = new Intent("android.intent.action.VIEW", Uri.parse("market://details?id=" + MainApplication.INSTANCE.applicationContext().getPackageName()));
                intent.addFlags(1476919296);
                return Utils.IntentUtils.INSTANCE.isIntentAvailable(MainApplication.INSTANCE.applicationContext(), intent) ? intent : Utils.IntentUtils.INSTANCE.getOpenURLIntent(Constants.App.INSTANCE.getAppLink());
            case SocialBarItem.share:
                return Utils.IntentUtils.INSTANCE.getShareAppIntent();
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
