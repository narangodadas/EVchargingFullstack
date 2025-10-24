/*******************************************************
 *file :         OperatorDashboard.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.evchargingmobileapp.R;

public class OperatorDashboardActivity extends AppCompatActivity {

    private String userNIC;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_operator_dashboard);

        userNIC = getIntent().getStringExtra("USER_NIC");

        // Directly navigate to QR scanner
        navigateToQRScanner();
    }

    private void navigateToQRScanner() {
        Intent intent = new Intent(this, QRScannerActivity.class);
        intent.putExtra("OPERATOR_NIC", userNIC);
        startActivity(intent);
        finish(); // Close dashboard since we're going directly to scanner
    }

    @Override
    protected void onResume() {
        super.onResume();
        // If user comes back (e.g., from pressing back), close the app
        finish();
    }
}