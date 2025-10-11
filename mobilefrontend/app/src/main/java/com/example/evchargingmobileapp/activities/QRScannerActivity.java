/*******************************************************
 *file :         QRScannerActivity.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.google.zxing.ResultPoint;
import com.journeyapps.barcodescanner.BarcodeCallback;
import com.journeyapps.barcodescanner.BarcodeResult;
import com.journeyapps.barcodescanner.BarcodeView;

import java.util.List;

public class QRScannerActivity extends AppCompatActivity {

    private static final int CAMERA_PERMISSION_REQUEST = 1001;

    private BarcodeView barcodeView;
    private TextView tvScanResult;
    private Button btnComplete;
    private ApiManager apiManager;
    private String operatorNIC;
    private String currentBookingId;
    private boolean hasCameraPermission = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_scanner);

        initializeData();
        initializeViews();
        setupClickListeners();
        checkCameraPermission();
    }

    private void initializeData() {
        operatorNIC = getIntent().getStringExtra("OPERATOR_NIC");
        apiManager = new ApiManager(this);
    }

    private void initializeViews() {
        barcodeView = findViewById(R.id.barcodeView);
        tvScanResult = findViewById(R.id.tvScanResult);
        btnComplete = findViewById(R.id.btnComplete);

        // Set initial state
        btnComplete.setEnabled(false);

        // Initialize tvScanResult with default text
        tvScanResult.setText("Scan a QR code to begin...");
        tvScanResult.setTextColor(Color.GRAY);
    }
    private void setupClickListeners() {
        btnComplete.setOnClickListener(v -> completeBooking());
    }

    private void checkCameraPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            hasCameraPermission = true;
            startQRScanner();
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.CAMERA},
                    CAMERA_PERMISSION_REQUEST);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                hasCameraPermission = true;
                startQRScanner();
            } else {
                tvScanResult.setText("Camera permission required for scanning");
                tvScanResult.setTextColor(Color.RED);
                Toast.makeText(this, "Camera permission denied", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void startQRScanner() {
        if (!hasCameraPermission) {
            checkCameraPermission();
            return;
        }

        barcodeView.resume();

        barcodeView.decodeContinuous(new BarcodeCallback() {
            @Override
            public void barcodeResult(BarcodeResult result) {
                if (result.getText() != null) {
                    processQRCode(result.getText());
                }
            }

            @Override
            public void possibleResultPoints(List<ResultPoint> resultPoints) {
                // Optional: Handle possible result points
            }
        });
    }

    private void processQRCode(String qrData) {
        runOnUiThread(() -> {
            barcodeView.pause();

            if (qrData.startsWith("EVBooking:")) {
                String[] parts = qrData.split(":");
                if (parts.length >= 2) {
                    currentBookingId = parts[1];
                    displayBookingInfo(parts);
                    btnComplete.setEnabled(true);

                    // Show success message
                    Toast.makeText(QRScannerActivity.this,
                            "Valid QR Code Found! Click Complete to finish.",
                            Toast.LENGTH_SHORT).show();
                } else {
                    showError("Invalid QR format");
                    resumeScannerAfterDelay();
                }
            } else {
                showError("Not a valid EV booking QR code");
                resumeScannerAfterDelay();
            }
        });
    }

    private void resumeScannerAfterDelay() {
        barcodeView.postDelayed(() -> {
            if (hasCameraPermission) {
                barcodeView.resume();
            }
        }, 2000);
    }

    private void displayBookingInfo(String[] parts) {
        StringBuilder info = new StringBuilder();
        info.append("Valid EV Booking QR\n\n");
        info.append("Booking ID: ").append(parts[1]).append("\n");

        if (parts.length >= 3) {
            info.append("User: ").append(parts[2]).append("\n");
        }
        if (parts.length >= 4) {
            info.append("Station: ").append(parts[3]).append("\n");
        }

        info.append("\nQR Code is valid!");
        info.append("\n\nClick 'Complete EV Operation' to mark booking as completed.");
        tvScanResult.setText(info.toString());
        tvScanResult.setTextColor(ContextCompat.getColor(this, R.color.green));
    }

    private void completeBooking() {
        if (currentBookingId == null) {
            showError("No booking scanned");
            return;
        }

        btnComplete.setEnabled(false);
        tvScanResult.setText("Completing booking...\n\nUpdating database...");

        // This will call the backend API which updates isCompleted field to true
        apiManager.completeBooking(currentBookingId, new ApiCallback<ApiResponse>() {
            @Override
            public void onSuccess(ApiResponse response) {
                runOnUiThread(() -> {
                    tvScanResult.setText("Booking Completed Successfully!\n\n" +
                            "Database updated successfully\n" +
                            "isCompleted field set to true\n" +
                            "Booking ID: " + currentBookingId);

                    Toast.makeText(QRScannerActivity.this,
                            "Booking Completed! Database updated.",
                            Toast.LENGTH_SHORT).show();

                    // Clear current booking and resume scanning for next QR
                    currentBookingId = null;
                    btnComplete.setEnabled(false);

                    // Resume scanner after 3 seconds
                    barcodeView.postDelayed(() -> {
                        if (hasCameraPermission) {
                            barcodeView.resume();
                            tvScanResult.setText("Scan next QR code...");
                            tvScanResult.setTextColor(Color.GRAY);
                        }
                    }, 3000);
                });
            }

            @Override
            public void onError(String errorMessage) {
                runOnUiThread(() -> {
                    showError("Complete failed: " + errorMessage);
                    btnComplete.setEnabled(true);
                    resumeScannerAfterDelay();
                });
            }
        });
    }

    private void showError(String message) {
        tvScanResult.setText("" +
                "" + message + "\n\nTry scanning again...");
        tvScanResult.setTextColor(Color.RED);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (hasCameraPermission) {
            barcodeView.resume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        barcodeView.pause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        barcodeView.pause();
    }
}