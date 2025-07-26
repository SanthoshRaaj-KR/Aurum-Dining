import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bgImage from "/images/hk-background.png";

const UpdateOrDeleteOrder = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
    
    if (userId) {
      // If logged in, redirect to profile page after a short delay
      const timer = setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // If not logged in, redirect to login page after a short delay
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const handleGoToProfile = () => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
    if (userId) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black/80 backdrop-blur-md p-12 rounded-2xl border border-gray-700 text-center max-w-2xl"
      >
        <div className="text-6xl mb-6">🔄</div>
        
        <h1 className="text-4xl font-bold text-white mb-6">
          Manage Your Reservations
        </h1>
        
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          To view, update, or cancel your reservations, please visit your profile page. 
          All your reservation history and management options are available there.
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToProfile}
            className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-black px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Go to My Profile
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToLogin}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300"
          >
            Login / Sign Up
          </motion.button>
        </div>

        <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">What you can do in your profile:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="text-green-400 text-xl">✅</div>
              <div>
                <h4 className="text-white font-medium">View All Reservations</h4>
                <p className="text-gray-400 text-sm">See your complete reservation history</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-blue-400 text-xl">✏️</div>
              <div>
                <h4 className="text-white font-medium">Update Reservations</h4>
                <p className="text-gray-400 text-sm">Modify dates, times, and table selections</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-red-400 text-xl">❌</div>
              <div>
                <h4 className="text-white font-medium">Cancel Reservations</h4>
                <p className="text-gray-400 text-sm">Easy cancellation for upcoming bookings</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-yellow-400 text-xl">📊</div>
              <div>
                <h4 className="text-white font-medium">Track Status</h4>
                <p className="text-gray-400 text-sm">Monitor active and past reservations</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Redirecting automatically in a few seconds...
        </p>
      </motion.div>
    </div>
  );
};

export default UpdateOrDeleteOrder;