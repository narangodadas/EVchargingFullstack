/*******************************************************
 *file :         StationAdapter.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.models.Station;

import java.util.List;

public class StationsAdapter extends RecyclerView.Adapter<StationsAdapter.StationViewHolder> {

    private List<Station> stationsList;
    private OnStationClickListener listener;

    public interface OnStationClickListener {
        void onStationClick(Station station);
    }

    public StationsAdapter(List<Station> stationsList, OnStationClickListener listener) {
        this.stationsList = stationsList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public StationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_station, parent, false);
        return new StationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StationViewHolder holder, int position) {
        Station station = stationsList.get(position);
        holder.bind(station);
    }

    @Override
    public int getItemCount() {
        return stationsList.size();
    }

    public void updateData(List<Station> newStations) {
        this.stationsList = newStations;
        notifyDataSetChanged();
    }

    class StationViewHolder extends RecyclerView.ViewHolder {
        private TextView tvStationName, tvLocation, tvType, tvSlots, tvRating, tvDistance, tvAvailability, tvHours, tvPrice;
        private ImageView ivStation;

        public StationViewHolder(@NonNull View itemView) {
            super(itemView);
            tvStationName = itemView.findViewById(R.id.tvStationName);
            // tvLocation removed as not in new layout
            tvType = itemView.findViewById(R.id.tvType);
            // tvSlots removed, replaced by tvAvailability
            tvRating = itemView.findViewById(R.id.tvRating);
            tvDistance = itemView.findViewById(R.id.tvDistance);
            tvAvailability = itemView.findViewById(R.id.tvAvailability);
            tvHours = itemView.findViewById(R.id.tvHours);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            ivStation = itemView.findViewById(R.id.ivStation);

            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onStationClick(stationsList.get(getAdapterPosition()));
                }
            });
        }

        public void bind(Station station) {
            tvStationName.setText(station.getName());
            tvType.setText(station.getType() + " Charger");
            tvRating.setText(String.format("%.1f ★ (%d)", station.getRating(), station.getReviewsCount()));
            tvDistance.setText(String.format("%.1f km", station.getDistance()));
            tvAvailability.setText(station.getAvailableSlots() + "/" + station.getTotalSlots() + " Available");
            tvHours.setText(station.getOperatingHours());
            tvPrice.setText(station.getPricePerHour());

            // Set availability color
            if (station.getAvailableSlots() > 0) {
                tvAvailability.setTextColor(ContextCompat.getColor(itemView.getContext(), R.color.green));
            } else {
                tvAvailability.setTextColor(ContextCompat.getColor(itemView.getContext(), android.R.color.holo_red_dark));
            }

            // Set SAME image for ALL stations - replace with your preferred icon
            ivStation.setImageResource(R.drawable.ic_ev_charging_station);

            // Optional: Set background color based on availability
            if (station.getAvailableSlots() > 0) {
                ivStation.setBackgroundColor(ContextCompat.getColor(itemView.getContext(), R.color.light_green));
            } else {
                ivStation.setBackgroundColor(ContextCompat.getColor(itemView.getContext(), R.color.light_red));
            }
        }
    }
}