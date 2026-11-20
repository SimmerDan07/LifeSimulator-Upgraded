package com.lifesim.upgraded;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Puts window.lifesimFS (SaveFiles) into the game's WebView. Capacitor loads plugins before it loads the game,
 * so the game finds its save storage from the very first frame.
 */
@CapacitorPlugin(name = "LifeSimSaves")
public class SaveFilesPlugin extends Plugin {
    @Override
    public void load() {
        getBridge().getWebView().addJavascriptInterface(new SaveFiles(getContext()), "lifesimFS");
    }
}
