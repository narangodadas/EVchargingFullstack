package com.example.evchargingmobileapp.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import com.example.evchargingmobileapp.models.User;
import com.example.evchargingmobileapp.models.Booking;
import com.example.evchargingmobileapp.models.Station;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "EVChargingDB";
    private static final int DATABASE_VERSION = 1;

    // User Table
    private static final String TABLE_USERS = "users";
    private static final String KEY_NIC = "nic";
    private static final String KEY_NAME = "name";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_PASSWORD = "password";
    private static final String KEY_ROLE = "role";
    private static final String KEY_IS_ACTIVE = "is_active";
    private static final String KEY_CREATED_AT = "created_at";

    // Booking Table
    private static final String TABLE_BOOKINGS = "bookings";
    private static final String KEY_ID = "id";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_STATION_ID = "station_id";
    private static final String KEY_STATION_NAME = "station_name";
    private static final String KEY_BOOKING_DATE = "booking_date";
    private static final String KEY_START_TIME = "start_time";
    private static final String KEY_END_TIME = "end_time";
    private static final String KEY_STATUS = "status";
    private static final String KEY_VEHICLE_TYPE = "vehicle_type";
    private static final String KEY_TOTAL_COST = "total_cost";
    private static final String KEY_QR_CODE = "qr_code";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Create Users Table
        String CREATE_USERS_TABLE = "CREATE TABLE " + TABLE_USERS + "("
                + KEY_NIC + " TEXT PRIMARY KEY,"
                + KEY_NAME + " TEXT,"
                + KEY_EMAIL + " TEXT,"
                + KEY_PASSWORD + " TEXT,"
                + KEY_ROLE + " TEXT,"
                + KEY_IS_ACTIVE + " INTEGER,"
                + KEY_CREATED_AT + " TEXT" + ")";
        db.execSQL(CREATE_USERS_TABLE);

        // Create Bookings Table
        String CREATE_BOOKINGS_TABLE = "CREATE TABLE " + TABLE_BOOKINGS + "("
                + KEY_ID + " TEXT PRIMARY KEY,"
                + KEY_USER_ID + " TEXT,"
                + KEY_STATION_ID + " TEXT,"
                + KEY_STATION_NAME + " TEXT,"
                + KEY_BOOKING_DATE + " TEXT,"
                + KEY_START_TIME + " TEXT,"
                + KEY_END_TIME + " TEXT,"
                + KEY_STATUS + " TEXT,"
                + KEY_VEHICLE_TYPE + " TEXT,"
                + KEY_TOTAL_COST + " REAL,"
                + KEY_QR_CODE + " TEXT" + ")";
        db.execSQL(CREATE_BOOKINGS_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_USERS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_BOOKINGS);
        onCreate(db);
    }

    // User Management Methods
    public void addUser(User user) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(KEY_NIC, user.getNic());
        values.put(KEY_NAME, user.getName());
        values.put(KEY_EMAIL, user.getEmail());
        values.put(KEY_PASSWORD, user.getPassword());
        values.put(KEY_ROLE, user.getRole());
        values.put(KEY_IS_ACTIVE, user.isActive() ? 1 : 0);
        values.put(KEY_CREATED_AT, user.getCreatedAt());

        db.insert(TABLE_USERS, null, values);
        db.close();
    }

    public User getUser(String nic) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_USERS, null, KEY_NIC + "=?",
                new String[]{nic}, null, null, null);

        if (cursor != null && cursor.moveToFirst()) {
            User user = new User();
            user.setNic(cursor.getString(0));
            user.setName(cursor.getString(1));
            user.setEmail(cursor.getString(2));
            user.setPassword(cursor.getString(3));
            user.setRole(cursor.getString(4));
            user.setActive(cursor.getInt(5) == 1);
            user.setCreatedAt(cursor.getString(6));
            cursor.close();
            return user;
        }
        return null;
    }

    // Booking Management Methods
    public void addBooking(Booking booking) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(KEY_ID, booking.getId());
        values.put(KEY_USER_ID, booking.getUserId());
        values.put(KEY_STATION_ID, booking.getStationId());
        values.put(KEY_STATION_NAME, booking.getStationName());
        values.put(KEY_BOOKING_DATE, booking.getBookingDate());
        values.put(KEY_START_TIME, booking.getStartTime());
        values.put(KEY_END_TIME, booking.getEndTime());
        values.put(KEY_STATUS, booking.getStatus());
        values.put(KEY_VEHICLE_TYPE, booking.getVehicleType());
        values.put(KEY_TOTAL_COST, booking.getTotalCost());
        values.put(KEY_QR_CODE, booking.getQrCodeData());

        db.insert(TABLE_BOOKINGS, null, values);
        db.close();
    }

    public Cursor getUserBookings(String userId) {
        SQLiteDatabase db = this.getReadableDatabase();
        return db.query(TABLE_BOOKINGS, null, KEY_USER_ID + "=?",
                new String[]{userId}, null, null, KEY_BOOKING_DATE + " DESC");
    }

    // NEW: Update Booking Method
    public void updateBooking(Booking booking) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(KEY_STATION_ID, booking.getStationId());
        values.put(KEY_STATION_NAME, booking.getStationName());
        values.put(KEY_BOOKING_DATE, booking.getBookingDate());
        values.put(KEY_START_TIME, booking.getStartTime());
        values.put(KEY_END_TIME, booking.getEndTime());
        values.put(KEY_STATUS, booking.getStatus());
        values.put(KEY_VEHICLE_TYPE, booking.getVehicleType());
        values.put(KEY_TOTAL_COST, booking.getTotalCost());
        values.put(KEY_QR_CODE, booking.getQrCodeData());

        db.update(TABLE_BOOKINGS, values, KEY_ID + "=?", new String[]{booking.getId()});
        db.close();
    }
}