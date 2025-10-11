package com.example.evchargingmobileapp.database;

import android.content.Context;
import android.database.Cursor;
import com.example.evchargingmobileapp.models.User;
import com.example.evchargingmobileapp.models.Booking;
import java.util.ArrayList;
import java.util.List;

public class DatabaseManager {
    private DatabaseHelper dbHelper;

    public DatabaseManager(Context context) {
        dbHelper = new DatabaseHelper(context);
    }

    // User Operations
    public boolean addUser(User user) {
        try {
            dbHelper.addUser(user);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public User getUser(String nic) {
        return dbHelper.getUser(nic);
    }

    // Booking Operations
    public boolean addBooking(Booking booking) {
        try {
            dbHelper.addBooking(booking);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Booking> getUserBookings(String userId) {
        List<Booking> bookings = new ArrayList<>();
        Cursor cursor = dbHelper.getUserBookings(userId);

        if (cursor != null && cursor.moveToFirst()) {
            do {
                Booking booking = new Booking();
                booking.setId(cursor.getString(0));
                booking.setUserId(cursor.getString(1));
                booking.setStationId(cursor.getString(2));
                booking.setStationName(cursor.getString(3));
                booking.setBookingDate(cursor.getString(4));
                booking.setStartTime(cursor.getString(5));
                booking.setEndTime(cursor.getString(6));
                booking.setStatus(cursor.getString(7));
                booking.setVehicleType(cursor.getString(8));
                booking.setTotalCost(cursor.getDouble(9));
                booking.setQrCodeData(cursor.getString(10));

                bookings.add(booking);
            } while (cursor.moveToNext());
            cursor.close();
        }
        return bookings;
    }

    // Add method
    public void updateBooking(Booking booking) {
        try {
            dbHelper.updateBooking(booking);  // Implement in DatabaseHelper: UPDATE bookings SET ... WHERE id=?
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}