/*******************************************************
 *file :         ProfileActivity.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.User;

public class ProfileActivity extends AppCompatActivity {

    private EditText etNic, etName, etEmail, etPassword, etConfirmPassword;
    private Button btnUpdate, btnLogout;
    private ImageButton btnBack;
    private ApiManager apiManager;
    private String userNIC;
    private User currentUser;

    private static final String TAG = "ProfileActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Make status bar white with dark icons
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.WHITE);
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }

        setContentView(R.layout.activity_profile);

        // Get user data from intent
        Intent intent = getIntent();
        userNIC = intent.getStringExtra("USER_NIC");
        String userName = intent.getStringExtra("USER_NAME");
        String userEmail = intent.getStringExtra("USER_EMAIL");

        apiManager = new ApiManager(this);

        initViews();
        setupClickListeners();
        loadUserData(userName, userEmail);
    }

    private void initViews() {
        etNic = findViewById(R.id.etNic);
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnUpdate = findViewById(R.id.btnUpdate);
        btnLogout = findViewById(R.id.btnLogout);
        btnBack = findViewById(R.id.btnBack);

        // Set NIC as non-editable
        etNic.setEnabled(false);
    }

    private void setupClickListeners() {
        btnBack.setOnClickListener(v -> {
            onBackPressed();
        });

        btnUpdate.setOnClickListener(v -> {
            updateUserProfile();
        });

        btnLogout.setOnClickListener(v -> {
            performLogout();
        });
    }

    private void loadUserData(String userName, String userEmail) {
        // Set current user data
        etNic.setText(userNIC);
        etName.setText(userName != null ? userName : "");
        etEmail.setText(userEmail != null ? userEmail : "");

        // Create current user object
        currentUser = new User();
        currentUser.setNic(userNIC);
        currentUser.setName(userName != null ? userName : "");
        currentUser.setEmail(userEmail != null ? userEmail : "");
    }

    private void updateUserProfile() {
        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        // Validation
        if (name.isEmpty()) {
            etName.setError("Name is required");
            etName.requestFocus();
            return;
        }

        if (email.isEmpty()) {
            etEmail.setError("Email is required");
            etEmail.requestFocus();
            return;
        }

        if (!password.isEmpty()) {
            if (password.length() < 6) {
                etPassword.setError("Password must be at least 6 characters");
                etPassword.requestFocus();
                return;
            }

            if (!password.equals(confirmPassword)) {
                etConfirmPassword.setError("Passwords do not match");
                etConfirmPassword.requestFocus();
                return;
            }
        }

        // Show loading
        btnUpdate.setEnabled(false);
        btnUpdate.setText("Updating...");

        // Create updated user object
        User updatedUser = new User();
        updatedUser.setNic(userNIC);
        updatedUser.setName(name);
        updatedUser.setEmail(email);
        updatedUser.setPassword(password.isEmpty() ? currentUser.getPassword() : password);

        if (apiManager.isNetworkAvailable()) {
            // Call update API
            apiManager.updateUser(userNIC, updatedUser, new ApiCallback<ApiResponse>() {
                @Override
                public void onSuccess(ApiResponse response) {
                    btnUpdate.setEnabled(true);
                    btnUpdate.setText("Update Profile");

                    Toast.makeText(ProfileActivity.this, "Profile updated successfully", Toast.LENGTH_SHORT).show();

                    // Update current user
                    currentUser.setName(name);
                    currentUser.setEmail(email);
                    if (!password.isEmpty()) {
                        currentUser.setPassword(password);
                    }

                    // Clear password fields
                    etPassword.setText("");
                    etConfirmPassword.setText("");
                }

                @Override
                public void onError(String errorMessage) {
                    btnUpdate.setEnabled(true);
                    btnUpdate.setText("Update Profile");
                    Toast.makeText(ProfileActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                    Log.e(TAG, "Update error: " + errorMessage);
                }
            });
        } else {
            btnUpdate.setEnabled(true);
            btnUpdate.setText("Update Profile");
            Toast.makeText(this, "No internet connection", Toast.LENGTH_SHORT).show();
        }
    }

    private void performLogout() {
        // Show loading
        btnLogout.setEnabled(false);
        btnLogout.setText("Logging out...");

        if (apiManager.isNetworkAvailable()) {
            // Call deactivate API first
            apiManager.deactivateUser(userNIC, new ApiCallback<ApiResponse>() {
                @Override
                public void onSuccess(ApiResponse response) {
                    Log.d(TAG, "User deactivated successfully, proceeding with logout");

                    // Navigate back to login screen after successful deactivation
                    navigateToLogin();
                }

                @Override
                public void onError(String errorMessage) {
                    Log.e(TAG, "Failed to deactivate user: " + errorMessage);

                    // Even if deactivation fails, still allow logout
                    // You can show a warning or proceed with logout
                    Toast.makeText(ProfileActivity.this,
                            "Logged out, but deactivation failed: " + errorMessage,
                            Toast.LENGTH_LONG).show();

                    navigateToLogin();
                }
            });
        } else {
            // No internet - still allow logout but show message
            Toast.makeText(this, "No internet connection. Logging out locally.", Toast.LENGTH_SHORT).show();
            navigateToLogin();
        }
    }

    private void navigateToLogin() {
        // Navigate back to login screen
        Intent intent = new Intent(ProfileActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();

        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
    }
    @Override
    public void onBackPressed() {
        super.onBackPressed();
        finish();
    }
}