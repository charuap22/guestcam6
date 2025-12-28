const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Generate REAL poster image for uploaded videos
 */
exports.generateVideoThumbnail = functions.storage
  .object()
  .onFinalize(async (object) => {
    try {
      if (!object.contentType || !object.contentType.startsWith("video/")) {
        return null;
      }

      const filePath = object.name; // videos/eventId/filename.mp4
      if (!filePath || !filePath.startsWith("videos/")) {
        return null;
      }

      const bucket = admin.storage().bucket(object.bucket);

      const tempVideoPath = path.join(os.tmpdir(), path.basename(filePath));

      const thumbFileName = filePath.replace(/\.[^/.]+$/, ".jpg");
      const tempThumbPath = path.join(
        os.tmpdir(),
        path.basename(thumbFileName)
      );

      // Download video
      await bucket.file(filePath).download({
        destination: tempVideoPath,
      });

      // Extract frame at 1 second
      await new Promise((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .on("end", resolve)
          .on("error", reject)
          .screenshots({
            count: 1,
            timemarks: ["1"],
            filename: path.basename(tempThumbPath),
            folder: os.tmpdir(),
          });
      });

      // Upload thumbnail
      await bucket.upload(tempThumbPath, {
        destination: thumbFileName,
        contentType: "image/jpeg",
        metadata: {
          cacheControl: "public,max-age=31536000",
        },
      });

      // Cleanup temp files
      fs.unlinkSync(tempVideoPath);
      fs.unlinkSync(tempThumbPath);

      // Get public URL
      const [thumbnailUrl] = await bucket.file(thumbFileName).getSignedUrl({
        action: "read",
        expires: "03-01-2035",
      });

      // Update Firestore video doc
      const snapshot = await admin
        .firestore()
        .collection("videos")
        .where("storagePath", "==", filePath)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          thumbnailUrl,
        });
      }

      return null;
    } catch (error) {
      console.error("Thumbnail generation failed:", error);
      return null;
    }
  });
