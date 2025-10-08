import React from "react";
import BookingForm from "../../Components/Booking/BookingForm";
import BookingList from "../../Components/Booking/BookingList";
import Sidebar from "../../Components/Layout/Sidebar";

const BookingPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 transition-all">
    <div className="min-h-screen bg-gray-100 py-8">

      <h1 className="text-3xl font-bold text-center text-green-700 mb-8">
        Booking Management
      </h1>
      <BookingForm onSuccess={() => window.location.reload()} />
      <BookingList />
    </div>
    </div>
    </div>
  );
};

export default BookingPage;