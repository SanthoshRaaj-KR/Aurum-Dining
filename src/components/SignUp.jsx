import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // Example placeholder:
    if (form.name && form.email && form.password) {
      console.log("Signup successful (placeholder)");
      navigate("/login");
    } else {
      setError("Please fill in all fields.");
    }
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-center min-h-screen bg-cover bg-center px-8 pt-24"

      style={{ backgroundImage: `url('/images/loginBackground.png')` }}
    >
      <div className="flex flex-col w-full max-w-md px-4 sm:px-8 py-8 bg-opacity-70 rounded-xl"> 
        <h1 className="text-6xl sm:text-7xl font-bold mb-8 text-white text-center">Sign Up</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white p-4 mb-4 rounded-md text-lg text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col">
          <label htmlFor="name" className="text-white text-2xl sm:text-3xl mb-2">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            // Input fields retain their semi-transparent background
            className="p-3 sm:p-4 border border-gray-700 rounded-md mb-6 w-full text-lg sm:text-xl bg-gray-900 bg-opacity-50 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-500"
            required
          />

          <label htmlFor="email" className="text-white text-2xl sm:text-3xl mb-2">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            // Input fields retain their semi-transparent background
            className="p-3 sm:p-4 border border-gray-700 rounded-md mb-6 w-full text-lg sm:text-xl bg-gray-900 bg-opacity-50 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-500"
            required
          />

          <label htmlFor="password" className="text-white text-2xl sm:text-3xl mb-2">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            // Input fields retain their semi-transparent background
            className="p-3 sm:p-4 border border-gray-700 rounded-md mb-6 w-full text-lg sm:text-xl bg-gray-900 bg-opacity-50 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-500"
            required
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 p-3 sm:p-4 bg-yellow-500 text-black text-xl sm:text-2xl rounded-md w-full hover:bg-yellow-600 font-semibold transition-colors duration-300"
            type="submit"
          >
            Sign Up
          </motion.button>

          <p className="text-lg text-center text-white mt-6">
            Already have an account?{" "}
            <span
              className="text-yellow-500 cursor-pointer hover:underline font-semibold"
              onClick={() => navigate("/login")}
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
