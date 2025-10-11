/*******************************************************
 *file :         LoginActivity.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.database.DatabaseManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.example.evchargingmobileapp.models.LoginRequest;
import com.example.evchargingmobileapp.models.User;

public class LoginActivity extends AppCompatActivity {

    private EditText etNIC, etPassword;
    private Button btnLogin;
    private TextView tvRegister;
    private ProgressBar progressBar;
    private RadioGroup rgUserType;

    private ApiManager apiManager;
    private DatabaseManager databaseManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Initialize managers
        apiManager = new ApiManager(this);
        databaseManager = new DatabaseManager(this);

        // Initialize views
        initViews();
        setupClickListeners();
    }

    private void initViews() {
        etNIC = findViewById(R.id.etNIC);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvRegister = findViewById(R.id.tvRegister);
        progressBar = findViewById(R.id.progressBar);
        rgUserType = findViewById(R.id.rgUserType);
    }

    private void setupClickListeners() {
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                attemptLogin();
            }
        });

        tvRegister.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navigate to Register Activity
                Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
                startActivity(intent);
            }
        });
    }

    private void attemptLogin() {
        String nic = etNIC.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (nic.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        // Check if a user type is selected
        int selectedId = rgUserType.getCheckedRadioButtonId();
        if (selectedId == -1) {
            Toast.makeText(this, "Please select user type", Toast.LENGTH_SHORT).show();
            return;
        }

        // Determine user type
        String userType = (selectedId == R.id.rbEVOwner) ? "evowner" : "stationoperator";

        showProgress(true);

        if (apiManager.isNetworkAvailable()) {
            // Online login with role - USING UPDATED METHOD SIGNATURE
            apiManager.loginUser(nic, password, userType, new ApiCallback<ApiResponse>() {
                @Override
                public void onSuccess(ApiResponse response) {
                    showProgress(false);
                    handleLoginSuccess(nic, password, userType, response);
                }

                @Override
                public void onError(String errorMessage) {
                    showProgress(false);
                    Toast.makeText(LoginActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            // Offline login (from local database) - with role and active status check
            User localUser = databaseManager.getUser(nic);
            if (localUser != null &&
                    localUser.getPassword().equals(password) &&
                    localUser.getRole().equals(userType) &&
                    localUser.isActive()) {
                handleLoginSuccess(nic, password, userType, null);
            } else {
                showProgress(false);
                if (localUser == null) {
                    Toast.makeText(LoginActivity.this, "User not found in local database", Toast.LENGTH_SHORT).show();
                } else if (!localUser.getPassword().equals(password)) {
                    Toast.makeText(LoginActivity.this, "Invalid password", Toast.LENGTH_SHORT).show();
                } else if (!localUser.getRole().equals(userType)) {
                    Toast.makeText(LoginActivity.this, "User role doesn't match selected role", Toast.LENGTH_SHORT).show();
                } else if (!localUser.isActive()) {
                    Toast.makeText(LoginActivity.this, "Account is deactivated", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(LoginActivity.this, "No internet connection and local login failed", Toast.LENGTH_SHORT).show();
                }
            }
        }
    }

    private void handleLoginSuccess(String nic, String password, String userType, ApiResponse response) {
        // Save/update user to local database
        User user = new User(nic, "User", "user@email.com", password, userType);
        user.setActive(true); // Ensure active status is true
        databaseManager.addUser(user);

        Toast.makeText(this, "Login successful!", Toast.LENGTH_SHORT).show();

        // Navigate to appropriate dashboard
        Intent intent;
        if (userType.equals("stationoperator")) {
            intent = new Intent(LoginActivity.this, OperatorDashboardActivity.class);
        } else {
            intent = new Intent(LoginActivity.this, DashboardActivity.class);
        }

        intent.putExtra("USER_NIC", nic);
        intent.putExtra("USER_TYPE", userType);
        startActivity(intent);
        finish();
    }

    private void showProgress(boolean show) {
        progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        btnLogin.setEnabled(!show);
    }
}