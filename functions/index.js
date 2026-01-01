const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();
ffmpeg.setFfmpegPath(ffmpegPath);
exports.processVideo = functions
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .storage.object()
  .onFinalize(async (object) => {
    if (!object.contentType?.startsWith("video/")) return;

    const filePath = object.name;

    // ✅ ONLY original uploads
    if (!filePath.startsWith("guestbook/")) return;
    if (!filePath.includes("/videos/")) return;

    // ❌ prevent recursion
    if (filePath.includes("/thumbnails/") || filePath.includes("/previews/")) {
      return;
    }

    const parts = filePath.split("/");
    const eventId = parts[1];
    const fileName = path.basename(filePath);
    const videoId = path.parse(fileName).name;

    const bucket = admin.storage().bucket(object.bucket);

    const tempVideo = path.join(os.tmpdir(), fileName);
    const tempThumb = path.join(os.tmpdir(), `${videoId}.jpg`);
    const tempPreview = path.join(os.tmpdir(), `${videoId}-preview.mp4`);

    await bucket.file(filePath).download({ destination: tempVideo });

    // Thumbnail
    await new Promise((res, rej) => {
      ffmpeg(tempVideo)
        .screenshots({
          timestamps: ["1"],
          filename: `${videoId}.jpg`,
          folder: os.tmpdir(),
          size: "640x?", // ✅ PRESERVE ASPECT RATIO
        })
        .on("end", res)
        .on("error", rej);
    });

    // Preview
    await new Promise((res, rej) => {
      ffmpeg(tempVideo)
        .setStartTime(0)
        .setDuration(2.5)
        .outputOptions([
          "-movflags faststart",
          "-pix_fmt yuv420p",
          "-vf scale=480:-2",
          "-preset veryfast",
          "-b:v 400k",
        ])
        .save(tempPreview)
        .on("end", res)
        .on("error", rej);
    });

    const thumbPath = `thumbnails/${eventId}/${videoId}.jpg`;
    const previewPath = `previews/${eventId}/${videoId}.mp4`;

    await bucket.upload(tempThumb, { destination: thumbPath });
    await bucket.upload(tempPreview, { destination: previewPath });

    const thumbUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(thumbPath)}?alt=media`;
    const previewUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(previewPath)}?alt=media`;

    const snap = await admin
      .firestore()
      .collection("videos")
      .where("storagePath", "==", filePath)
      .limit(1)
      .get();

    if (!snap.empty) {
      await snap.docs[0].ref.update({
        thumbUrl,
        previewUrl,
        status: "ready",
      });
    }

    fs.unlinkSync(tempVideo);
    fs.unlinkSync(tempThumb);
    fs.unlinkSync(tempPreview);
  });
