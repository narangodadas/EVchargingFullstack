/*******************************************************
 *file :         BookingActivity.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.database.DatabaseManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.Booking;
import com.example.evchargingmobileapp.models.Station;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class BookingActivity extends AppCompatActivity {

    private Spinner spinnerStations;
    private EditText etVehicleType, etBookingDate, etStartTime, etEndTime;
    private TextView tvCost, tvSelectedStation, tvStationLabel;
    private Button btnCreateBooking;
    private ProgressBar progressBar;
    private LinearLayout stationContainer;

    private ApiManager apiManager;
    private DatabaseManager databaseManager;
    private String userNIC;

    private Calendar calendar;
    private SimpleDateFormat dateFormat, timeFormat;

    private List<Station> stationsList;
    private Map<String, String> nameToIdMap;

    // Variables for pre-selected station
    private String selectedStationId;
    private String selectedStationName;
    private String selectedStationLocation;
    private boolean isStationPreSelected = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking);

        // Get user NIC from intent
        userNIC = getIntent().getStringExtra("USER_NIC");

        // Check if station is pre-selected from dashboard
        selectedStationId = getIntent().getStringExtra("SELECTED_STATION_ID");
        selectedStationName = getIntent().getStringExtra("SELECTED_STATION_NAME");
        selectedStationLocation = getIntent().getStringExtra("SELECTED_STATION_LOCATION");

        isStationPreSelected = selectedStationId != null && !selectedStationId.isEmpty();

        apiManager = new ApiManager(this);
        databaseManager = new DatabaseManager(this);

        calendar = Calendar.getInstance();
        dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());

        stationsList = new ArrayList<>();
        nameToIdMap = new HashMap<>();

        initViews();
        setupClickListeners();

        if (isStationPreSelected) {
            // If station is pre-selected, show it directly
            showPreSelectedStation();
        } else {
            // Otherwise load all stations for spinner
            loadStations();
        }
    }

    private void initViews() {
        spinnerStations = findViewById(R.id.spinnerStations);
        etVehicleType = findViewById(R.id.etVehicleType);
        etBookingDate = findViewById(R.id.etBookingDate);
        etStartTime = findViewById(R.id.etStartTime);
        etEndTime = findViewById(R.id.etEndTime);
        //tvCost = findViewById(R.id.tvCost);
        btnCreateBooking = findViewById(R.id.btnCreateBooking);
        progressBar = findViewById(R.id.progressBar);
        tvSelectedStation = findViewById(R.id.tvSelectedStation);
        tvStationLabel = findViewById(R.id.tvStationLabel);
        stationContainer = findViewById(R.id.mainLayout); // Use the main LinearLayout from XML
    }

    private void showPreSelectedStation() {
        // Hide the spinner and show the pre-selected station
        spinnerStations.setVisibility(View.GONE);
        tvSelectedStation.setVisibility(View.VISIBLE);

        // Update station label to show it's pre-selected
        tvStationLabel.setText("Selected Station");

        // Set the station information
        String stationInfo = selectedStationName;
        if (selectedStationLocation != null && !selectedStationLocation.isEmpty()) {
            stationInfo += "\n" + selectedStationLocation;
        }
        tvSelectedStation.setText(stationInfo);
    }

    private void setupClickListeners() {
        // Date picker
        etBookingDate.setOnClickListener(v -> showDatePicker());

        // Start time picker
        etStartTime.setOnClickListener(v -> showTimePicker(etStartTime));

        // End time picker
        etEndTime.setOnClickListener(v -> showTimePicker(etEndTime));

        // Create booking button
        btnCreateBooking.setOnClickListener(v -> createBooking());
    }



    private void loadStations() {
        if (apiManager.isNetworkAvailable()) {
            apiManager.getAllStations(new ApiCallback<List<Station>>() {
                @Override
                public void onSuccess(List<Station> stations) {
                    stationsList = stations;
                    List<String> names = new ArrayList<>();
                    nameToIdMap.clear();
                    for (Station s : stations) {
                        names.add(s.getName());
                        nameToIdMap.put(s.getName(), s.getId() != null ? s.getId() : "default_id");
                    }
                    ArrayAdapter<String> adapter = new ArrayAdapter<>(BookingActivity.this,
                            android.R.layout.simple_spinner_item, names);
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                    spinnerStations.setAdapter(adapter);

                    // If we have a pre-selected station, try to select it in spinner
                    if (isStationPreSelected && selectedStationName != null) {
                        for (int i = 0; i < names.size(); i++) {
                            if (names.get(i).equals(selectedStationName)) {
                                spinnerStations.setSelection(i);
                                break;
                            }
                        }
                    }
                }

                @Override
                public void onError(String errorMessage) {
                    // Remove mock stations - just show empty spinner
                    stationsList = new ArrayList<>();
                    List<String> stationNames = new ArrayList<>();
                    stationNames.add("No stations available");

                    ArrayAdapter<String> adapter = new ArrayAdapter<>(BookingActivity.this,
                            android.R.layout.simple_spinner_item, stationNames);
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                    spinnerStations.setAdapter(adapter);

                    Toast.makeText(BookingActivity.this, "Failed to load stations", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            // Remove mock stations - just show empty spinner
            stationsList = new ArrayList<>();
            List<String> stationNames = new ArrayList<>();
            stationNames.add("No internet connection");

            ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                    android.R.layout.simple_spinner_item, stationNames);
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spinnerStations.setAdapter(adapter);
        }
    }



    private void showDatePicker() {
        DatePickerDialog datePicker = new DatePickerDialog(
                this,
                (view, year, month, dayOfMonth) -> {
                    calendar.set(Calendar.YEAR, year);
                    calendar.set(Calendar.MONTH, month);
                    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                    etBookingDate.setText(dateFormat.format(calendar.getTime()));
                    //calculateCost();
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );

        // Set minimum date to today
        datePicker.getDatePicker().setMinDate(System.currentTimeMillis());
        // Set maximum date to 7 days from today
        calendar.add(Calendar.DAY_OF_MONTH, 7);
        datePicker.getDatePicker().setMaxDate(calendar.getTimeInMillis());
        calendar.add(Calendar.DAY_OF_MONTH, -7); // Reset calendar

        datePicker.show();
    }

    private void showTimePicker(EditText editText) {
        TimePickerDialog timePicker = new TimePickerDialog(
                this,
                (view, hourOfDay, minute) -> {
                    calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                    calendar.set(Calendar.MINUTE, minute);
                    editText.setText(timeFormat.format(calendar.getTime()));
                    //calculateCost();
                },
                calendar.get(Calendar.HOUR_OF_DAY),
                calendar.get(Calendar.MINUTE),
                true
        );
        timePicker.show();
    }


    private void createBooking() {
        String stationName;
        String stationId;

        if (isStationPreSelected) {
            // Use the pre-selected station
            stationName = selectedStationName;
            stationId = selectedStationId;
        } else {
            // Use the station from spinner
            stationName = spinnerStations.getSelectedItem().toString();
            stationId = nameToIdMap.get(stationName);
        }

        String vehicleType = etVehicleType.getText().toString().trim();
        String bookingDate = etBookingDate.getText().toString().trim();
        String startTime = etStartTime.getText().toString().trim();
        String endTime = etEndTime.getText().toString().trim();

        if (stationName.isEmpty() || vehicleType.isEmpty() ||
                bookingDate.isEmpty() || startTime.isEmpty() || endTime.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        if (stationId == null) {
            stationId = "station123"; // Fallback
        }

//

        // Construct full ISO DateTime strings for backend
        String fullStartTime = bookingDate + "T" + startTime + ":00.000Z";
        String fullEndTime = bookingDate + "T" + endTime + ":00.000Z";

        showProgress(true);

        // Create booking object
        Booking booking = new Booking();
        booking.setUserId(userNIC);
        booking.setStationId(stationId);
        booking.setStationName(stationName);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(fullStartTime);
        booking.setEndTime(fullEndTime);
        booking.setVehicleType(vehicleType);
        //booking.setTotalCost((float) cost);
        booking.setStatus("pending");

        if (apiManager.isNetworkAvailable()) {
            apiManager.createBooking(booking, new ApiCallback<ApiResponse>() {
                @Override
                public void onSuccess(ApiResponse response) {
                    showProgress(false);
                    handleBookingSuccess(booking);
                }

                @Override
                public void onError(String errorMessage) {
                    showProgress(false);
                    Toast.makeText(BookingActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            // Offline booking
            boolean success = databaseManager.addBooking(booking);
            showProgress(false);

            if (success) {
                handleBookingSuccess(booking);
            } else {
                Toast.makeText(this, "Booking creation failed", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void handleBookingSuccess(Booking booking) {
        Toast.makeText(this, "Booking created successfully!", Toast.LENGTH_SHORT).show();

        // Navigate back to dashboard
        Intent intent = new Intent(BookingActivity.this, DashboardActivity.class);
        intent.putExtra("USER_NIC", userNIC);
        intent.putExtra("USER_TYPE", "evowner");
        startActivity(intent);
        finish();
    }

    private void showProgress(boolean show) {
        progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        btnCreateBooking.setEnabled(!show);
    }
}