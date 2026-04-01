// src/pages/RoleSelection.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { FaUser, FaStore } from "react-icons/fa";

const RoleSelection = () => {
  const [role, setRole] = useState("buyer");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


  // Agar already role set hai to direct home
  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.role) {
      navigate("/");
    }
  }, [isLoaded, user, navigate]);

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Clerk Metadata Update
      await user.update({
        unsafeMetadata: {
          role: role,
          company: role === "seller" ? company : "",
        },
      });

const token = await getToken(); // ✅

const response = await fetch(`${API_BASE_URL}/api/auth/set-role`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // 🔥 MUST
  },
  body: JSON.stringify({
    clerkId: user.id,
    role: role,
    company: role === "seller" ? company : "",
    name: user.firstName + " " + (user.lastName || ""),
    email: user.emailAddresses[0]?.emailAddress || "",
    phone: user.phoneNumbers[0]?.phoneNumber || "",
  }),
});

      if (!response.ok) {
        throw new Error("Failed to save in database");
      }

      // Thoda delay taaki data save ho jaaye
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      console.error("Error saving role:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName}!
          </h2>
          <p className="text-gray-600 mt-2">Please choose your account type</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setRole("buyer")}
            className={`flex-1 py-6 rounded-2xl border-2 text-lg font-medium transition-all ${
              role === "buyer" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FaUser className="mx-auto mb-3 text-4xl text-indigo-600" />
            <div>Buyer</div>
            <div className="text-xs text-gray-500">I want to buy products</div>
          </button>

          <button
            onClick={() => setRole("seller")}
            className={`flex-1 py-6 rounded-2xl border-2 text-lg font-medium transition-all ${
              role === "seller" ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FaStore className="mx-auto mb-3 text-4xl text-emerald-600" />
            <div>Seller</div>
            <div className="text-xs text-gray-500">I want to sell products</div>
          </button>
        </div>

        {role === "seller" && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter your company name"
              className="w-full px-4 py-3 border rounded-xl focus:border-emerald-500"
            />
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading || (role === "seller" && !company.trim())}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-xl text-lg transition-all"
        >
          {loading ? "Saving..." : "Continue to Home"}
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;