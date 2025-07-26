import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/api/auth/login`,
        form,
        { withCredentials: true }
      );

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  // ✅ Fixed Google Login Handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      console.log("Google credential received:", credentialResponse);
      
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/api/auth/google-auth`,
        { credential: credentialResponse.credential }, // ✅ Fixed parameter name
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Backend response:", res.data);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Google login failed.");
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google OAuth Error:", error);
    setError("Google login failed. Please try again.");
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-center min-h-screen bg-cover bg-center px-4 py-12 sm:px-8 sm:py-24 font-sans" // Added font-sans
      style={{ backgroundImage: `url('/images/loginBackground.png')` }} 
    >
      <div className="flex justify-center items-center w-full max-w-md sm:max-w-xl lg:max-w-2xl  bg-opacity-80 backdrop-blur-sm p-8 sm:p-12 rounded-2xl "> {/* Enhanced card styling */}
        <div className="flex flex-col w-full">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 text-white text-center tracking-tight">User Login</h1> {/* Larger, bolder title */}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-600 text-white p-4 mb-6 rounded-lg text-lg text-center shadow-md" // Enhanced error message
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col">
            <label htmlFor="email" className="text-white text-xl sm:text-2xl mb-2 font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="p-3 sm:p-4 border border-gray-600 rounded-lg mb-6 w-full text-lg sm:text-xl bg-gray-900 bg-opacity-60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300" // Enhanced input styling
              required
            />

            <label htmlFor="password" className="text-white text-xl sm:text-2xl mb-2 font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="p-3 sm:p-4 border border-gray-600 rounded-lg mb-8 w-full text-lg sm:text-xl bg-gray-900 bg-opacity-60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300" // Enhanced input styling
              required
            />

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(253, 224, 71, 0.4)" }} // Enhanced hover effect
              whileTap={{ scale: 0.98 }}
              className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 text-xl sm:text-2xl rounded-lg w-full font-bold shadow-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:-translate-y-0.5" // Enhanced button styling
              type="submit"
            >
              Login
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white mb-4 text-xl font-medium">OR</p>
            {/* ✅ Enhanced GoogleLogin configuration */}
            <div className="flex justify-center"> {/* Centering Google button */}
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    useOneTap={false}
                    auto_select={false}
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                />
            </div>
          </div>

          <p className="text-lg sm:text-xl text-center text-white mt-8">
            Don't have an account?{" "}
            <span
              className="text-yellow-400 cursor-pointer hover:underline font-semibold hover:text-yellow-300 transition-colors duration-200" // Enhanced link styling
              onClick={() => navigate("/signup")}
            >
              Sign Up here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
