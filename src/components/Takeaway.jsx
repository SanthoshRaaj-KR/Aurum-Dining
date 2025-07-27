import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import background from "/images/hk-background.png";

function Takeaway() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("brunch");
  const [order, setOrder] = useState({});
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkUserAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsLoggedIn(true);
          
          // Pre-fill user details if available
          setUserName(user.name || '');
          // Note: We don't pre-fill phone and address as they might not be in the auth user object
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      }
    };

    checkUserAuth();
  }, []);

  // Menu Data
  const menuItems = {
    brunch: [
      { name: "Masala Dosa", desc: "Rice crepe with spicy potato filling", price: "110" },
      { name: "Aloo Paratha", desc: "Stuffed wheat flatbread with butter", price: "70" },
      { name: "Eggs Benedict", desc: "Poached eggs, hollandaise sauce", price: "140" },
      { name: "Pancakes & Maple Syrup", desc: "Classic pancakes with pure maple syrup", price: "220" },
      { name: "French Toast", desc: "Crispy golden toast with honey drizzle", price: "100" },
      { name: "Cheesy Garlic Naan Benedict", desc: "Poached eggs over mini garlic naans, topped with creamy tikka hollandaise", price: "200" },
      { name: "Tandoori Avocado Toast", desc: "Grilled avocado with smoky tandoori spices on sourdough, topped with pickled onions", price: "150" }
    ],

    lunch: [
      { name: "Chicken Biryani", desc: "Aromatic basmati rice with spices", price: "350" },
      { name: "Mutton Biryani", desc: "Aromatic basmati rice with spices", price: "420" },
      { name: "Butter Chicken", desc: "Cottage cheese in creamy tomato sauce", price: "280" },
      { name: "Lasagna", desc: "Layered pasta with ricotta and meat sauce", price: "400" },
      { name: "Grilled Chicken Salad", desc: "Fresh greens, grilled chicken & vinaigrette", price: "260" },
      { name: "Fish & Chips", desc: "Golden fried fish with crispy fries", price: "320" },
      { name: "Kathi Roll Burrito", desc: "A fusion of a burrito and Indian kathi roll, stuffed with spiced paneer, saffron rice, and raita drizzle", price: "200" },
      { name: "Black Garlic & Truffle Butter Naan Pizza", desc: "Naan topped with black garlic sauce, mushrooms, and truffle butter", price: "280" },
    ],

    dinner: [
      { name: "Butter Chicken", desc: "Rich tomato-based curry with chicken", price: "340" },
      { name: "Beef Stroganoff", desc: "Creamy Russian beef dish with pasta", price: "450" },
      { name: "Shrimp Alfredo Pasta", desc: "Creamy garlic sauce with juicy shrimp", price: "420" },
      { name: "Tandoori Roti & Sabzi", desc: "Traditional tandoori bread with mixed veggies", price: "200" },
      { name: "Lobster Thermidor", desc: "Succulent lobster in a creamy brandy-infused sauce, topped with gruyère cheese and baked until golden", price: "460" },
      { name: "Saffron & Gold Leaf Risotto", desc: "Creamy risotto infused with saffron and garnished with edible gold leaf for an opulent touch", price: "300" },
      { name: "Mutton Rogan Josh", desc: "Kashmiri-style slow-cooked lamb curry with rich spices", price: "380" },
    ],

    desserts: [
      { name: "Gulab Jamun", desc: "Deep-fried milk balls in sugar syrup", price: "120" },
      { name: "Tiramisu", desc: "Italian coffee-flavored dessert", price: "280" },
      { name: "Chocolate Brownie", desc: "Warm fudgy brownie with ice cream", price: "250" },
      { name: "Cheesecake", desc: "Classic creamy cheesecake with berry topping", price: "260" },
      { name: "24K Gold Chocolate Lava Cake", desc: "Rich molten chocolate cake with edible gold dust", price: "450" },
      { name: "Saffron Pistachio Cheesecake", desc: "Baked cheesecake infused with saffron and topped with pistachios", price: "350" },
      { name: "Dark Chocolate & Raspberry Mousse", desc: "Layers of dark chocolate and raspberry mousse", price: "320" },
    ],

    drinks: [
      { name: "Mango Lassi", desc: "Sweet yogurt drink with mango", price: "150" },
      { name: "Espresso", desc: "Strong Italian coffee shot", price: "110" },
      { name: "Iced Latte", desc: "Chilled espresso with creamy milk", price: "160" },
      { name: "Mocktail - Blue Lagoon", desc: "Refreshing blue drink with lemon fizz", price: "200" },
      { name: "Golden Elixir Martini", desc: "Vodka martini infused with saffron and elderflower", price: "500" },
      { name: "Midnight Velvet Negroni", desc: "Negroni with activated charcoal and dark cherry bitters", price: "450" },
      { name: "Imperial Old Fashioned", desc: "Smoked bourbon cocktail with 24k gold leaf", price: "550" },
    ],
  };

  const updateOrder = (item, action) => {
    setOrder((prevOrder) => {
      const newOrder = { ...prevOrder };

      if (action === "add") {
        newOrder[item.name] = { qty: (newOrder[item.name]?.qty || 0) + 1, price: item.price };
      } else if (action === "remove" && newOrder[item.name]) {
        if (newOrder[item.name].qty > 1) {
          newOrder[item.name].qty -= 1;
        } else {
          delete newOrder[item.name];
        }
      }

      return newOrder;
    });
  };

  // Calculate billing amounts
  const subtotal = Object.values(order).reduce((total, item) => total + item.qty * item.price, 0);
  const tax = subtotal * 0.05;
  const acTax = subtotal * 0.02;
  const gst = subtotal * 0.08;
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + acTax + gst + deliveryCharge;

  // Format order items for API submission
  const formatOrderItems = () => {
    return Object.entries(order).map(([itemName, details]) => ({
      name: itemName,
      quantity: details.qty,
      price: details.price
    }));
  };

  // Validate form inputs
  const validateForm = () => {
    if (!isLoggedIn) {
      setErrorMessage("Please log in to place an order");
      return false;
    }
    if (userName.trim() === "") {
      setErrorMessage("Please enter your name");
      return false;
    }
    if (phone.trim() === "" || !/^\d{10}$/.test(phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number");
      return false;
    }
    if (address.trim() === "") {
      setErrorMessage("Please enter your delivery address");
      return false;
    }
    if (Object.keys(order).length === 0) {
      setErrorMessage("Please add at least one item to your order");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Store current order data in localStorage to restore after login
    localStorage.setItem('pendingOrder', JSON.stringify({
      order,
      selectedCategory,
      userName,
      phone,
      address
    }));
    navigate('/login');
  };

  // Restore order data after login (you can call this from useEffect if needed)
  const restoreOrderData = () => {
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (pendingOrder) {
      try {
        const { order: savedOrder, selectedCategory: savedCategory, userName: savedName, phone: savedPhone, address: savedAddress } = JSON.parse(pendingOrder);
        setOrder(savedOrder || {});
        setSelectedCategory(savedCategory || "brunch");
        setUserName(savedName || "");
        setPhone(savedPhone || "");
        setAddress(savedAddress || "");
        localStorage.removeItem('pendingOrder');
      } catch (error) {
        console.error('Error restoring order data:', error);
      }
    }
  };

  // Call restoreOrderData when user becomes logged in
  useEffect(() => {
    if (isLoggedIn) {
      restoreOrderData();
    }
  }, [isLoggedIn]);

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        userId: currentUser._id, // Include userId from authenticated user
        fullName: userName,
        phone: phone,
        address: address,
        items: formatOrderItems(),
        subtotal: subtotal,
        tax: tax,
        acTax: acTax,
        gst: gst,
        deliveryCharge: deliveryCharge,
        total: total
      };

      const response = await fetch(`${import.meta.env.VITE_TABLE_SERVICE_URL}/takeaway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order submission failed');
      }

      const data = await response.json();

      // Clear the order and form
      setOrder({});
      setUserName(currentUser.name || '');
      setPhone('');
      setAddress('');

      // Redirect to order confirmation page with orderId
      navigate(`/order-confirmation/${data.orderId}`);

    } catch (error) {
      console.error('Error submitting order:', error);
      setErrorMessage(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-repeat bg-[length:100px_100px] text-white flex flex-col py-12 px-6"
      style={{ backgroundImage: `url(${background})` }}
    >
      <h1 className="text-3xl font-bold tracking-wide text-center">TAKEAWAY</h1>
      <h2 className="text-lg font-semibold text-[#B8860B] text-center mt-1">Order Your Favorite Food</h2>

      {/* Login Status Indicator */}
      {isLoggedIn ? (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-2 rounded-lg mx-auto mt-4 max-w-md text-center">
          Welcome back, {currentUser?.name}! 👋
        </div>
      ) : (
        <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-2 rounded-lg mx-auto mt-4 max-w-md text-center">
          <p className="mb-2">Please log in to place an order</p>
          <button
            onClick={handleLoginRedirect}
            className="bg-[#B8860B] text-black px-4 py-2 rounded font-medium hover:bg-[#D4AF37] transition-colors"
          >
            Login Now
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row mt-12 w-full max-w-7xl mx-auto">
        {/* Left: Menu */}
        <div className="md:w-2/3 w-full pr-10">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {["brunch", "lunch", "dinner"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full px-5 py-2 rounded-lg font-medium text-sm transition ${selectedCategory === category
                  ? "bg-[#B8860B] text-black"
                  : "border-2 border-white text-white hover:bg-white hover:text-black"
                  }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {["desserts", "drinks"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full px-5 py-2 rounded-lg font-medium text-sm transition ${selectedCategory === category
                  ? "bg-[#B8860B] text-black"
                  : "border-2 border-white text-white hover:bg-white hover:text-black"
                  }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Food Items List */}
          <div className="flex flex-col space-y-4">
            {menuItems[selectedCategory].map((item) => (
              <div key={item.name} className="bg-black/40 p-4 rounded-lg border border-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-300">{item.desc}</p>
                  <p className="text-[#B8860B] font-bold">₹{item.price}</p>
                </div>
                <div className="flex items-center">
                  <button
                    className="px-4 py-2 rounded-l-md font-medium text-lg shadow-2xl transition bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => updateOrder(item, "remove")}
                    disabled={!order[item.name]}
                  >
                    -
                  </button>
                  <span className="px-5 py-2 text-lg bg-gray-900 text-white font-semibold shadow-inner">
                    {order[item.name]?.qty || 0}
                  </span>
                  <button
                    className="px-4 py-2 rounded-r-md font-medium text-lg shadow-2xl transition bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateOrder(item, "add")}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Billing Section */}
        <div className="md:w-1/3 w-full bg-black/30 p-6 rounded-lg shadow-lg border border-white mt-8 md:mt-0">
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-bold text-center mb-4">Order Details</h2>
            
            {errorMessage && (
              <div className="bg-red-600 text-white p-2 mb-4 rounded text-sm">
                {errorMessage}
              </div>
            )}

            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              disabled={!isLoggedIn}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="\d{10}"
              required
              disabled={!isLoggedIn}
            />
            <textarea
              placeholder="Delivery Address"
              className="w-full p-2 mb-4 rounded bg-gray-800 text-white h-20 resize-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={!isLoggedIn}
            />

            {/* Order Summary */}
            {Object.keys(order).length > 0 && (
              <div className="mb-4 p-3 bg-gray-900/50 rounded border">
                <h3 className="text-sm font-semibold mb-2 text-[#B8860B]">Your Order:</h3>
                {Object.entries(order).map(([itemName, details]) => (
                  <div key={itemName} className="flex justify-between text-xs mb-1">
                    <span>{details.qty}× {itemName}</span>
                    <span>₹{(details.qty * details.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className={`w-full p-3 mt-4 rounded-lg font-semibold transition ${
                isLoggedIn && Object.keys(order).length > 0
                  ? "bg-[#B8860B] text-black hover:bg-[#D4AF37]"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting || !isLoggedIn || Object.keys(order).length === 0}
            >
              {isSubmitting ? "Placing Order..." : !isLoggedIn ? "Login Required" : "Place Order"}
            </button>
          </form>

          {/* Billing Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-[#B8860B] border-b border-[#B8860B] pb-1">
              Bill Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>AC Tax (2%):</span>
                <span>₹{acTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (8%):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className={deliveryCharge === 0 ? "text-green-400" : ""}>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              {subtotal > 0 && subtotal <= 500 && (
                <div className="text-xs text-yellow-400 mt-1">
                  💡 Add ₹{(501 - subtotal).toFixed(2)} more for free delivery!
                </div>
              )}
              <hr className="border-gray-600 my-3" />
              <div className="flex justify-between text-lg font-bold text-[#B8860B]">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-600">
              <div className="flex items-center">
                <span className="text-blue-300 text-sm">💳</span>
                <span className="text-blue-200 text-sm ml-2">Payment: Cash on Delivery</span>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            <div className="mt-4 p-3 bg-green-900/30 rounded border border-green-600">
              <div className="flex items-center">
                <span className="text-green-300 text-sm">🕒</span>
                <span className="text-green-200 text-sm ml-2">Estimated Delivery: 30-45 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Takeaway;