import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import bgImage from "/images/hk-background.png";
import food1 from "/images/food1.jpg"; 

const DateTimeSelection = () => {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!date || !time) {
      alert("Please select a date and time before proceeding.");
      return;
    }

    // Navigate to the "Reserve Table" page with the selected date and time
    navigate("/reserve-table", { state: { date: date.toDateString(), time } });
  };

  const handleManageReservation = () => {
    // Navigate directly to the Update or Delete Order page
    navigate("/update-or-delete-order");  // No orderId passed for now
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-start min-h-screen bg-repeat bg-[length:100px_100px] bg-center px-8 pt-24"
      style={{ backgroundImage: `url(${bgImage})` }} // Background image applied
    >
      {/* Left Side (Date & Time Picker) */}
      <div className="flex flex-col w-full sm:w-1/2 mb-8 sm:mb-0">
        <h1 className="text-7xl font-bold mb-8 text-white">Select Date & Time</h1>

        {/* Date Picker */}
        <label className="text-white text-3xl mb-4">Select Date:</label>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          minDate={new Date()} // Prevent past dates
          className="p-4 border rounded-md mb-8 w-full sm:w-96 text-xl bg-black text-white appearance-none"
          dateFormat="MMMM d, yyyy"
          placeholderText="Select a Date"
        />

        {/* Time Slot Dropdown */}
        <label className="text-white text-3xl mb-4">Select Time Slot:</label>
        <select
          className="p-4 border rounded-md mb-8 w-full sm:w-96 text-xl bg-black text-white appearance-none"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        >
          <option value="">Select a Time Slot</option>
          <option value="09:00 AM">09:00 AM - 11:00 AM</option>
          <option value="11:00 AM">11:00 AM - 01:00 PM</option>
          <option value="01:00 PM">01:00 PM - 03:00 PM</option>
          <option value="03:00 PM">03:00 PM - 05:00 PM</option>
          <option value="05:00 PM">05:00 PM - 07:00 PM</option>
          <option value="07:00 PM">07:00 PM - 09:00 PM</option>
        </select>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          className="mt-4 p-4 bg-[#8C7427] text-white text-2xl rounded-md w-full sm:w-96"
        >
          Proceed
        </button>

        {/* Modify or Cancel Reservation Link */}
      </div>

      {/* Right Side (Image with Text) */}
      <div className="flex flex-col items-center justify-center w-full sm:w-1/2 relative min-h-[500px]">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url(${food1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for text */}
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-50 text-white p-8 text-center">
            <h2 className="text-4xl font-bold mb-4">Rise and Dine</h2>
            <p className="text-lg">Start your day with a feast of flavors.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;