/*******************************************************
 *file :         BookingDetailsActivity.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.Booking;

public class BookingDetailsActivity extends AppCompatActivity {

    private TextView tvDetails;
    private Button btnEdit, btnCancel, btnGenerateQR;
    private ApiManager apiManager;
    private Booking booking;
    private String userNIC;
    private static final String TAG = "BookingDetailsActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_details);

        initializeData();
        initializeViews();
        displayBookingDetails();
        setupButtonActions();
    }

    private void initializeData() {
        booking = (Booking) getIntent().getSerializableExtra("BOOKING");
        userNIC = getIntent().getStringExtra("USER_NIC");

        if (booking == null) {
            Toast.makeText(this, "Booking details not found!", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        apiManager = new ApiManager(this);

        Log.d(TAG, "Booking loaded - ID: " + booking.getId() + ", Status: " + booking.getStatus());
    }

    private void initializeViews() {
        tvDetails = findViewById(R.id.tvDetails);
        btnEdit = findViewById(R.id.btnEdit);
        btnCancel = findViewById(R.id.btnCancel);
        btnGenerateQR = findViewById(R.id.btnGenerateQR);
    }

    private void displayBookingDetails() {
        String details = " Station: " + booking.getStationName() +
                "\n Date: " + formatDateForDisplay(booking.getStartTime()) + // Use startTime for date
                "\n Time: " + formatTimeForDisplay(booking.getStartTime()) + " - " + formatTimeForDisplay(booking.getEndTime()) +
                //"\n Vehicle: " + booking.getVehicleType() +
                //"\n Cost: $" + String.format("%.2f", booking.getTotalCost()) +
                "\n Status: " + getStatusWithIcon(booking.getStatus()) +
                "\n\n Booking ID: " + booking.getId();

        tvDetails.setText(details);
    }

    private String formatDateForDisplay(String dateTime) {
        try {
            if (dateTime.contains("T")) {
                String datePart = dateTime.substring(0, 10); // Get yyyy-MM-dd from startTime
                // Convert yyyy-MM-dd to dd/MM/yyyy
                String[] parts = datePart.split("-");
                if (parts.length == 3) {
                    return parts[2] + "/" + parts[1] + "/" + parts[0]; // dd/MM/yyyy
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "Unknown Date";
    }

    private String formatTimeForDisplay(String time) {
        try {
            if (time.contains("T")) {
                String timePart = time.substring(11, 16);
                return format12HourTime(timePart);
            } else if (time.length() >= 5) {
                return format12HourTime(time.substring(0, 5));
            } else {
                return time;
            }
        } catch (Exception e) {
            return time;
        }
    }

    private String format12HourTime(String time24) {
        try {
            String[] parts = time24.split(":");
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);

            String period = hour < 12 ? "AM" : "PM";
            if (hour == 0) {
                hour = 12;
            } else if (hour > 12) {
                hour = hour - 12;
            }

            return String.format("%d:%02d %s", hour, minute, period);
        } catch (Exception e) {
            return time24;
        }
    }

    private String getStatusWithIcon(String status) {
        if (status == null) return "Pending";

        switch (status.toLowerCase()) {
            case "confirmed":
                return "Confirmed";
            case "completed":
                return "Completed";
            case "cancelled":
                return "Cancelled";
            default:
                return  status;
        }
    }

    private void setupButtonActions() {
        String status = booking.getStatus() != null ? booking.getStatus().toLowerCase() : "pending";

        Log.d(TAG, "Setting up buttons for status: " + status);

        setupEditButton(status);
        setupCancelButton(status);
        setupQRButton(status);

        checkNoActionsScenario();
    }

    private void setupEditButton(String status) {
        if ("pending".equals(status)) {
            btnEdit.setVisibility(View.VISIBLE);
            btnEdit.setOnClickListener(v -> navigateToEditBooking());
        } else {
            btnEdit.setVisibility(View.GONE);
        }
    }

    private void setupCancelButton(String status) {
        if ("pending".equals(status)) {
            btnCancel.setVisibility(View.VISIBLE);
            btnCancel.setOnClickListener(v -> showCancelDialog());
        } else {
            btnCancel.setVisibility(View.GONE);
        }
    }

    private void setupQRButton(String status) {
        // Only show QR for confirmed bookings that are NOT completed
        if ("confirmed".equals(status) && !booking.isCompleted()) {
            btnGenerateQR.setVisibility(View.VISIBLE);
            btnGenerateQR.setOnClickListener(v -> generateQRCode());
        } else {
            btnGenerateQR.setVisibility(View.GONE);
        }
    }

    private void checkNoActionsScenario() {
        if (btnEdit.getVisibility() == View.GONE &&
                btnCancel.getVisibility() == View.GONE &&
                btnGenerateQR.getVisibility() == View.GONE) {

            showNoActionsMessage();
        }
    }

    private void showNoActionsMessage() {
        LinearLayout actionsLayout = findViewById(R.id.actionsLayout);
        if (actionsLayout != null) {
            TextView tvNoActions = new TextView(this);
            tvNoActions.setText("No actions available for this booking status");
            tvNoActions.setTextSize(14);
            tvNoActions.setTextColor(Color.GRAY);
            tvNoActions.setGravity(View.TEXT_ALIGNMENT_CENTER);
            tvNoActions.setPadding(0, 20, 0, 0);

            actionsLayout.addView(tvNoActions);
        }
    }

    private void navigateToEditBooking() {
        Intent intent = new Intent(this, EditBookingActivity.class);
        intent.putExtra("BOOKING", booking);
        intent.putExtra("USER_NIC", userNIC);
        startActivityForResult(intent, 1001);
    }

    private void generateQRCode() {
        Intent intent = new Intent(this, QRDisplayActivity.class);
        intent.putExtra("BOOKING_ID", booking.getId());
        intent.putExtra("STATION_NAME", booking.getStationName());
        intent.putExtra("BOOKING_TIME", formatBookingTimeForDisplay());
        startActivity(intent);
    }

    private String formatBookingTimeForDisplay() {
        return formatTimeForDisplay(booking.getStartTime()) + " - " + formatTimeForDisplay(booking.getEndTime());
    }

    private void showCancelDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Cancel Booking?")
                .setMessage("Are you sure you want to cancel this booking? This action cannot be undone.")
                .setPositiveButton("Yes, Cancel", (dialog, which) -> cancelBooking())
                .setNegativeButton("Keep Booking", null)
                .show();
    }

    private void cancelBooking() {
        showLoadingState(true);

        apiManager.cancelBooking(booking.getId(), new ApiCallback<ApiResponse>() {
            @Override
            public void onSuccess(ApiResponse response) {
                showLoadingState(false);
                Toast.makeText(BookingDetailsActivity.this, "Booking cancelled successfully!", Toast.LENGTH_SHORT).show();
                setResult(RESULT_OK);
                finish();
            }

            @Override
            public void onError(String errorMessage) {
                showLoadingState(false);

                if (errorMessage.contains("12 hours")) {
                    Toast.makeText(BookingDetailsActivity.this,
                            "Cannot cancel booking within 12 hours of start time", Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(BookingDetailsActivity.this,
                            "Failed to cancel: " + errorMessage, Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void showLoadingState(boolean show) {
        btnEdit.setEnabled(!show);
        btnCancel.setEnabled(!show);
        btnGenerateQR.setEnabled(!show);

        if (show) {
            btnCancel.setText("Cancelling...");
        } else {
            btnCancel.setText("Cancel Booking");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == 1001 && resultCode == RESULT_OK) {
            // Refresh if booking was updated
            if (data != null && data.hasExtra("UPDATED_BOOKING")) {
                booking = (Booking) data.getSerializableExtra("UPDATED_BOOKING");
                displayBookingDetails();
                setupButtonActions();
                Toast.makeText(this, "Booking updated successfully!", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        setResult(RESULT_CANCELED);
        finish();
    }
}