// src/utils/downloads.js
import JSZip from "jszip";
import { saveAs } from "file-saver";
import firebase from "firebase/app";

/**
 * Download a single file by URL.
 * Creates an <a> and triggers a click to start download.
 */
export function downloadImage(url, filename = "download") {
  try {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    // cleanup
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    return true;
  } catch (err) {
    console.error("downloadImage error:", err);
    return false;
  }
}

/**
 * Download all files in a Firebase storage folder as a zip.
 * folderPath example: "gallery/<eventId>"
 *
 * Note: This uses firebase.storage() and requires the firebase client to be initialized.
 */
export async function downloadFolderAsZip(folderPath) {
  try {
    const jszip = new JSZip();
    const folderRef = firebase.storage().ref(folderPath);

    // listAll may throw for very large folders; handle errors as appropriate
    const listResult = await folderRef.listAll();
    const items = listResult.items || [];

    // fetch URLs
    const urls = await Promise.all(items.map((ref) => ref.getDownloadURL()));
    // fetch blobs
    const blobs = await Promise.all(
      urls.map((u) => fetch(u).then((r) => r.blob()))
    );

    blobs.forEach((blob, i) => {
      const filename = items[i]?.name || `file-${i}`;
      jszip.file(filename, blob);
    });

    const content = await jszip.generateAsync({ type: "blob" });
    const zipName = `${folderPath.replace(/\//g, "_") || "download"}.zip`;
    saveAs(content, zipName);
    return true;
  } catch (err) {
    console.error("downloadFolderAsZip error:", err);
    throw err;
  }
}
