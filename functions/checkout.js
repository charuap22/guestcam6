// import {loadStripe} from "@stripe/stripe-js";

// const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

// const stripePromise = loadStripe(stripePublicKey);

// const checkout = async (priceId) => {
//   const CHECKOUT_URL =
//       "https://us-central1-guestcam3-8cb1f.cloudfunctions.net/" +
//       "api/create-checkout-session";
//   const response = await fetch(CHECKOUT_URL, {
//     method: "POST",
//     headers: {"Content-Type": "application/json"},
//     body: JSON.stringify({priceId}),
//   });

//   const {sessionId} = await response.json();
//   const stripe = await stripePromise;
//   stripe.redirectToCheckout({sessionId});
// };

// export default checkout;
