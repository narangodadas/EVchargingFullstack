/*******************************************************
 *file :         MapActivity.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
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
import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.adapters.StationsAdapter;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.Station;

import java.util.ArrayList;
import java.util.List;

public class MapsActivity extends BaseActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private FusedLocationProviderClient fusedLocationClient;
    private RecyclerView rvStations;
    private StationsAdapter stationsAdapter;
    private ApiManager apiManager;

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;
    private List<Station> currentStations = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_maps);

        // Initialize location client
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        apiManager = new ApiManager(this);

        initViews();
        setupClickListeners();
        loadAllStationsFromDatabase();
        checkLocationPermission();
    }

    private void initViews() {
        rvStations = findViewById(R.id.rvStations);

        // Setup RecyclerView
        stationsAdapter = new StationsAdapter(new ArrayList<>(), station -> {
            // Station click handler
            moveCameraToStation(station);
        });
        rvStations.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        rvStations.setAdapter(stationsAdapter);

        // Initialize map
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }
    }

    private void setupClickListeners() {
        Button btnBack = findViewById(R.id.btnBack);
        btnBack.setOnClickListener(v -> finish());
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
                Toast.makeText(this, "Location permission denied", Toast.LENGTH_SHORT).show();
                setDefaultMapLocation();
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
                            if (mMap != null) {
                                mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(currentLatLng, 12));
                                addCurrentLocationMarker(currentLatLng);
                            }
                        } else {
                            setDefaultMapLocation();
                        }
                    }
                });
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Enable zoom controls
        mMap.getUiSettings().setZoomControlsEnabled(true);
        mMap.getUiSettings().setCompassEnabled(true);

        // Set default location
        setDefaultMapLocation();
    }

    private void setDefaultMapLocation() {
        // Default location (Colombo)
        LatLng defaultLocation = new LatLng(6.9271, 79.8612);
        if (mMap != null) {
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLocation, 10));
        }
    }

    private void addCurrentLocationMarker(LatLng latLng) {
        mMap.addMarker(new MarkerOptions()
                .position(latLng)
                .title("Your Location")
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_BLUE)));
    }

    // NEW METHOD: Load all stations from database
    private void loadAllStationsFromDatabase() {
        if (apiManager.isNetworkAvailable()) {
            apiManager.getAllStations(new ApiCallback<List<Station>>() {
                @Override
                public void onSuccess(List<Station> stations) {
                    currentStations = stations != null ? stations : new ArrayList<>();
                    stationsAdapter.updateData(currentStations);
                    addStationsToMap(currentStations);

                    if (currentStations.isEmpty()) {
                        Toast.makeText(MapsActivity.this, "No stations found in database", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(MapsActivity.this, "Loaded " + currentStations.size() + " stations", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onError(String errorMessage) {
                    Toast.makeText(MapsActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                    currentStations = new ArrayList<>();
                    stationsAdapter.updateData(currentStations);
                    addStationsToMap(currentStations);
                }
            });
        } else {
            Toast.makeText(this, "No internet connection", Toast.LENGTH_SHORT).show();
            currentStations = new ArrayList<>();
            stationsAdapter.updateData(currentStations);
            addStationsToMap(currentStations);
        }
    }

    private void addStationsToMap(List<Station> stations) {
        if (mMap == null) return;

        mMap.clear();

        for (Station station : stations) {
            LatLng stationLatLng = new LatLng(station.getLatitude(), station.getLongitude());
            Marker marker = mMap.addMarker(new MarkerOptions()
                    .position(stationLatLng)
                    .title(station.getName())
                    .snippet(station.getType() + " Charger • " + station.getAvailableSlots() + " slots available")
                    .icon(BitmapDescriptorFactory.defaultMarker(
                            station.getType().equals("DC") ?
                                    BitmapDescriptorFactory.HUE_RED :
                                    BitmapDescriptorFactory.HUE_GREEN)));

            marker.setTag(station);
        }

        // Add marker click listener
        mMap.setOnMarkerClickListener(marker -> {
            Station station = (Station) marker.getTag();
            if (station != null) {
                Toast.makeText(this, station.getName() + " selected", Toast.LENGTH_SHORT).show();
            }
            return false;
        });
    }

    private void moveCameraToStation(Station station) {
        LatLng stationLatLng = new LatLng(station.getLatitude(), station.getLongitude());
        mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(stationLatLng, 15));
    }
}