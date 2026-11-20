package com.lifesim.upgraded;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * The game's save storage on Android, the same as on Windows (window.lifesimFS in the game): plain files in the
 * app's own storage (…/files/Saves), written safely (to a .tmp file first, the previous save kept as .bak).
 * Files instead of the WebView's localStorage, which is capped at a few MB — too small for very long saves.
 */
public class SaveFiles {
    private static final String TAG = "LifeSimSaves";
    private final File dir;

    public SaveFiles(Context context) {
        dir = new File(context.getFilesDir(), "Saves");
    }

    private static String safe(String name) {
        String s = name == null ? "save.txt" : name.replaceAll("[^A-Za-z0-9._-]", "_");
        return s.isEmpty() || s.startsWith(".") ? "save.txt" : s;
    }

    @JavascriptInterface
    public String read(String name) {
        File f = new File(dir, safe(name));
        if (!f.isFile()) return null;
        try (InputStream in = new FileInputStream(f)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream((int) Math.max(1024, f.length()));
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            Log.e(TAG, "read failed: " + name, e);
            return null;
        }
    }

    @JavascriptInterface
    public boolean write(String name, String text) {
        try {
            if (!dir.isDirectory() && !dir.mkdirs()) return false;
            File f = new File(dir, safe(name));
            File tmp = new File(dir, safe(name) + ".tmp");
            try (FileOutputStream out = new FileOutputStream(tmp)) {
                out.write((text == null ? "" : text).getBytes(StandardCharsets.UTF_8));
                out.getFD().sync();
            }
            if (f.isFile()) {
                File bak = new File(dir, safe(name) + ".bak");
                if (bak.exists()) bak.delete();
                f.renameTo(bak);
            }
            if (!tmp.renameTo(f)) return false;
            return true;
        } catch (Exception e) {
            Log.e(TAG, "write failed: " + name, e);
            return false;
        }
    }

    @JavascriptInterface
    public String dir() {
        return dir.getAbsolutePath();
    }
}
