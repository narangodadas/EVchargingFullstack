/*******************************************************
 *file :         DashboardState.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.models;


public class DashboardStats {
    private int pendingReservations;
    private int approvedReservations;
    private int pastBookings;

    public DashboardStats() {}

    public int getPendingReservations() { return pendingReservations; }
    public void setPendingReservations(int pendingReservations) { this.pendingReservations = pendingReservations; }

    public int getApprovedReservations() { return approvedReservations; }
    public void setApprovedReservations(int approvedReservations) { this.approvedReservations = approvedReservations; }

    public int getPastBookings() { return pastBookings; }
    public void setPastBookings(int pastBookings) { this.pastBookings = pastBookings; }
}