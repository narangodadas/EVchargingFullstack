import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5296"}/api/bookings`;

// Create a new booking
export const createBooking = async (booking) => {
  return await axios.post(API_BASE_URL, booking);
};

// Fetch all bookings (optional filters)
export const getBookings = async (stationId, userId) => {
  let url = API_BASE_URL;
  const params = [];
  if (stationId) params.push(`stationId=${stationId}`);
  if (userId) params.push(`userId=${userId}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  return await axios.get(url);
};

// Cancel a booking
export const cancelBooking = async (id) => {
  return await axios.patch(`${API_BASE_URL}/${id}/cancel`);
};