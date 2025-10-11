import React, { useState } from "react";
import { PlusCircle, Clock, Zap, MapPin, User } from "lucide-react";
import Sidebar from "../../Components/Layout/Sidebar";
import BookingForm from "../../Components/Booking/BookingForm";

const BookingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🧩 Dummy bookings data
  const dummyBookings = [
    {
      id: "BK001",
      user: "John Doe",
      station: "ChargeNet - Colombo 01",
      slotTime: "2025-10-10 09:00 AM",
      status: "Completed",
    },
    {
      id: "BK002",
      user: "Sarah Lee",
      station: "ChargeNet - Kandy Central",
      slotTime: "2025-10-11 02:00 PM",
      status: "Pending",
    },
    {
      id: "BK003",
      user: "Ravi Kumar",
      station: "ChargeNet - Galle",
      slotTime: "2025-10-12 04:30 PM",
      status: "Ongoing",
    },
  ];

  const handleNewBooking = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleBookingSuccess = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-8 space-y-8 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600">Manage and monitor EV charging bookings efficiently</p>
          </div>
          <button
            onClick={handleNewBooking}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Booking
          </button>
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Bookings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{booking.id}</h3>
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium ${
                      booking.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">{booking.user}</span>
                  </p>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {booking.station}
                  </p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {booking.slotTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Create New Booking
            </h2>

            <BookingForm onSuccess={handleBookingSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;