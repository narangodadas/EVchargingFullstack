/*******************************************************
 *file :         BookingPagerAdapter.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.adapters;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import com.example.evchargingmobileapp.fragments.UpcomingBookingsFragment;
import com.example.evchargingmobileapp.fragments.PastBookingsFragment;
import com.example.evchargingmobileapp.models.Booking;

import java.util.List;

public class BookingsPagerAdapter extends FragmentStateAdapter {

    private List<Booking> upcomingBookings;
    private List<Booking> pastBookings;

    public BookingsPagerAdapter(@NonNull FragmentActivity fragmentActivity, List<Booking> upcoming, List<Booking> past) {
        super(fragmentActivity);
        this.upcomingBookings = upcoming;
        this.pastBookings = past;
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        if (position == 0) {
            return UpcomingBookingsFragment.newInstance(upcomingBookings);
        } else {
            return PastBookingsFragment.newInstance(pastBookings);
        }
    }

    @Override
    public int getItemCount() {
        return 2;
    }

    public void updateData(List<Booking> upcoming, List<Booking> past) {
        this.upcomingBookings = upcoming;
        this.pastBookings = past;
        notifyDataSetChanged();
    }
}