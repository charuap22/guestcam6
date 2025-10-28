import React, { createContext, useContext, useState, useEffect } from "react";
import { projectFirestore, projectAuth } from "../firebase/config";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState({ metadata: {} });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const updatePlan = (newPlan) => {
    setCurrentPlan({
      planId: newPlan.planId,
      planName: newPlan.planName,
      price: newPlan.price,
      subscribedOn: new Date(),
      subscriptionEndDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ),
      subscriptionStatus: "active",
      guestStart: newPlan.NoOfGuests_start || "0",
      guestEnd: newPlan.NoOfGuests_end || "Unlimited",
      metadata: newPlan.metadata || {},
    });
  };

  useEffect(() => {
    const unsubscribeAuth = projectAuth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log("✅ User Logged In:", authUser.uid);
        setUser(authUser);
      } else {
        console.warn("🔴 No user logged in.");
        setUser(null);
        setCurrentPlan(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPlanData = async () => {
      setLoading(true);
      try {
        console.log("Fetching plan for user:", user.uid);
        const userRef = projectFirestore.collection("users").doc(user.uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          console.error("❌ User document not found.");
          setCurrentPlan(null);
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        console.log("🔥 User Data:", userData);

        if (!userData.planId) {
          console.warn("⚠️ No planId found in Firestore for user.");
          setCurrentPlan(null);
          setLoading(false);
          return;
        }

        const productRef = projectFirestore
          .collection("products")
          .doc(userData.planId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
          console.error(
            "❌ Product doc not found for planId:",
            userData.planId
          );
          setCurrentPlan(null);
          setLoading(false);
          return;
        }

        const productData = productSnap.data();
        console.log("🔎 Product document data:", productData);

        // Try several possible metadata shapes (Stripe / extensions differ)
        // 1) standard Stripe extension: productData.metadata.NoOfGuests_start
        // 2) some Stripe export styles: productData.stripe_metadata_NoOfGuests_start
        // 3) nested metadata keys used elsewhere: productData.metadata?.NoOfGuests_start
        const metadata = productData.metadata || {};

        // helper to read multiple possible keys
        const readMeta = (keys) => {
          for (const k of keys) {
            if (metadata[k] !== undefined) return metadata[k];
            if (productData[k] !== undefined) return productData[k];
            // some extensions flatten keys with prefix 'stripe_metadata_'
            if (productData[`stripe_${k}`] !== undefined)
              return productData[`stripe_${k}`];
            if (productData[`stripe_metadata_${k}`] !== undefined)
              return productData[`stripe_metadata_${k}`];
          }
          return undefined;
        };

        // candidate metadata property names
        const guestStartRaw = readMeta([
          "NoOfGuests_start",
          "no_of_guests_start",
          "NoOfGuestsStart",
        ]);
        const guestEndRaw = readMeta([
          "NoOfGuests_end",
          "no_of_guests_end",
          "NoOfGuestsEnd",
        ]);

        // fallbacks
        const guestStart =
          guestStartRaw !== undefined ? String(guestStartRaw) : "0";
        const guestEnd =
          guestEndRaw !== undefined ? String(guestEndRaw) : "Unlimited";

        // name + price
        const planName =
          productData.name || productData.title || "Unknown Plan";

        // price: prefer userData.price (if saved on user), else read first price doc if present
        let priceValue = userData.price || 0;
        if ((!priceValue || priceValue === 0) && productSnap.ref) {
          try {
            const pricesSnap = await productSnap.ref.collection("prices").get();
            if (!pricesSnap.empty) {
              const p = pricesSnap.docs[0].data();
              priceValue = p.unit_amount ? p.unit_amount / 100 : priceValue;
            }
          } catch (e) {
            // ignore price read errors, keep priceValue as-is
            console.warn("Failed to read prices subcollection:", e.message);
          }
        }

        console.log(
          `✅ Plan found: ${planName} (${guestStart}-${guestEnd} Guests)`
        );

        setCurrentPlan({
          planId: userData.planId,
          planName,
          price: priceValue,
          subscribedOn: userData.subscribedOn
            ? new Date(userData.subscribedOn.seconds * 1000)
            : null,
          subscriptionEndDate: userData.subscriptionEndDate
            ? new Date(userData.subscriptionEndDate.seconds * 1000)
            : null,
          subscriptionStatus: userData.subscriptionStatus || "active",
          guestStart,
          guestEnd,
          metadata: metadata,
        });
      } catch (err) {
        console.error("Error fetching plan data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [user]);

  return (
    <PlanContext.Provider value={{ currentPlan, loading, updatePlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  return useContext(PlanContext);
};
