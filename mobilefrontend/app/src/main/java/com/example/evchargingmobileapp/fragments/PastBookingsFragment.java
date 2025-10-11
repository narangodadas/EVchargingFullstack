package com.example.evchargingmobileapp.fragments;

import android.os.Bundle;
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

public class PastBookingsFragment extends Fragment {

    private static final String ARG_BOOKINGS = "bookings";

    private List<Booking> pastBookings = new ArrayList<>();
    private BookingsAdapter adapter;
    private RecyclerView recyclerView;
    private TextView tvEmptyState;

    public static PastBookingsFragment newInstance(List<Booking> bookings) {
        PastBookingsFragment fragment = new PastBookingsFragment();
        Bundle args = new Bundle();
        args.putSerializable(ARG_BOOKINGS, new ArrayList<>(bookings));
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            pastBookings = (List<Booking>) getArguments().getSerializable(ARG_BOOKINGS);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_past_bookings, container, false);

        recyclerView = view.findViewById(R.id.rvPastBookings);
        tvEmptyState = view.findViewById(R.id.tvEmptyState);

        setupRecyclerView();
        updateEmptyState();

        return view;
    }

    private void setupRecyclerView() {
        adapter = new BookingsAdapter(pastBookings,
                this::onBookingClick,
                this::onBookingLongClick
        );

        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }

    private void onBookingClick(Booking booking) {
        if (getActivity() instanceof ViewBookingsActivity) {
            ((ViewBookingsActivity) getActivity()).onBookingClick(booking);
        }
    }

    private void onBookingLongClick(Booking booking) {
        if (getActivity() instanceof ViewBookingsActivity) {
            ((ViewBookingsActivity) getActivity()).onBookingLongClick(booking);
        }
    }

    private void updateEmptyState() {
        if (pastBookings.isEmpty()) {
            tvEmptyState.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
        } else {
            tvEmptyState.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }

    public void updateBookings(List<Booking> bookings) {
        this.pastBookings.clear();
        this.pastBookings.addAll(bookings);
        if (adapter != null) {
            adapter.updateData(bookings);
            updateEmptyState();
        }
    }
}