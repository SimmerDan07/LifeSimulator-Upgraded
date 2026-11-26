package com.lifesim.upgraded;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * Life Simulator (Upgraded) for Android phones and tablets: the same game as the Windows build, in a WebView.
 * - Saves are files in the app's storage (SaveFiles / SaveFilesPlugin), like the Windows Saves folder.
 * - Full screen (system bars come back with a swipe).
 * - The Android back button works like the game's back arrow; on the main screen it sends the app to the
 *   background instead of closing it.
 * - The game is saved whenever the app goes to the background.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(SaveFilesPlugin.class);   // before super.onCreate: the game's save storage must exist when it loads
        super.onCreate(savedInstanceState);
        goFullScreen();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView web = getBridge() != null ? getBridge().getWebView() : null;
                if (web == null) {
                    moveTaskToBack(true);
                    return;
                }
                web.evaluateJavascript("(window.__lifesimBack && window.__lifesimBack()) ? 'handled' : 'exit'", result -> {
                    if (result == null || !result.contains("handled")) moveTaskToBack(true);
                });
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) goFullScreen();
    }

    @Override
    public void onPause() {
        // also covers the app being swiped away from Recents: it always pauses first
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web != null) web.evaluateJavascript("window.__lifesimAway && window.__lifesimAway(true); window.__lifesimSave && window.__lifesimSave()", null);
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        // the music stopped when you left the game; start it again
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web != null) web.evaluateJavascript("window.__lifesimAway && window.__lifesimAway(false)", null);
    }

    private void goFullScreen() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
