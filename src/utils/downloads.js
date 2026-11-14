// src/utils/downloads.js
import JSZip from "jszip";
import { saveAs } from "file-saver";
import firebase from "firebase/app";

/**
 * Helper: Download blob via XMLHttpRequest
 * (More compatible with Firebase signed URLs)
 */
export function downloadBlobXHR(url) {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
        else reject(new Error("XHR status " + xhr.status));
      };
      xhr.onerror = () => reject(new Error("Network error for " + url));
      xhr.send();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Download a single file by URL (robust cross-browser).
 * - Fetch blob (respects CORS)
 * - Fallback to XHR blob if fetch fails
 * - Create object URL and click <a download> to force save
 * - Fallback to open in new tab as last resort
 */
export async function downloadImage(url, filename = "download") {
  // Extract file extension from URL or blob mime type
  const getExtFromUrl = (u) => {
    try {
      const path = new URL(u).pathname;
      const last = path.split("/").pop() || "";
      const match = last.match(/\.([a-z0-9]{1,6})(?:$|\?)/i);
      return match ? match[1] : "";
    } catch {
      return "";
    }
  };

  const ensureFilenameHasExt = (name, ext, mime) => {
    if (!ext && mime) {
      const map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
      };
      ext = map[mime] || "";
    }
    if (!ext) return name;
    if (name.toLowerCase().endsWith("." + ext.toLowerCase())) return name;
    return `${name}.${ext}`;
  };

  try {
    let blob = null;

    // Try fetch first
    try {
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("Fetch failed: " + resp.status);
      blob = await resp.blob();
    } catch (fetchErr) {
      // Fallback to XHR
      try {
        blob = await downloadBlobXHR(url);
      } catch (xhrErr) {
        console.warn("Fetch+XHR failed, opening in new tab", fetchErr, xhrErr);
        window.open(url, "_blank");
        return false;
      }
    }

    // Determine extension + final filename
    const extFromUrl = getExtFromUrl(url);
    const mime = blob.type || "";
    const finalName = ensureFilenameHasExt(filename, extFromUrl, mime);

    // Create an object URL and force download
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = objectUrl;
    a.setAttribute("download", finalName);
    a.setAttribute("rel", "noopener");
    document.body.appendChild(a);

    try {
      // dispatch MouseEvent (works better for Safari)
      a.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    } catch {
      a.click();
    }

    // Cleanup
    setTimeout(() => {
      try {
        URL.revokeObjectURL(objectUrl);
        document.body.removeChild(a);
      } catch {}
    }, 1500);

    return true;
  } catch (err) {
    console.error("downloadImage final fallback error:", err);
    try {
      window.open(url, "_blank");
    } catch {}
    return false;
  }
}

/**
 * Helper to limit concurrency (avoid fetching too many blobs at once)
 */
async function runWithConcurrency(tasks, concurrency = 4) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);

    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);

    if (executing.size >= concurrency) await Promise.race(executing);
  }

  return Promise.all(results);
}

/**
 * downloadUrlsAsZip
 * items: Array<{ url: string, filename?: string }>
 * options: { concurrency?: number, zipFilename?: string }
 */
export async function downloadUrlsAsZip(items = [], options = {}) {
  const CONCURRENCY = options.concurrency || 4;
  const zipFilename =
    options.zipFilename || `photos-selected-${Date.now()}.zip`;

  if (!items || items.length === 0) {
    throw new Error("No items provided to downloadUrlsAsZip");
  }

  // build fetch tasks for each item (returns { name, blob })
  const tasks = items.map((it) => async () => {
    const { url, filename: rawName } = it;
    // Try fetch first, then XHR fallback
    try {
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("Fetch failed: " + resp.status);
      const blob = await resp.blob();
      const name = rawName || new URL(url).pathname.split("/").pop() || "file";
      return { name, blob };
    } catch (fetchErr) {
      // fallback to XHR
      const blob = await downloadBlobXHR(url);
      const name = rawName || new URL(url).pathname.split("/").pop() || "file";
      return { name, blob };
    }
  });

  const fetched = await runWithConcurrency(tasks, CONCURRENCY);

  // create zip
  const zip = new JSZip();
  const folder = zip.folder("photos") || zip;
  for (const file of fetched) {
    const safeName = (file.name || "file").replace(/^\/+/, "");
    folder.file(safeName, file.blob);
  }

  const blobZip = await zip.generateAsync({ type: "blob" });
  saveAs(blobZip, zipFilename);
  return true;
}

/**
 * Download all files from a Firebase Storage folder as a ZIP
 * folderPath example: "gallery/<eventId>"
 */
export async function downloadFolderAsZip(folderPath, options = {}) {
  const CONCURRENCY = options.concurrency || 4;
  const zipFilename =
    options.zipFilename ||
    `${folderPath.replace(/\//g, "_") || "download"}.zip`;

  if (!firebase?.storage) {
    throw new Error("Firebase storage not initialized.");
  }

  try {
    const folderRef = firebase.storage().ref(folderPath);
    const listResult = await folderRef.listAll();
    const items = listResult.items || [];

    if (!items.length)
      throw new Error("No files found in folder: " + folderPath);

    const tasks = items.map((itemRef) => async () => {
      const url = await itemRef.getDownloadURL();
      try {
        const resp = await fetch(url, { mode: "cors" });
        if (!resp.ok) throw new Error("Fetch failed " + resp.status);
        const blob = await resp.blob();
        return { name: itemRef.name, blob };
      } catch {
        const blob = await downloadBlobXHR(url);
        return { name: itemRef.name, blob };
      }
    });

    const fetched = await runWithConcurrency(tasks, CONCURRENCY);

    const zip = new JSZip();
    const folder = zip.folder("photos") || zip;

    for (const file of fetched) {
      const filename = file.name.split("/").pop() || file.name;
      folder.file(filename, file.blob);
    }

    const blobZip = await zip.generateAsync({ type: "blob" });
    saveAs(blobZip, zipFilename);
    return true;
  } catch (err) {
    console.error("downloadFolderAsZip error:", err);
    throw err;
  }
}
