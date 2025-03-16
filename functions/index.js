// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const stripe = require("stripe")(functions.config().stripe.secret_key);

// admin.initializeApp();

// /**
//  * Cloud Function to handle Stripe webhook events.
//  */
// exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const endpointSecret = functions.config().stripe.webhook_secret;

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
//   } catch (err) {
//     console.error("⚠️  Webhook signature verification failed.", err.message);
//     return res.sendStatus(400);
//   }

//   // Handle the event
//   switch (event.type) {
//     case "checkout.session.completed": {
//       const session = event.data.object;
//       // Fulfill the purchase, e.g., update Firestore

//       // Retrieve the user ID from the session metadata
//       const userId = session.metadata.userId;
//       const planId = session.metadata.planId;

//       // Update the user's information in Firestore
//       try {
//         await admin.firestore().collection("users").doc(userId).update({
//           planId,
//           subscribedOn: session.created,
//           subscriptionStatus: "active",
//         });

//         console.log(`Successfully updated user ${userId} after payment.`);
//       } catch (error) {
//         console.error(`Error updating user ${userId}:`, error);
//       }
//       break;
//     }
//     // ... handle other event types
//     default: {
//       console.log(`Unhandled event type ${event.type}`);
//     }
//   }
//   res.sendStatus(200);
// });
