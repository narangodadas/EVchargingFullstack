import React from "react";

const BookingCard = ({ booking, onCancel }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-3">
      <h3 className="text-lg font-semibold text-green-600">
        {booking.vehicleType} ({booking.status})
      </h3>
      <p>User ID: {booking.userId}</p>
      <p>Station ID: {booking.stationId}</p>
      <p>Start: {new Date(booking.startTime).toLocaleString()}</p>
      <p>End: {new Date(booking.endTime).toLocaleString()}</p>
      <p>Total Cost: ${booking.totalCost}</p>

      {booking.status === "pending" && (
        <button
          onClick={() => onCancel(booking.id)}
          className="mt-3 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default BookingCard;