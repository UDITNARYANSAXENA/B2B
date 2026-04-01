// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaStore, FaGoogle } from "react-icons/fa";

const SignupPage = () => {
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });

  const { isLoaded, signUp } = useSignUp();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.name.split(" ")[0],
        unsafeMetadata: {
          role: role,
          company: role === "seller" ? formData.company : "",
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      navigate("/select-role");   // Direct Role Selection
    } catch (err) {
      console.error(err);
      alert(err.errors?.[0]?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = () => {
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/select-role",   // Google ke baad Role Selection
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Create Your Account</h2>

        {/* Role Switch */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setRole("buyer")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-lg font-medium transition-all ${
              role === "buyer" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700"
            }`}
          >
            <FaUser /> Buyer
          </button>
          <button
            onClick={() => setRole("seller")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-lg font-medium transition-all ${
              role === "seller" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700"
            }`}
          >
            <FaStore /> Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="col-span-2 px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="col-span-2 px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="col-span-2 px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
          />

          {role === "seller" && (
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={formData.company}
              onChange={handleChange}
              required
              className="col-span-2 px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className={`col-span-2 py-4 rounded-xl font-semibold text-white text-lg transition-all ${
              role === "buyer" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Creating Account..." : `Sign Up as ${role === "buyer" ? "Buyer" : "Seller"}`}
          </button>
        </form>

        <button
          onClick={signUpWithGoogle}
          className="mt-6 w-full flex items-center justify-center gap-3 border border-gray-300 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all"
        >
          <FaGoogle className="text-red-500" /> Sign up with Google
        </button>

        <p className="text-center text-sm mt-8 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;