import React from "react";
import { useHistory } from "react-router-dom";

const CancelPage = () => {
  const history = useHistory(); // Correct hook for React Router v5

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>❌ Payment Canceled</h1>
      <p>
        It looks like you canceled your payment. No worries, you can try again
        anytime!
      </p>

      <button
        onClick={() => history.push("/")} // Correct navigation for v5
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "15px",
        }}
      >
        Go Back to Home
      </button>
    </div>
  );
};

export default CancelPage;
