/*******************************************************
 *file :         Booking.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.models;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Booking implements Serializable {
    private String id;
    private String userId;
    private String stationId;
    private String stationName;
    private String bookingDate;
    private String startTime;
    private String endTime;
    private String status;
    private boolean isCompleted; // NEW FIELD
    private String vehicleType;
    private double totalCost;
    private String qrCodeData;
    private String createdAt;
    private String updatedAt;

    public Booking() {
        this.isCompleted = false; // Default value
    }

    public Booking(String userId, String stationId, String stationName,
                   String startTime, String endTime, String vehicleType, double totalCost) {
        this.userId = userId;
        this.stationId = stationId;
        this.stationName = stationName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.vehicleType = vehicleType;
        this.totalCost = totalCost;
        this.status = "pending";
        this.isCompleted = false; // Set to false when creating
        this.bookingDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        this.createdAt = String.valueOf(System.currentTimeMillis());
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isCompleted() { return isCompleted; } // NEW GETTER
    public void setCompleted(boolean completed) { isCompleted = completed; } // NEW SETTER

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}