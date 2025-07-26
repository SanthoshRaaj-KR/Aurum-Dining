import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import loginBackground from "/images/loginBackground.png"
const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // TODO: Implement actual login logic (send POST request to backend)
    // Example placeholder:
    if (form.email === "test@example.com" && form.password === "password") {
      console.log("Login successful (placeholder)");
      navigate("/");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-center min-h-screen bg-cover bg-center px-8 pt-24"
      // Use the provided image URL as the background
      style={{ backgroundImage: `url('/images/loginBackground.png')` }}
    >
      {/* Container for the form with transparent background */}
      <div className="flex justify-center items-center w-full max-w-2xl  bg-opacity-70 p-8 rounded-xl ">
        {/* Login Form */}
        <div className="flex flex-col w-full px-4 sm:px-8">
          <h1 className="text-6xl sm:text-7xl font-bold mb-8 text-white text-center">User Login</h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-600 text-white p-4 mb-4 rounded-md text-lg text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col">
            <label htmlFor="email" className="text-white text-2xl sm:text-3xl mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="p-3 sm:p-4 border border-gray-700 rounded-md mb-6 w-full text-lg sm:text-xl bg-gray-900 bg-opacity-50 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-500" // Added bg-opacity-50 and placeholder color
              required
            />

            <label htmlFor="password" className="text-white text-2xl sm:text-3xl mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="p-3 sm:p-4 border border-gray-700 rounded-md mb-6 w-full text-lg sm:text-xl bg-gray-900 bg-opacity-50 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-500" // Added bg-opacity-50 and placeholder color
              required
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 p-3 sm:p-4 bg-yellow-500 text-black text-xl sm:text-2xl rounded-md w-full hover:bg-yellow-600 font-semibold transition-colors duration-300"
              type="submit"
            >
              Login
            </motion.button>

            <p className="text-lg text-center text-white mt-6">
              Don't have an account?{" "}
              <span
                className="text-yellow-500 cursor-pointer hover:underline font-semibold"
                onClick={() => navigate("/signup")}
              >
                Sign Up here
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
