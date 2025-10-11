/*******************************************************
 *file :         QRDisplayActivity.java
 *Author:        IT22278180 - Narangoda D.A.S.
 ********************************************************/

package com.example.evchargingmobileapp.activities;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.example.evchargingmobileapp.R;
import com.example.evchargingmobileapp.api.ApiManager;
import com.example.evchargingmobileapp.interfaces.ApiCallback;
import com.example.evchargingmobileapp.models.ApiResponse;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.journeyapps.barcodescanner.BarcodeEncoder;

import org.json.JSONObject;

public class QRDisplayActivity extends AppCompatActivity {

    private ImageView ivQR;
    private TextView tvStationName, tvBookingTime, tvInstructions;
    private ApiManager apiManager;
    private String bookingId, stationName, bookingTime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_display);

        initializeData();
        initializeViews();
        setupUI();
        generateQRCode();
    }

    private void initializeData() {
        bookingId = getIntent().getStringExtra("BOOKING_ID");
        stationName = getIntent().getStringExtra("STATION_NAME");
        bookingTime = getIntent().getStringExtra("BOOKING_TIME");
        apiManager = new ApiManager(this);
    }

    private void initializeViews() {
        ivQR = findViewById(R.id.ivQR);
        tvStationName = findViewById(R.id.tvStationName);
        tvBookingTime = findViewById(R.id.tvBookingTime);
        tvInstructions = findViewById(R.id.tvInstructions);
    }

    private void setupUI() {
        if (stationName != null) {
            tvStationName.setText( stationName);
        }

        if (bookingTime != null) {
            tvBookingTime.setText(bookingTime);
        }
    }

    private void generateQRCode() {
        if (bookingId == null || bookingId.isEmpty()) {
            showError("Booking ID not found");
            return;
        }

        tvInstructions.setText("Generating QR code...");

        apiManager.generateQRCode(bookingId, new ApiCallback<ApiResponse>() {
            @Override
            public void onSuccess(ApiResponse response) {
                try {
                    String qrData = extractQRDataFromResponse(response);
                    Bitmap qrBitmap = generateQRCodeBitmap(qrData);

                    if (qrBitmap != null) {
                        displayQRCode(qrBitmap);
                    } else {
                        showError("Failed to generate QR image");
                    }

                } catch (Exception e) {
                    generateFallbackQRCode();
                }
            }

            @Override
            public void onError(String errorMessage) {
                generateFallbackQRCode();
            }
        });
    }

    private String extractQRDataFromResponse(ApiResponse response) throws Exception {
        if (response.getData() instanceof String) {
            return (String) response.getData();
        } else {
            JSONObject data = new JSONObject(response.getData().toString());
            return data.getString("qrCodeData");
        }
    }

    private void generateFallbackQRCode() {
        String fallbackData = "EVBooking:" + bookingId + ":" + System.currentTimeMillis();
        Bitmap qrBitmap = generateQRCodeBitmap(fallbackData);

        if (qrBitmap != null) {
            displayQRCode(qrBitmap);
            tvInstructions.setText(" QR Code Generated (Offline)\nShow at charging station");
        } else {
            showError("QR generation failed");
        }
    }

    private Bitmap generateQRCodeBitmap(String data) {
        try {
            MultiFormatWriter writer = new MultiFormatWriter();
            BitMatrix bitMatrix = writer.encode(data, BarcodeFormat.QR_CODE, 500, 500);

            BarcodeEncoder encoder = new BarcodeEncoder();
            return encoder.createBitmap(bitMatrix);

        } catch (WriterException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void displayQRCode(Bitmap qrBitmap) {
        ivQR.setImageBitmap(qrBitmap);
        tvInstructions.setText(" QR Code Generated\nShow this at the charging station");
    }

    private void showError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        tvInstructions.setText(" " + message);
    }
}