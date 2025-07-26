import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import background from "/images/hk-background.png";

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch order details using orderId from URL
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        // Using the full URL without proxy
        const response = await fetch(`${import.meta.env.VITE_TABLE_SERVICE_URL}/takeaway/${orderId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        
        const data = await response.json();
        
        // Map the data from your backend format to the expected format in the component
        const formattedData = {
          orderId: data.orderId,
          customerInfo: {
            name: data.fullName,
            phone: data.phone,
            address: data.address
          },
          orderItems: data.items,
          orderDate: data.createdAt,
          billing: {
            subtotal: data.subtotal,
            tax: data.tax,
            acTax: data.acTax,
            gst: data.gst,
            deliveryCharge: data.deliveryCharge,
            total: data.total
          }
        };
        
        setOrderData(formattedData);
      } catch (err) {
        setError(err.message || "Something went wrong");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundImage: `url(${background})` }}>
        <div className="bg-black/70 p-8 rounded-lg text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
          <p className="text-xl">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundImage: `url(${background})` }}>
        <div className="bg-black/70 p-8 rounded-lg text-white text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => navigate("/order-takeaway")}
            className="px-6 py-3 bg-[#B8860B] text-black font-bold rounded-lg hover:bg-[#8B6508] transition-colors"
          >
            Place New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6"
      style={{ backgroundImage: `url(${background})` }}>
      <div className="max-w-3xl mx-auto">
        
        {/* Success Header */}
        <div className="bg-black/70 p-8 rounded-t-lg text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-300">Thank you for your order. Your delicious food is on the way!</p>
          <div className="mt-4 inline-block px-5 py-2 bg-[#B8860B] text-black font-bold rounded-lg">
            Order ID: #{orderData?.orderId || orderId}
          </div>
        </div>
        
        {/* Order Details */}
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-b-lg text-white border-t border-[#B8860B]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#B8860B]">Customer Details</h2>
              <p className="mb-2"><span className="text-gray-400">Name:</span> {orderData?.customerInfo?.name}</p>
              <p className="mb-2"><span className="text-gray-400">Phone:</span> {orderData?.customerInfo?.phone}</p>
              <p className="mb-2"><span className="text-gray-400">Address:</span> {orderData?.customerInfo?.address}</p>
              <p className="mb-2">
                <span className="text-gray-400">Order Date:</span> {orderData?.orderDate ? formatDate(orderData.orderDate) : "Processing"}
              </p>
              <p className="mb-2">
                <span className="text-gray-400">Estimated Delivery:</span> {orderData?.estimatedDelivery || "30-45 minutes"}
              </p>
            </div>
            
            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[#B8860B]">Order Summary</h2>
              
              <div className="mb-4">
                <h3 className="text-lg mb-2">Items</h3>
                <ul className="divide-y divide-gray-700">
                  {orderData?.orderItems?.map((item, index) => (
                    <li key={index} className="py-2 flex justify-between">
                      <span>{item.quantity}× {item.name}</span>
                      <span className="text-[#B8860B]">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 pt-2 border-t border-gray-700">
                <div className="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>₹{orderData?.billing?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Tax (5%):</span>
                  <span>₹{orderData?.billing?.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>AC Tax (2%):</span>
                  <span>₹{orderData?.billing?.acTax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>GST (8%):</span>
                  <span>₹{orderData?.billing?.gst?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Delivery Charge:</span>
                  <span>{orderData?.billing?.deliveryCharge === 0 ? "Free" : `₹${orderData?.billing?.deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-700 font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-[#B8860B]">₹{orderData?.billing?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Status */}
          <div className="mt-8 bg-black/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
            <p className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-400 font-medium">Cash on Delivery</span>
            </p>
          </div>
          
          {/* Actions */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </button>
            <button 
              onClick={() => navigate("/order-takeaway")}
              className="px-6 py-3 bg-[#B8860B] text-black font-bold rounded-lg hover:bg-[#8B6508] transition-colors"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;