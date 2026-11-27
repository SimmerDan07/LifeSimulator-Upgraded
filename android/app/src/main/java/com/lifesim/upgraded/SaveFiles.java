package com.lifesim.upgraded;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.JavascriptInterface;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import androidx.core.content.FileProvider;
import java.nio.charset.StandardCharsets;

/**
 * The game's save storage on Android, the same as on Windows (window.lifesimFS in the game): plain files in the
 * app's own storage (…/files/Saves), written safely (to a .tmp file first, the previous save kept as .bak).
 * Files instead of the WebView's localStorage, which is capped at a few MB — too small for very long saves.
 */
public class SaveFiles {
    private static final String TAG = "LifeSimSaves";
    private final File dir;
    private final Context context;

    public SaveFiles(Context context) {
        this.context = context;
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

    /**
     * v0.36.0: Back Up Your Save on Android. On Android 10 and newer the backup goes into the phone's Download
     * folder (Download/Life Simulator), where the Files app finds it and it survives uninstalling the game.
     * Older Android versions get the share sheet instead (save to Drive, email it, …).
     * Returns "downloads", "shared" or "failed".
     */
    @JavascriptInterface
    public String backUp(String name, String text) {
        String file = safe(name);
        byte[] bytes = (text == null ? "" : text).getBytes(StandardCharsets.UTF_8);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                ContentResolver cr = context.getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, file);
                v.put(MediaStore.MediaColumns.MIME_TYPE, "text/plain");
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Life Simulator");
                v.put(MediaStore.MediaColumns.IS_PENDING, 1);
                Uri uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri != null) {
                    try (OutputStream out = cr.openOutputStream(uri)) {
                        if (out == null) throw new java.io.IOException("no stream");
                        out.write(bytes);
                    }
                    ContentValues done = new ContentValues();
                    done.put(MediaStore.MediaColumns.IS_PENDING, 0);
                    cr.update(uri, done, null, null);
                    return "downloads";
                }
            } catch (Exception e) {
                Log.e(TAG, "backup to Downloads failed, trying the share sheet", e);
            }
        }
        try {
            File out = new File(new File(context.getCacheDir(), "backups"), file);
            if (!out.getParentFile().isDirectory()) out.getParentFile().mkdirs();
            try (FileOutputStream o = new FileOutputStream(out)) { o.write(bytes); }
            Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", out);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_SUBJECT, file);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(send, "Back up your save");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            context.startActivity(chooser);
            return "shared";
        } catch (Exception e) {
            Log.e(TAG, "backup failed", e);
            return "failed";
        }
    }

    /** v0.36.0: open a web page (the new-version notice's download link) in the phone's browser. */
    @JavascriptInterface
    public boolean openUrl(String url) {
        if (url == null || !url.startsWith("https://")) return false;
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(i);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "openUrl failed", e);
            return false;
        }
    }
}
