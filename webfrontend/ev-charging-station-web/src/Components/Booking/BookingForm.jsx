import React, { useState } from "react";
import { createBooking } from "../../services/bookingApi";

const BookingForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: "",
    stationId: "",
    startTime: "",
    endTime: "",
    vehicleType: "",
    totalCost: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking(formData);
      setMessage("Booking created successfully ✅");
      setFormData({
        userId: "",
        stationId: "",
        startTime: "",
        endTime: "",
        vehicleType: "",
        totalCost: "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to create booking ❌");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {["userId", "stationId", "vehicleType", "totalCost"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            value={formData[field]}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-400"
            required
          />
        ))}

        <label className="block text-gray-700">Start Time</label>
        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          required
        />

        <label className="block text-gray-700">End Time</label>
        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Create Booking
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default BookingForm;