import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { projectFirestore, projectAuth } from "../firebase/config";
import { usePlan } from "../context/PlanContext";

const GetPackageInfo = () => {
  const { currentPlan, updatePlan } = usePlan();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlanData = async () => {
      const user = projectAuth.currentUser;
      if (!user) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      try {
        const userRef = projectFirestore.collection("users").doc(user.uid);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
          const userData = userSnap.data();

          if (userData.planId) {
            const productRef = projectFirestore
              .collection("products")
              .doc(userData.planId);
            const productSnap = await productRef.get();

            if (productSnap.exists) {
              const planData = productSnap.data();
              const planName = planData.name || "Unknown Plan";
              const guestStart =
                planData.stripe_metadata_NoOfGuests_start || "0";
              const guestEnd =
                planData.stripe_metadata_NoOfGuests_end || "Unlimited";

              updatePlan({
                planId: userData.planId,
                planName,
                price: userData.price,
                subscribedOn: userData.subscribedOn
                  ? new Date(userData.subscribedOn.seconds * 1000)
                  : null,
                subscriptionEndDate: userData.subscriptionEndDate
                  ? new Date(userData.subscriptionEndDate.seconds * 1000)
                  : null,
                subscriptionStatus: userData.subscriptionStatus,
                guestStart,
                guestEnd,
              });
            } else {
              setError("Plan details not found.");
            }
          } else {
            setError("No active subscription.");
          }
        } else {
          setError("User data not found.");
        }
      } catch (err) {
        console.error("Error fetching user plan:", err);
        setError("Failed to fetch plan details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [updatePlan]);

  // ✅ **Professional Loader with Skeleton Effect**
  if (loading) {
    return (
      <Box
        textAlign="center"
        mt={4}
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Skeleton height="20px" width="80px" mb={2} />
        <SkeletonText mt="4" noOfLines={1} spacing="4" />
      </Box>
    );
  }

  // ✅ **Show error message if fetching failed**
  if (error) {
    return (
      <Alert status="error" mt={4} borderRadius="lg">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // ✅ **Ensure plan is fully loaded before rendering it**
  if (!currentPlan) return null; // Prevent flickering

  return (
    <Box
      px={0}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      textAlign="center"
    >
      <Text fontSize="lg" fontWeight="bold" color="gray.700" pt={3}>
        {currentPlan.planName} ({currentPlan.guestStart} -{" "}
        {currentPlan.guestEnd} Guests)
      </Text>
    </Box>
  );
};

export default GetPackageInfo;
