/*******************************************************
 *file :         ViewBookingsActivity.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.fragments.PastBookingsFragment;
import com.example.evchargingmobileapp.fragments.UpcomingBookingsFragment;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.Booking;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.google.android.material.tabs.TabLayout;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class ViewBookingsActivity extends AppCompatActivity {

    private List<Booking> upcomingBookings = new ArrayList<>();
    private List<Booking> pastBookings = new ArrayList<>();
    private ApiManager apiManager;
    private String userNIC;
    private TabLayout tabLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_bookings);

        // Get user NIC from intent
        userNIC = getIntent().getStringExtra("USER_NIC");
        if (userNIC == null) {
            Toast.makeText(this, "User not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        apiManager = new ApiManager(this);

        // Setup TabLayout
        setupTabs();

        // Load real booking data from API
        loadUserBookings();
    }

    private void setupTabs() {
        tabLayout = findViewById(R.id.tabLayout);

        // Add tabs with uppercase text
        TabLayout.Tab upcomingTab = tabLayout.newTab();
        upcomingTab.setText("UPCOMING");
        tabLayout.addTab(upcomingTab);

        TabLayout.Tab pastTab = tabLayout.newTab();
        pastTab.setText("PAST");
        tabLayout.addTab(pastTab);

        // Set full width tab indicator
        tabLayout.setTabIndicatorFullWidth(true);

        // Set tab selection listener
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                switch (tab.getPosition()) {
                    case 0:
                        showUpcomingBookings();
                        break;
                    case 1:
                        showPastBookings();
                        break;
                }
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {
                // Not needed
            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {
                // Not needed
            }
        });

        // Set initial fragment
        showUpcomingBookings();
    }

    private void loadUserBookings() {
        if (apiManager.isNetworkAvailable()) {
            apiManager.getUserBookings(userNIC, new ApiCallback<List<Booking>>() {
                @Override
                public void onSuccess(List<Booking> allBookings) {
                    if (allBookings != null && !allBookings.isEmpty()) {
                        // Separate bookings based on isCompleted field
                        separateBookingsByCompletion(allBookings);

                        Toast.makeText(ViewBookingsActivity.this,
                                "Loaded " + allBookings.size() + " bookings", Toast.LENGTH_SHORT).show();
                    } else {
                        // No bookings found
                        upcomingBookings.clear();
                        pastBookings.clear();
                        Toast.makeText(ViewBookingsActivity.this,
                                "No bookings found", Toast.LENGTH_SHORT).show();
                    }

                    // Display current tab
                    if (tabLayout.getSelectedTabPosition() == 0) {
                        showFragment(UpcomingBookingsFragment.newInstance(upcomingBookings));
                    } else {
                        showFragment(PastBookingsFragment.newInstance(pastBookings));
                    }
                }

                @Override
                public void onError(String errorMessage) {
                    Toast.makeText(ViewBookingsActivity.this,
                            "Failed to load bookings: " + errorMessage, Toast.LENGTH_SHORT).show();

                    // No mock data - just show empty state
                    upcomingBookings.clear();
                    pastBookings.clear();
                    showFragment(UpcomingBookingsFragment.newInstance(upcomingBookings));
                }
            });
        } else {
            Toast.makeText(this, "No internet connection", Toast.LENGTH_SHORT).show();
            // No mock data - just show empty state
            upcomingBookings.clear();
            pastBookings.clear();
            showFragment(UpcomingBookingsFragment.newInstance(upcomingBookings));
        }
    }

    private void separateBookingsByCompletion(List<Booking> allBookings) {
        upcomingBookings.clear();
        pastBookings.clear();

        if (allBookings == null || allBookings.isEmpty()) {
            return;
        }

        // Simple logic: isCompleted = true → Past, isCompleted = false → Upcoming
        for (Booking booking : allBookings) {
            if (booking.isCompleted()) {
                pastBookings.add(booking);
            } else {
                upcomingBookings.add(booking);
            }
        }

        // Optional: Sort bookings by date
        sortBookingsByDate();
    }

    private void sortBookingsByDate() {
        // Sort upcoming bookings by start time (ascending)
        Collections.sort(upcomingBookings, new Comparator<Booking>() {
            @Override
            public int compare(Booking b1, Booking b2) {
                try {
                    return b1.getStartTime().compareTo(b2.getStartTime());
                } catch (Exception e) {
                    return 0;
                }
            }
        });

        // Sort past bookings by start time (descending - most recent first)
        Collections.sort(pastBookings, new Comparator<Booking>() {
            @Override
            public int compare(Booking b1, Booking b2) {
                try {
                    return b2.getStartTime().compareTo(b1.getStartTime());
                } catch (Exception e) {
                    return 0;
                }
            }
        });
    }

    private void showFragment(Fragment fragment) {
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.replace(R.id.fragmentContainer, fragment);
        transaction.commit();
    }

    // Method to switch between upcoming and past bookings
    public void showUpcomingBookings() {
        showFragment(UpcomingBookingsFragment.newInstance(upcomingBookings));
    }

    public void showPastBookings() {
        showFragment(PastBookingsFragment.newInstance(pastBookings));
    }

    // ✅ Triggered when user taps on a booking
    public void onBookingClick(Booking booking) {
        Toast.makeText(this, "Clicked: " + booking.getStationName() +
                        " (" + (booking.isCompleted() ? "Completed" : "Upcoming") + ")",
                Toast.LENGTH_SHORT).show();

        Intent intent = new Intent(this, BookingDetailsActivity.class);
        intent.putExtra("BOOKING", booking);
        intent.putExtra("USER_NIC", userNIC);
        startActivity(intent);
    }

    // ✅ Triggered when user long-presses a booking
    public void onBookingLongClick(Booking booking) {
        showBookingOptionsDialog(booking);
    }

    private void showBookingOptionsDialog(Booking booking) {
        List<String> options = new ArrayList<>();

        // Always show View Details
        options.add("View Details");

        // Show action options only for upcoming bookings (not completed)
        if (!booking.isCompleted()) {
            options.add("Edit Booking");
            options.add("Cancel Booking");
        }

        // If no additional options, just show details and return
        if (options.size() == 1) {
            onBookingClick(booking);
            return;
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Booking Options");
        builder.setItems(options.toArray(new String[0]), (dialog, which) -> {
            String selectedOption = options.get(which);
            switch (selectedOption) {
                case "View Details":
                    onBookingClick(booking);
                    break;
                case "Edit Booking":
                    navigateToEditBooking(booking);
                    break;
                case "Cancel Booking":
                    showCancelConfirmation(booking);
                    break;
            }
        });
        builder.show();
    }

    private void navigateToEditBooking(Booking booking) {
        Intent intent = new Intent(this, EditBookingActivity.class);
        intent.putExtra("BOOKING", booking);
        intent.putExtra("USER_NIC", userNIC);
        startActivity(intent);
    }

    private void showCancelConfirmation(Booking booking) {
        new AlertDialog.Builder(this)
                .setTitle("Cancel Booking?")
                .setMessage("Are you sure you want to cancel this booking at " + booking.getStationName() + "?")
                .setPositiveButton("Yes", (dialog, which) -> {
                    cancelBooking(booking);
                })
                .setNegativeButton("No", null)
                .show();
    }

    private void cancelBooking(Booking booking) {
        apiManager.cancelBooking(booking.getId(), new ApiCallback<ApiResponse>() {
            @Override
            public void onSuccess(ApiResponse response) {
                Toast.makeText(ViewBookingsActivity.this, "Booking cancelled successfully!", Toast.LENGTH_SHORT).show();
                // Refresh the bookings list
                loadUserBookings();
            }

            @Override
            public void onError(String errorMessage) {
                Toast.makeText(ViewBookingsActivity.this, "Failed to cancel booking: " + errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Refresh data when returning from other activities
        loadUserBookings();
    }
}