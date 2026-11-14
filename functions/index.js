const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const os = require("os");
const fs = require("fs");

const {
  ActivationError,
  activatePayment,
  becameSucceeded,
  redeemGiftCoupon,
} = require("./activation");

admin.initializeApp();
ffmpeg.setFfmpegPath(ffmpegPath);

// Retried events older than this are dropped instead of retried forever.
const MAX_EVENT_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * Activates a paid plan when the Stripe extension records a succeeded
 * payment. Replaces the browser-side transaction in SuccessPage.js.
 * Idempotent (keyed on the payment id), so retries are safe.
 */
exports.activatePlanOnPayment = functions
  .runWith({failurePolicy: true})
  .firestore.document("customers/{uid}/payments/{paymentId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    if (!becameSucceeded(before, after)) return;

    const age = Date.now() - Date.parse(context.timestamp);
    if (age > MAX_EVENT_AGE_MS) {
      functions.logger.error("Dropping stale payment event", {
        paymentId: context.params.paymentId,
        age,
      });
      return;
    }

    const {uid, paymentId} = context.params;
    const result = await activatePayment(
      admin.firestore(),
      admin,
      uid,
      paymentId,
      after,
    );
    const log = result.status === "rejected" ?
      functions.logger.error :
      functions.logger.info;
    log("Plan activation", {uid, paymentId, ...result});
  });

/**
 * Redeems a 100% gift ("free_plan") coupon for the signed-in user.
 * Replaces activateGiftPlan's client writes in Pricing.js.
 */
exports.redeemGiftCoupon = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Sign in to redeem a coupon.",
    );
  }
  try {
    return await redeemGiftCoupon(
      admin.firestore(),
      admin,
      context.auth.uid,
      data || {},
    );
  } catch (err) {
    if (err instanceof ActivationError) {
      throw new functions.https.HttpsError(err.code, err.message);
    }
    functions.logger.error("Gift redemption failed", err);
    throw new functions.https.HttpsError("internal", "Could not redeem.");
  }
});
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
