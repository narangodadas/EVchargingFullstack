/*******************************************************
 *file :         RegisterActivity.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
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
import com.example.evchargingmobileapp.models.User;
import com.google.gson.Gson;

public class RegisterActivity extends AppCompatActivity {

    private EditText etNIC, etName, etEmail, etPassword;
    private Button btnRegister;
    private TextView tvLogin;
    private ProgressBar progressBar;
    private RadioGroup rgUserType;

    private ApiManager apiManager;
    private DatabaseManager databaseManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        apiManager = new ApiManager(this);
        databaseManager = new DatabaseManager(this);

        initViews();
        setupClickListeners();
    }

    private void initViews() {
        etNIC = findViewById(R.id.etNIC);
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnRegister = findViewById(R.id.btnRegister);
        tvLogin = findViewById(R.id.tvLogin);
        progressBar = findViewById(R.id.progressBar);
        rgUserType = findViewById(R.id.rgUserType);
    }

    private void setupClickListeners() {
        btnRegister.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                attemptRegistration();
            }
        });

        tvLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                startActivity(intent);
                finish();
            }
        });
    }

    private void attemptRegistration() {
        String nic = etNIC.getText().toString().trim();
        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String userType = (rgUserType.getCheckedRadioButtonId() == R.id.rbEVOwner) ? "evowner" : "stationoperator";

        if (nic.isEmpty() || name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        showProgress(true);

        // UPDATED: Use constructor without createdAt
        User user = new User(nic, name, email, password, userType);

        // Optional: Log JSON sent (check Logcat for "Register JSON")
        Log.d("Register", "Sending JSON: " + new Gson().toJson(user));

        if (apiManager.isNetworkAvailable()) {
            apiManager.registerUser(user, new ApiCallback<ApiResponse>() {
                @Override
                public void onSuccess(ApiResponse response) {
                    showProgress(false);
                    handleRegistrationSuccess(user);
                }

                @Override
                public void onError(String errorMessage) {
                    showProgress(false);
                    Toast.makeText(RegisterActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            // Offline registration
            user.setCreatedAt(String.valueOf(System.currentTimeMillis()));  // Set for local DB only
            boolean success = databaseManager.addUser(user);
            showProgress(false);

            if (success) {
                handleRegistrationSuccess(user);
            } else {
                Toast.makeText(this, "Registration failed", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void handleRegistrationSuccess(User user) {
        Toast.makeText(this, "Registration successful!", Toast.LENGTH_SHORT).show();

        // Navigate to login
        Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
        startActivity(intent);
        finish();
    }

    private void showProgress(boolean show) {
        progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        btnRegister.setEnabled(!show);
    }
}