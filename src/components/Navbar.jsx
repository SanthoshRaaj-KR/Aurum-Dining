import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo5.png";
import { useEffect, useState } from "react";
import axios from "axios";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user); // assumes user object contains 'name', 'picture', 'role' or 'isAdmin'
    } catch (err) {
      console.error("Token invalid or user not logged in");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Sync login status across tabs
    const handleStorageChange = () => {
      fetchUser();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="w-full bg-black text-white fixed top-0 left-0 shadow-lg z-30 font-oswald">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
        {/* Logo */}
        <div className="h-full flex items-center ml-[-35px]">
          <img src={logo} alt="Logo" className="h-14" />
          <p className="text-5xl pb-4 font-trajan">Aurum Dining</p>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-8 text-lg font-semibold">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="hover:text-[#8C7427] transition duration-300 cursor-pointer"
          >
            Home
          </Link>
          <Link
            to="/menu"
            className="hover:text-[#8C7427] transition duration-300 cursor-pointer"
          >
            Menu
          </Link>
          <Link
            to="/select-date-time"
            className="hover:text-[#8C7427] transition duration-300 cursor-pointer"
          >
            Reserve
          </Link>
          <Link
            to="/order-takeaway"
            className="hover:text-[#8C7427] transition duration-300 cursor-pointer"
          >
            Takeaway
          </Link>

          {/* Profile or Login */}
          {!loading && user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 h-10 rounded-md font-medium transition-colors duration-300"
            >
              {user.picture && (
                <img
                  src={user.picture}
                  alt="profile"
                  className="w-7 h-7 rounded-full object-cover"
                />
              )}
              <span>{user.name?.split(" ")[0]}</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 h-10 rounded-md font-medium transition-colors duration-300"
              onClick={() => navigate("/login")}
            >
              Login
            </motion.button>
          )}

          {/* Admin Button — only show if user is admin */}
          {!loading && user?.role === "admin" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 border border-yellow-500 text-yellow-400 px-4 py-2 h-10 rounded-md font-medium transition-colors duration-300"
              onClick={() => navigate("/admin-login")}
            >
              Admin
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
