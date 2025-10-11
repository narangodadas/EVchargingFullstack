/*******************************************************
 *file :         Station.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.models;

import com.google.gson.annotations.SerializedName;

public class Station {
    private String id;
    private String name;

    @SerializedName("location")
    private Object location;

    @SerializedName("operatingHours")
    private Object operatingHours;

    private String type;
    private int availableSlots;
    private int totalSlots;
    private double latitude;
    private double longitude;
    private boolean isActive;
    private double rating = 4.5;
    private int reviewsCount = 85;
    private String pricePerHour = "Rs2000/hr";
    private double distance = 2.3;

    // Constructors
    public Station() {}

    public Station(String name, String location, String type, int totalSlots, double lat, double lng) {
        this.name = name;
        this.location = location;
        this.type = type;
        this.totalSlots = totalSlots;
        this.availableSlots = totalSlots;
        this.latitude = lat;
        this.longitude = lng;
        this.isActive = true;
        this.operatingHours = "24/7";
    }

    // Getters and Setters with robust object handling
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() {
        return extractStringFromObject(location, name + " Charging Station");
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getOperatingHours() {
        return extractStringFromObject(operatingHours, "24/7");
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    // Helper method to extract string from object
    private String extractStringFromObject(Object obj, String defaultValue) {
        if (obj instanceof String) {
            return (String) obj;
        }
        // You could add more complex object parsing here if needed
        return defaultValue;
    }

    // Other getters and setters remain the same...
    public String getType() {
        return type != null ? type : "AC Charger";
    }
    public void setType(String type) { this.type = type; }

    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }

    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getPricePerHour() { return pricePerHour; }
    public void setPricePerHour(String pricePerHour) { this.pricePerHour = pricePerHour; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }
}