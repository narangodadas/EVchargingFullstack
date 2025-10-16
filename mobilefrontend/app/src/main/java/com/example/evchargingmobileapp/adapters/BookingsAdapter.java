/*******************************************************
 *file :         BookingAdapter.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.adapters;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.models.Booking;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class BookingsAdapter extends RecyclerView.Adapter<BookingsAdapter.BookingViewHolder> {

    private List<Booking> bookings;
    private final OnBookingClickListener onItemClick;
    private final OnBookingLongClickListener onItemLongClick;
    private Context context;

    public interface OnBookingClickListener {
        void onBookingClick(Booking booking);
    }

    public interface OnBookingLongClickListener {
        void onBookingLongClick(Booking booking);
    }

    public BookingsAdapter(List<Booking> bookings, OnBookingClickListener onItemClick, OnBookingLongClickListener onItemLongClick) {
        this.bookings = bookings;
        this.onItemClick = onItemClick;
        this.onItemLongClick = onItemLongClick;
    }

    @NonNull
    @Override
    public BookingViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        context = parent.getContext();
        View view = LayoutInflater.from(context).inflate(R.layout.item_booking, parent, false);
        return new BookingViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BookingViewHolder holder, int position) {
        Booking booking = bookings.get(position);
        bindBooking(booking, holder);

        // Set click listener
        holder.itemView.setOnClickListener(v -> {
            if (onItemClick != null) {
                onItemClick.onBookingClick(booking);
            }
        });

        // Set long click listener
        holder.itemView.setOnLongClickListener(v -> {
            if (onItemLongClick != null) {
                onItemLongClick.onBookingLongClick(booking);
                return true;
            }
            return false;
        });
    }

    @Override
    public int getItemCount() {
        return bookings != null ? bookings.size() : 0;
    }

    public void updateData(List<Booking> newBookings) {
        this.bookings = newBookings;
        notifyDataSetChanged();
    }

    private void bindBooking(Booking booking, BookingViewHolder holder) {
        holder.tvStation.setText(booking.getStationName());

        // Format date and time separately using the same logic as BookingDetailsActivity
        String[] formattedDateTime = formatDateTime(booking.getStartTime(), booking.getEndTime());
        holder.tvDate.setText("Date - " + formattedDateTime[0]);
        holder.tvStartTime.setText("Start Time - " + formattedDateTime[1]);
        holder.tvEndTime.setText("End Time - " + formattedDateTime[2]);

        // Set status
        if (booking.isCompleted()) {
            holder.tvStatus.setText("Completed");
            holder.tvStatus.setTextColor(ContextCompat.getColor(context, R.color.green));
        } else {
            String status = booking.getStatus();
            String displayStatus = (status != null && !status.isEmpty()) ? status : "Upcoming";
            holder.tvStatus.setText(displayStatus);
            int colorRes = getStatusColor(status);
            holder.tvStatus.setTextColor(ContextCompat.getColor(context, colorRes));
        }
    }

    private String[] formatDateTime(String startTime, String endTime) {
        String[] result = new String[3];

        try {
            // Extract date part from startTime (format: yyyy-MM-dd)
            String datePart = extractDate(startTime);

            // Format times using the same logic as BookingDetailsActivity
            String startTimePart = formatTimeForDisplay(startTime);
            String endTimePart = formatTimeForDisplay(endTime);

            result[0] = datePart;  // Date - 10/10/2025
            result[1] = startTimePart;  // Start Time - 5.43 PM
            result[2] = endTimePart;    // End Time - 3.43 PM

            return result;
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Fallback if parsing fails
        result[0] = "Unknown Date";
        result[1] = startTime;
        result[2] = endTime;
        return result;
    }

    private String extractDate(String dateTime) {
        try {
            if (dateTime.contains("T")) {
                String datePart = dateTime.substring(0, 10); // Get yyyy-MM-dd
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
                String timePart = time.substring(11, 16); // Extract HH:mm from 2025-10-10T17:43:00.000+00:00
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

            return String.format("%d.%02d %s", hour, minute, period).toLowerCase();
        } catch (Exception e) {
            return time24;
        }
    }

    private int getStatusColor(String status) {
        if (status == null) return R.color.purple_500;
        switch (status.toLowerCase()) {
            case "pending": return R.color.orange;
            case "confirmed":
            case "approved": return R.color.green;
            case "cancelled":
            case "rejected": return R.color.red;
            default: return R.color.purple_500;
        }
    }

    static class BookingViewHolder extends RecyclerView.ViewHolder {
        TextView tvStation, tvDate, tvStartTime, tvEndTime, tvStatus;

        BookingViewHolder(@NonNull View itemView) {
            super(itemView);
            tvStation = itemView.findViewById(R.id.tvStation);
            tvDate = itemView.findViewById(R.id.tvDate);
            tvStartTime = itemView.findViewById(R.id.tvStartTime);
            tvEndTime = itemView.findViewById(R.id.tvEndTime);
            tvStatus = itemView.findViewById(R.id.tvStatus);
        }
    }
}