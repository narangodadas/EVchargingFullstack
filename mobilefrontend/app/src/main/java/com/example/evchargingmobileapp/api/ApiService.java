package com.example.evchargingmobileapp.api;

import com.example.evchargingmobileapp.models.User;
import com.example.evchargingmobileapp.models.Booking;
import com.example.evchargingmobileapp.models.Station;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.UserUpdateRequest;
import com.example.evchargingmobileapp.models.LoginRequest;
import com.example.evchargingmobileapp.models.DashboardStats;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // User Endpoints
    @POST("users/register")
    Call<ApiResponse> registerUser(@Body User user);

    @POST("users/login")
    Call<ApiResponse> loginUser(@Body LoginRequest request);

    @GET("users/check/{nic}")
    Call<ApiResponse> checkUserExists(@Path("nic") String nic);

    @PUT("users/update/{nic}")
    Call<ApiResponse> updateUser(@Path("nic") String nic, @Body User user);

    @PUT("users/deactivate/{nic}")
    Call<ApiResponse> deactivateUser(@Path("nic") String nic);

    // Station Endpoints
    @GET("stations")
    Call<List<Station>> getAllStations();

    @GET("stations/nearby")
    Call<List<Station>> getNearbyStations(@Query("lat") double lat, @Query("lng") double lng);

    // Booking Endpoints
    @GET("bookings/user/{userId}")
    Call<List<Booking>> getUserBookings(@Path("userId") String userId);

    @POST("bookings")
    Call<ApiResponse> createBooking(@Body Booking booking);

    @PUT("bookings/{id}")
    Call<ApiResponse> updateBooking(@Path("id") String id, @Body Booking booking);

    @DELETE("bookings/{id}")
    Call<ApiResponse> cancelBooking(@Path("id") String id);

    @PUT("bookings/{id}/approve")
    Call<ApiResponse> approveBooking(@Path("id") String id);

    @PUT("bookings/{id}/complete")
    Call<ApiResponse> completeBooking(@Path("id") String id);

    @GET("bookings/{id}/qrcode")
    Call<ApiResponse> generateQRCode(@Path("id") String id);

    // Dashboard Endpoints
    @GET("dashboard/stats/{userId}")
    Call<DashboardStats> getUserStats(@Path("userId") String userId);

    // For operator (add backend endpoint if needed: GET bookings/pending)
    @GET("bookings/pending")
    Call<List<Booking>> getPendingBookings();

}