package com.example.evchargingmobileapp.fragments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.activities.ViewBookingsActivity;
import com.example.evchargingmobileapp.adapters.BookingsAdapter;
import com.example.evchargingmobileapp.models.Booking;

import java.util.ArrayList;
import java.util.List;

public class UpcomingBookingsFragment extends Fragment {

    private static final String TAG = "UpcomingBookings";
    private static final String ARG_BOOKINGS = "bookings";

    private List<Booking> upcomingBookings = new ArrayList<>();
    private BookingsAdapter adapter;
    private RecyclerView recyclerView;
    private TextView tvEmptyState;

    public static UpcomingBookingsFragment newInstance(List<Booking> bookings) {
        UpcomingBookingsFragment fragment = new UpcomingBookingsFragment();
        Bundle args = new Bundle();
        args.putSerializable(ARG_BOOKINGS, new ArrayList<>(bookings));
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            upcomingBookings = (List<Booking>) getArguments().getSerializable(ARG_BOOKINGS);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_upcoming_bookings, container, false);

        recyclerView = view.findViewById(R.id.rvUpcomingBookings);
        tvEmptyState = view.findViewById(R.id.tvEmptyState);

        setupRecyclerView();
        updateEmptyState();

        return view;
    }

    private void setupRecyclerView() {
        // Create separate listener instances to avoid recursion
        BookingsAdapter.OnBookingClickListener clickListener = new BookingsAdapter.OnBookingClickListener() {
            @Override
            public void onBookingClick(Booking booking) {
                Log.d(TAG, "Click: " + booking.getStationName());
                handleBookingClick(booking);
            }
        };

        BookingsAdapter.OnBookingLongClickListener longClickListener = new BookingsAdapter.OnBookingLongClickListener() {
            @Override
            public void onBookingLongClick(Booking booking) {
                Log.d(TAG, "Long Click: " + booking.getStationName());
                handleBookingLongClick(booking);
            }
        };

        adapter = new BookingsAdapter(upcomingBookings, clickListener, longClickListener);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }

    private void handleBookingClick(Booking booking) {
        if (getActivity() instanceof ViewBookingsActivity) {
            ((ViewBookingsActivity) getActivity()).onBookingClick(booking);
        }
    }

    private void handleBookingLongClick(Booking booking) {
        if (getActivity() instanceof ViewBookingsActivity) {
            ((ViewBookingsActivity) getActivity()).onBookingLongClick(booking);
        }
    }

    private void updateEmptyState() {
        if (upcomingBookings.isEmpty()) {
            tvEmptyState.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
        } else {
            tvEmptyState.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }

    public void updateBookings(List<Booking> bookings) {
        this.upcomingBookings.clear();
        this.upcomingBookings.addAll(bookings);
        if (adapter != null) {
            adapter.updateData(bookings);
            updateEmptyState();
        }
    }
}