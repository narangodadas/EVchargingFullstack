import React from "react";
import BookingForm from "../../Components/Booking/BookingForm";
import BookingList from "../../Components/Booking/BookingList";

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-8">
        Booking Management
      </h1>
      <BookingForm onSuccess={() => window.location.reload()} />
      <BookingList />
    </div>
  );
};

export default BookingPage;