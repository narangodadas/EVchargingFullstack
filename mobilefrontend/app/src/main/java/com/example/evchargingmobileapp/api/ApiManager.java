package com.example.evchargingmobileapp.api;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.User;
import com.example.evchargingmobileapp.models.Booking;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.LoginRequest;
import com.example.evchargingmobileapp.models.DashboardStats;
import com.example.evchargingmobileapp.models.Station;
import com.google.android.gms.maps.model.LatLng;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ApiManager {
    private ApiService apiService;
    private Context context;
    private static final String TAG = "ApiManager";
    private Handler mainHandler = new Handler(Looper.getMainLooper());

    public ApiManager(Context context) {
        this.context = context;
        this.apiService = ApiClient.getClient().create(ApiService.class);
    }

    // User Registration
    public void registerUser(User user, final ApiCallback<ApiResponse> callback) {
        Call<ApiResponse> call = apiService.registerUser(user);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    String errorMsg = "Registration failed";
                    if (response.body() != null) {
                        errorMsg += ": " + response.body().getMessage();
                    } else if (response.errorBody() != null) {
                        try {
                            errorMsg += ": " + response.errorBody().string();
                        } catch (Exception e) {
                            errorMsg += " (HTTP " + response.code() + ")";
                        }
                    } else {
                        errorMsg += " (HTTP " + response.code() + ")";
                    }
                    callback.onError(errorMsg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    // User Login
    public void loginUser(String nic, String password, String role, final ApiCallback<ApiResponse> callback) {
        LoginRequest request = new LoginRequest(nic, password, role);

        Call<ApiResponse> call = apiService.loginUser(request);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    // Handle different HTTP error codes with specific messages
                    if (response.code() == 401) {
                        try {
                            // Try to parse error message from response
                            String errorBody = response.errorBody().string();
                            if (errorBody.contains("User role does not match")) {
                                callback.onError("User role does not match selected role");
                            } else if (errorBody.contains("Account is deactivated")) {
                                callback.onError("Account is deactivated. Please contact administrator.");
                            } else {
                                callback.onError("Invalid NIC or Password");
                            }
                        } catch (IOException e) {
                            callback.onError("Invalid NIC or Password");
                        }
                    } else if (response.code() == 400) {
                        callback.onError("Invalid request");
                    } else {
                        callback.onError("Login failed: " + response.code());
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    // Create Booking
    public void createBooking(Booking booking, final ApiCallback<ApiResponse> callback) {
        Call<ApiResponse> call = apiService.createBooking(booking);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("Booking creation failed");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }
    public void getAllStations(final ApiCallback<List<Station>> callback) {
        Call<List<Station>> call = apiService.getAllStations();
        call.enqueue(new Callback<List<Station>>() {
            @Override
            public void onResponse(Call<List<Station>> call, Response<List<Station>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Station> stations = response.body();
                    callback.onSuccess(stations);
                } else {
                    callback.onError("Failed to load stations from database");
                }
            }

            @Override
            public void onFailure(Call<List<Station>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }


    // Check internet connection
    public boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnectedOrConnecting();
    }

    // Get user dashboard stats
// In ApiManager.java - Replace the existing getUserStats method
    public void getUserStats(String userId, final ApiCallback<DashboardStats> callback) {
        // Get all user bookings and calculate stats locally
        getUserBookings(userId, new ApiCallback<List<Booking>>() {
            @Override
            public void onSuccess(List<Booking> bookings) {
                DashboardStats stats = new DashboardStats();
                int pendingCount = 0;
                int approvedCount = 0;
                int pastCount = 0;

                for (Booking booking : bookings) {
                    String status = booking.getStatus();
                    if (status != null) {
                        switch (status.toLowerCase()) {
                            case "pending":
                                pendingCount++;
                                break;
                            case "confirmed":
                            case "approved":
                                approvedCount++;
                                break;
                            case "completed":
                            case "cancelled":
                            case "rejected":
                                pastCount++;
                                break;
                        }
                    }
                }

                stats.setPendingReservations(pendingCount);
                stats.setApprovedReservations(approvedCount);
                stats.setPastBookings(pastCount);

                Log.d(TAG, "Calculated stats - Pending: " + pendingCount +
                        ", Approved: " + approvedCount + ", Past: " + pastCount);

                callback.onSuccess(stats);
            }

            @Override
            public void onError(String errorMessage) {
                Log.e(TAG, "Error loading bookings for stats: " + errorMessage);
                // Return empty stats on error
                DashboardStats stats = new DashboardStats();
                callback.onSuccess(stats);
            }
        });
    }

    public void getUserBookings(String userId, final ApiCallback<List<Booking>> callback) {
        Call<List<Booking>> call = apiService.getUserBookings(userId);
        call.enqueue(new Callback<List<Booking>>() {
            @Override
            public void onResponse(Call<List<Booking>> call, Response<List<Booking>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Booking> bookings = response.body();

                    // Convert backend DateTime to frontend display format
                    for (Booking booking : bookings) {
                        // Note: This requires your backend to return stationName
                        // If stationName is not returned, we need to handle it differently
                    }

                    callback.onSuccess(bookings);
                } else {
                    callback.onError("Failed to load bookings: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<Booking>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void updateBooking(String id, Booking booking, final ApiCallback<ApiResponse> callback) {
        Log.d(TAG, "Updating booking ID: " + id);
        Log.d(TAG, "Booking data - Station: " + booking.getStationName() +
                ", Vehicle: " + booking.getVehicleType() +
                ", Date: " + booking.getBookingDate());

        Call<ApiResponse> call = apiService.updateBooking(id, booking);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                Log.d(TAG, "Update response code: " + response.code());

                if (response.isSuccessful() && response.body() != null) {
                    Log.d(TAG, "Booking updated successfully");
                    callback.onSuccess(response.body());
                } else {
                    String errorMsg = "Booking update failed - HTTP " + response.code();
                    Log.e(TAG, errorMsg);
                    callback.onError(errorMsg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                Log.e(TAG, "Update API call failed: " + t.getMessage());
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void cancelBooking(String id, final ApiCallback<ApiResponse> callback) {
        Call<ApiResponse> call = apiService.cancelBooking(id);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("Booking cancel failed");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void approveBooking(String id, final ApiCallback<ApiResponse> callback) {
        Call<ApiResponse> call = apiService.approveBooking(id);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("Booking approve failed");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void completeBooking(String id, final ApiCallback<ApiResponse> callback) {
        Call<ApiResponse> call = apiService.completeBooking(id);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("Booking complete failed");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void generateQRCode(String id, final ApiCallback<ApiResponse> callback) {
        Log.d(TAG, "Generating QR code for booking: " + id);

        Call<ApiResponse> call = apiService.generateQRCode(id);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.d(TAG, "QR code generated successfully");
                    callback.onSuccess(response.body());
                } else {
                    String errorMsg = "QR generation failed - HTTP " + response.code();
                    Log.e(TAG, errorMsg);
                    callback.onError(errorMsg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                Log.e(TAG, "QR code API call failed: " + t.getMessage());
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }


    public void getPendingBookings(final ApiCallback<List<Booking>> callback) {
        callback.onSuccess(new ArrayList<>());
    }

    // Update user profile
    public void updateUser(String nic, User user, final ApiCallback<ApiResponse> callback) {
        Call<ApiResponse> call = apiService.updateUser(nic, user);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    String errorMsg = "Profile update failed";
                    if (response.errorBody() != null) {
                        try {
                            errorMsg += ": " + response.errorBody().string();
                        } catch (Exception e) {
                            errorMsg += " (HTTP " + response.code() + ")";
                        }
                    } else {
                        errorMsg += " (HTTP " + response.code() + ")";
                    }
                    callback.onError(errorMsg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void deactivateUser(String nic, final ApiCallback<ApiResponse> callback) {
        Log.d(TAG, "Deactivating user: " + nic);

        Call<ApiResponse> call = apiService.deactivateUser(nic);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                Log.d(TAG, "Deactivate response code: " + response.code());

                if (response.isSuccessful() && response.body() != null) {
                    Log.d(TAG, "User deactivated successfully");
                    callback.onSuccess(response.body());
                } else {
                    String errorMsg = "User deactivation failed - HTTP " + response.code();
                    Log.e(TAG, errorMsg);
                    if (response.errorBody() != null) {
                        try {
                            errorMsg += ": " + response.errorBody().string();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                    callback.onError(errorMsg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                Log.e(TAG, "Deactivate API call failed: " + t.getMessage());
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

}