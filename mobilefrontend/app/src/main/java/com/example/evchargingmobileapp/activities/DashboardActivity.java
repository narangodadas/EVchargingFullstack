/*******************************************************
 *file :         DashboardActivity.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/
package com.example.evchargingmobileapp.activities;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.adapters.StationsAdapter;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.DashboardStats;
import com.example.evchargingmobileapp.models.Station;

import java.util.ArrayList;
import java.util.List;

public class DashboardActivity extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private FusedLocationProviderClient fusedLocationClient;
    private RecyclerView rvStations;
    private StationsAdapter stationsAdapter;
    private ApiManager apiManager;
    private String userNIC;
    private DashboardStats stats;
    private ImageButton ivStations, ivActivity, ivMore, btnLogout;
    private BottomSheetDialog moreDialog;
    private static final String TAG = "DashboardActivity";

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;
    private List<Station> currentStations = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Make status bar white with dark icons
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.WHITE);
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }

        setContentView(R.layout.activity_dashboard);

        // Get user data from login
        Intent intent = getIntent();
        userNIC = intent.getStringExtra("USER_NIC");

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        apiManager = new ApiManager(this);

        stats = new DashboardStats();

        initViews();
        setupClickListeners();
        loadUserStats();
        loadAllStationsFromDatabase();
        checkLocationPermission();
    }

    private void initViews() {
        rvStations = findViewById(R.id.rvStations);
        btnLogout = findViewById(R.id.btnLogout);

        // Setup RecyclerView
        stationsAdapter = new StationsAdapter(new ArrayList<>(), station -> {
            // Station click handler - navigate to booking with station pre-selected
            Intent bookingIntent = new Intent(DashboardActivity.this, BookingActivity.class);
            bookingIntent.putExtra("USER_NIC", userNIC);
            bookingIntent.putExtra("SELECTED_STATION_ID", station.getId());
            bookingIntent.putExtra("SELECTED_STATION_NAME", station.getName());
            bookingIntent.putExtra("SELECTED_STATION_LOCATION", station.getLocation());
            bookingIntent.putExtra("SELECTED_STATION_LAT", station.getLatitude());
            bookingIntent.putExtra("SELECTED_STATION_LNG", station.getLongitude());
            bookingIntent.putExtra("SELECTED_STATION_TYPE", station.getType());
            startActivity(bookingIntent);
        });
        rvStations.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        rvStations.setAdapter(stationsAdapter);

        // Bottom navigation
        ivStations = findViewById(R.id.ivStations);
        ivActivity = findViewById(R.id.ivActivity);
        ivMore = findViewById(R.id.ivMore);

        // Initialize map
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }
    }

    private void setupClickListeners() {
        ivStations.setOnClickListener(v -> {
            showStations();
        });

        ivActivity.setOnClickListener(v -> {
            Intent intent = new Intent(DashboardActivity.this, ViewBookingsActivity.class);
            intent.putExtra("USER_NIC", userNIC);
            startActivity(intent);
        });

        ivMore.setOnClickListener(v -> {
            showMoreDialog();
        });

        // Logout button click listener - Navigate to Profile
        btnLogout.setOnClickListener(v -> {
            Intent profileIntent = new Intent(DashboardActivity.this, ProfileActivity.class);
            profileIntent.putExtra("USER_NIC", userNIC);
            startActivity(profileIntent);
        });
    }

    private void performLogout() {
        Intent intent = new Intent(DashboardActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
    }

    private void showStations() {
        // Scroll to start of stations list
        if (stationsAdapter.getItemCount() > 0) {
            rvStations.smoothScrollToPosition(0);
        }
        // Highlight stations button
        ivStations.setImageTintList(ContextCompat.getColorStateList(this, android.R.color.white));
        ivStations.postDelayed(() -> ivStations.setImageTintList(ContextCompat.getColorStateList(this, android.R.color.white)), 200);
    }

    private void loadUserStats() {
        if (apiManager.isNetworkAvailable()) {
            apiManager.getUserStats(userNIC, new ApiCallback<DashboardStats>() {
                @Override
                public void onSuccess(DashboardStats s) {
                    stats = s;
                    updateStatsUI();
                }

                @Override
                public void onError(String errorMessage) {
                    stats.setPendingReservations(0);
                    stats.setApprovedReservations(0);
                    Toast.makeText(DashboardActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            // Offline mode
            stats.setPendingReservations(0);
            stats.setApprovedReservations(0);
            Toast.makeText(this, "Offline Mode", Toast.LENGTH_SHORT).show();
        }
    }

    private void updateStatsUI() {
        // Update any UI elements that show stats
        Log.d(TAG, "Stats updated - Pending: " + stats.getPendingReservations() +
                ", Approved: " + stats.getApprovedReservations());
    }

    private void showMoreDialog() {
        moreDialog = new BottomSheetDialog(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_more, null);
        TextView tvPendingCount = dialogView.findViewById(R.id.tvPendingCount);
        TextView tvApprovedCount = dialogView.findViewById(R.id.tvApprovedCount);
        tvPendingCount.setText(String.valueOf(stats.getPendingReservations()));
        tvApprovedCount.setText(String.valueOf(stats.getApprovedReservations()));

        // FIXED: Cast ViewParent to View
        View pendingCard = (View) tvPendingCount.getParent().getParent();
        View approvedCard = (View) tvApprovedCount.getParent().getParent();

        if (pendingCard != null) {
            pendingCard.setOnClickListener(v -> {
                // Navigate to pending bookings
                Intent intent = new Intent(DashboardActivity.this, ViewBookingsActivity.class);
                intent.putExtra("USER_NIC", userNIC);
                intent.putExtra("SHOW_PENDING", true);
                startActivity(intent);
                moreDialog.dismiss();
            });
        }

        if (approvedCard != null) {
            approvedCard.setOnClickListener(v -> {
                // Navigate to approved bookings
                Intent intent = new Intent(DashboardActivity.this, ViewBookingsActivity.class);
                intent.putExtra("USER_NIC", userNIC);
                intent.putExtra("SHOW_APPROVED", true);
                startActivity(intent);
                moreDialog.dismiss();
            });
        }

        moreDialog.setContentView(dialogView);
        moreDialog.show();
    }

    private void checkLocationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    LOCATION_PERMISSION_REQUEST_CODE);
        } else {
            getCurrentLocation();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                getCurrentLocation();
            } else {
                Toast.makeText(this, "Location permission denied. Showing all stations.", Toast.LENGTH_SHORT).show();
                // Still load stations even without location permission
            }
        }
    }

    private void getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(this, new OnSuccessListener<Location>() {
                    @Override
                    public void onSuccess(Location location) {
                        if (location != null) {
                            LatLng currentLatLng = new LatLng(location.getLatitude(), location.getLongitude());
                            Log.d(TAG, "Current location: " + location.getLatitude() + ", " + location.getLongitude());

                            if (mMap != null) {
                                mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(currentLatLng, 12));
                                addCurrentLocationMarker(currentLatLng);
                            }
                        } else {
                            Log.w(TAG, "Location is null, using default location");
                            setDefaultMapLocation();
                        }
                    }
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Failed to get location: " + e.getMessage());
                    setDefaultMapLocation();
                });
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Enable zoom controls
        mMap.getUiSettings().setZoomControlsEnabled(true);
        mMap.getUiSettings().setCompassEnabled(true);
        mMap.getUiSettings().setMyLocationButtonEnabled(true);

        // Check if location permission is granted for showing current location
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            mMap.setMyLocationEnabled(true);
        }

        // Set default map location
        setDefaultMapLocation();
    }

    private void setDefaultMapLocation() {
        // Default location (Colombo)
        LatLng defaultLocation = new LatLng(6.9271, 79.8612);
        if (mMap != null) {
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLocation, 10));
            addCurrentLocationMarker(defaultLocation);
        }
    }

    private void addCurrentLocationMarker(LatLng latLng) {
        if (mMap != null) {
            mMap.addMarker(new MarkerOptions()
                    .position(latLng)
                    .title("Your Location")
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_BLUE)));
        }
    }

    // NEW METHOD: Load all stations from database
    private void loadAllStationsFromDatabase() {
        Log.d(TAG, "Loading all stations from database...");

        if (apiManager.isNetworkAvailable()) {
            apiManager.getAllStations(new ApiCallback<List<Station>>() {
                @Override
                public void onSuccess(List<Station> stations) {
                    Log.d(TAG, "Successfully loaded " + (stations != null ? stations.size() : 0) + " stations from database");

                    if (stations == null || stations.isEmpty()) {
                        Toast.makeText(DashboardActivity.this, "No charging stations found in database", Toast.LENGTH_LONG).show();
                        currentStations = new ArrayList<>();
                    } else {
                        currentStations = stations;
                    }

                    stationsAdapter.updateData(currentStations);
                    addStationsToMap(currentStations);

                    // Show stations list automatically
                    showStations();

                    // Show success message
                    if (!currentStations.isEmpty()) {
                        Toast.makeText(DashboardActivity.this,
                                "Loaded " + currentStations.size() + " charging stations from database",
                                Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onError(String errorMessage) {
                    Log.e(TAG, "Error loading stations from database: " + errorMessage);
                    Toast.makeText(DashboardActivity.this, "Failed to load stations: " + errorMessage, Toast.LENGTH_SHORT).show();
                    currentStations = new ArrayList<>();
                    stationsAdapter.updateData(currentStations);
                    addStationsToMap(currentStations);
                }
            });
        } else {
            Log.w(TAG, "No network available, cannot load stations from database");
            Toast.makeText(this, "No internet connection. Cannot load stations.", Toast.LENGTH_LONG).show();
            currentStations = new ArrayList<>();
            stationsAdapter.updateData(currentStations);
            addStationsToMap(currentStations);
        }
    }

    private void addStationsToMap(List<Station> stations) {
        if (mMap == null) return;

        mMap.clear();

        // Add current location marker if we have location permission
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            // Current location marker will be added by the system when mMap.setMyLocationEnabled(true) is called
        }

        for (Station station : stations) {
            LatLng stationLatLng = new LatLng(station.getLatitude(), station.getLongitude());
            Marker marker = mMap.addMarker(new MarkerOptions()
                    .position(stationLatLng)
                    .title(station.getName())
                    .snippet(station.getType() + " • " + station.getAvailableSlots() + "/" + station.getTotalSlots() + " available")
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)));

            if (marker != null) {
                marker.setTag(station);
            }
        }

        // Add marker click listener
        mMap.setOnMarkerClickListener(marker -> {
            Station station = (Station) marker.getTag();
            if (station != null) {
                // Show station info in a toast
                String stationInfo = station.getName() +
                        "\n" + station.getLocation() +
                        "\n" + station.getType() + " • " +
                        station.getAvailableSlots() + "/" + station.getTotalSlots() + " available";

                Toast.makeText(this, stationInfo, Toast.LENGTH_LONG).show();

                // Scroll to station in list
                int index = currentStations.indexOf(station);
                if (index != -1) {
                    rvStations.smoothScrollToPosition(index);
                }

                // Move camera to marker
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(marker.getPosition(), 15));
            }
            return true; // Return true to indicate we've handled the event
        });

        // Add info window click listener
        mMap.setOnInfoWindowClickListener(marker -> {
            Station station = (Station) marker.getTag();
            if (station != null) {
                // Navigate to booking when info window is clicked
                Intent bookingIntent = new Intent(DashboardActivity.this, BookingActivity.class);
                bookingIntent.putExtra("USER_NIC", userNIC);
                bookingIntent.putExtra("STATION_ID", station.getId());
                bookingIntent.putExtra("STATION_NAME", station.getName());
                bookingIntent.putExtra("STATION_LOCATION", station.getLocation());
                bookingIntent.putExtra("STATION_LAT", station.getLatitude());
                bookingIntent.putExtra("STATION_LNG", station.getLongitude());
                startActivity(bookingIntent);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Refresh stations when returning to dashboard
        if (currentStations.isEmpty()) {
            loadAllStationsFromDatabase();
        }
    }

    // Method to refresh stations manually
    public void refreshStations(View view) {
        Toast.makeText(this, "Refreshing stations from database...", Toast.LENGTH_SHORT).show();
        loadAllStationsFromDatabase();
    }
}