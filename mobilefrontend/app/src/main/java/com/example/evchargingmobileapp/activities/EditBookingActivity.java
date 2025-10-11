/*******************************************************
 *file :         EditBookingActivity.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.database.DatabaseManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.Booking;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class EditBookingActivity extends AppCompatActivity {

    private EditText etVehicleType, etBookingDate, etStartTime, etEndTime;
    private TextView tvStationName, tvCost;
    private Button btnUpdateBooking;
    private ProgressBar progressBar;

    private ApiManager apiManager;
    private DatabaseManager databaseManager;
    private String userNIC, bookingId;
    private Booking originalBooking;

    private Calendar calendar;
    private SimpleDateFormat dateFormat, timeFormat;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_booking);

        originalBooking = (Booking) getIntent().getSerializableExtra("BOOKING");
        userNIC = getIntent().getStringExtra("USER_NIC");
        bookingId = originalBooking.getId();

        apiManager = new ApiManager(this);
        databaseManager = new DatabaseManager(this);

        calendar = Calendar.getInstance();
        dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());

        initViews();
        setupClickListeners();
        loadBookingData();
    }

    private void initViews() {
        tvStationName = findViewById(R.id.tvStationName);
        etVehicleType = findViewById(R.id.etVehicleType);
        etBookingDate = findViewById(R.id.etBookingDate);
        etStartTime = findViewById(R.id.etStartTime);
        etEndTime = findViewById(R.id.etEndTime);
        btnUpdateBooking = findViewById(R.id.btnUpdateBooking);
        progressBar = findViewById(R.id.progressBar);

//        // Check if tvCost exists in layout
//        tvCost = findViewById(R.id.tvCost);
//        if (tvCost == null) {
//            Log.d("EditBooking", "tvCost TextView not found in layout");
//        }
    }

    private void setupClickListeners() {
        // Date picker
        etBookingDate.setOnClickListener(v -> showDatePicker());

        // Start time picker
        etStartTime.setOnClickListener(v -> showTimePicker(etStartTime));

        // End time picker
        etEndTime.setOnClickListener(v -> showTimePicker(etEndTime));

        // Update booking button
        btnUpdateBooking.setOnClickListener(v -> updateBooking());
    }

    private void loadBookingData() {
        if (originalBooking != null) {
            // Set station name (read-only)
            if (originalBooking.getStationName() != null) {
                tvStationName.setText(originalBooking.getStationName());
            }

            etVehicleType.setText(originalBooking.getVehicleType());

            // Use startTime for booking date instead of bookingDate
            String bookingDate = extractDateFromDateTime(originalBooking.getStartTime());
            etBookingDate.setText(bookingDate);

            // Better time parsing
            if (originalBooking.getStartTime() != null) {
                String startTime = formatTimeForEdit(originalBooking.getStartTime());
                etStartTime.setText(startTime);
            }
            if (originalBooking.getEndTime() != null) {
                String endTime = formatTimeForEdit(originalBooking.getEndTime());
                etEndTime.setText(endTime);
            }

            // Only calculate cost if tvCost exists
            if (tvCost != null) {
                //calculateCost();
            }

            Log.d("EditBooking", "Booking data loaded successfully");
            Log.d("EditBooking", "Station: " + originalBooking.getStationName());
        }
    }

    private String extractDateFromDateTime(String dateTime) {
        try {
            if (dateTime.contains("T")) {
                // Extract date part from ISO format: "2025-10-10T17:43:00.000+00:00" -> "2025-10-10"
                return dateTime.substring(0, 10);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Fallback to original booking date if extraction fails
        return originalBooking.getBookingDate();
    }

    private String formatTimeForEdit(String time) {
        // Convert "10:00:00" or "2024-01-15T10:00:00.000Z" to "10:00"
        try {
            if (time.contains("T")) {
                // ISO format: "2024-01-15T10:00:00.000Z"
                return time.substring(11, 16); // Get "10:00"
            } else {
                // Simple time format: "10:00:00"
                return time.substring(0, 5); // Get "10:00"
            }
        } catch (Exception e) {
            return time;
        }
    }

    private void showDatePicker() {
        // Set initial date from current booking date
        Calendar initialCalendar = Calendar.getInstance();
        try {
            String currentDate = etBookingDate.getText().toString();
            if (!currentDate.isEmpty()) {
                initialCalendar.setTime(dateFormat.parse(currentDate));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        DatePickerDialog datePicker = new DatePickerDialog(
                this,
                (view, year, month, dayOfMonth) -> {
                    calendar.set(Calendar.YEAR, year);
                    calendar.set(Calendar.MONTH, month);
                    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                    etBookingDate.setText(dateFormat.format(calendar.getTime()));
                    // Only calculate cost if tvCost exists
                    if (tvCost != null) {
                        //calculateCost();
                    }
                },
                initialCalendar.get(Calendar.YEAR),
                initialCalendar.get(Calendar.MONTH),
                initialCalendar.get(Calendar.DAY_OF_MONTH)
        );

        // Set minimum date to today
        datePicker.getDatePicker().setMinDate(System.currentTimeMillis());
        // Set maximum date to 7 days from today
        Calendar maxDate = Calendar.getInstance();
        maxDate.add(Calendar.DAY_OF_MONTH, 7);
        datePicker.getDatePicker().setMaxDate(maxDate.getTimeInMillis());

        datePicker.show();
    }

    private void showTimePicker(EditText editText) {
        // Set initial time from current field value
        Calendar initialCalendar = Calendar.getInstance();
        try {
            String currentTime = editText.getText().toString();
            if (!currentTime.isEmpty()) {
                String[] timeParts = currentTime.split(":");
                int hour = Integer.parseInt(timeParts[0]);
                int minute = Integer.parseInt(timeParts[1]);
                initialCalendar.set(Calendar.HOUR_OF_DAY, hour);
                initialCalendar.set(Calendar.MINUTE, minute);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        TimePickerDialog timePicker = new TimePickerDialog(
                this,
                (view, hourOfDay, minute) -> {
                    calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                    calendar.set(Calendar.MINUTE, minute);
                    editText.setText(timeFormat.format(calendar.getTime()));
                    // Only calculate cost if tvCost exists
                    if (tvCost != null) {
                        //calculateCost();
                    }
                },
                initialCalendar.get(Calendar.HOUR_OF_DAY),
                initialCalendar.get(Calendar.MINUTE),
                true
        );
        timePicker.show();
    }



    private void updateBooking() {
        String vehicleType = etVehicleType.getText().toString().trim();
        String bookingDate = etBookingDate.getText().toString().trim();
        String startTime = etStartTime.getText().toString().trim();
        String endTime = etEndTime.getText().toString().trim();

        // Validation
        if (vehicleType.isEmpty()) {
            etVehicleType.setError("Please enter vehicle type");
            return;
        }

        if (bookingDate.isEmpty()) {
            etBookingDate.setError("Please select booking date");
            return;
        }

        if (startTime.isEmpty()) {
            etStartTime.setError("Please select start time");
            return;
        }

        if (endTime.isEmpty()) {
            etEndTime.setError("Please select end time");
            return;
        }

        // Calculate cost
        double cost = 0.0;
        try {
            SimpleDateFormat format = new SimpleDateFormat("HH:mm", Locale.getDefault());
            long diff = format.parse(endTime).getTime() - format.parse(startTime).getTime();
            long hours = diff / (60 * 60 * 1000);
            cost = hours * 5.0;
        } catch (Exception e) {
            cost = originalBooking.getTotalCost();
            Log.e("EditBooking", "Error calculating cost: " + e.getMessage());
        }

        // Construct full ISO DateTime strings for backend
        String fullStartTime = bookingDate + "T" + startTime + ":00.000Z";
        String fullEndTime = bookingDate + "T" + endTime + ":00.000Z";

        showProgress(true);

        // Create updated booking object - keep original station info
        Booking updatedBooking = new Booking();
        updatedBooking.setId(bookingId);
        updatedBooking.setUserId(userNIC);
        updatedBooking.setStationId(originalBooking.getStationId());
        updatedBooking.setStationName(originalBooking.getStationName());
        updatedBooking.setBookingDate(bookingDate);
        updatedBooking.setStartTime(fullStartTime);
        updatedBooking.setEndTime(fullEndTime);
        updatedBooking.setVehicleType(vehicleType);
        updatedBooking.setTotalCost(cost);
        updatedBooking.setStatus(originalBooking.getStatus());
        updatedBooking.setQrCodeData(originalBooking.getQrCodeData()); // Preserve QR code

        Log.d("EditBooking", "Updating booking: " + updatedBooking.getId());
        Log.d("EditBooking", "Station: " + originalBooking.getStationName() + " (" + originalBooking.getStationId() + ")");
        Log.d("EditBooking", "Time: " + fullStartTime + " to " + fullEndTime);

        if (apiManager.isNetworkAvailable()) {
            apiManager.updateBooking(bookingId, updatedBooking, new ApiCallback<ApiResponse>() {
                @Override
                public void onSuccess(ApiResponse response) {
                    showProgress(false);
                    Toast.makeText(EditBookingActivity.this, "Booking updated successfully!", Toast.LENGTH_SHORT).show();

                    // Return the updated booking to previous activity
                    Intent resultIntent = new Intent();
                    resultIntent.putExtra("UPDATED_BOOKING", updatedBooking);
                    setResult(RESULT_OK, resultIntent);
                    finish();
                }

                @Override
                public void onError(String errorMessage) {
                    showProgress(false);
                    Log.e("EditBooking", "Update failed: " + errorMessage);
                    Toast.makeText(EditBookingActivity.this, "Update failed: " + errorMessage, Toast.LENGTH_SHORT).show();

                    // Fallback to local update
                    try {
                        databaseManager.updateBooking(updatedBooking);
                        Toast.makeText(EditBookingActivity.this, "Saved locally (offline)", Toast.LENGTH_SHORT).show();
                        setResult(RESULT_OK);
                        finish();
                    } catch (Exception e) {
                        Toast.makeText(EditBookingActivity.this, "Failed to save locally", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        } else {
            // Offline update
            try {
                databaseManager.updateBooking(updatedBooking);
                showProgress(false);
                Toast.makeText(this, "Booking updated locally (offline)", Toast.LENGTH_SHORT).show();
                setResult(RESULT_OK);
                finish();
            } catch (Exception e) {
                showProgress(false);
                Toast.makeText(this, "Failed to save locally: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void showProgress(boolean show) {
        progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        btnUpdateBooking.setEnabled(!show);
    }
}