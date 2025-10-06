import React, { useEffect, useState } from "react";
import { getBookings, cancelBooking } from "../../services/bookingApi";
import BookingCard from "./BookingCard";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await getBookings();
      setBookings(res.data);
    } catch (err) {
      setMessage("Failed to load bookings");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      setMessage("Booking cancelled successfully ✅");
      fetchBookings();
    } catch (err) {
      setMessage("Error cancelling booking ❌");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Bookings</h2>
      {message && <p className="text-center text-gray-600 mb-3">{message}</p>}
      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings found.</p>
      ) : (
        bookings.map((b) => (
          <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
        ))
      )}
    </div>
  );
};

export default BookingList;