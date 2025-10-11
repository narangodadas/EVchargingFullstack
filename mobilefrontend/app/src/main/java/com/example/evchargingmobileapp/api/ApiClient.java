package com.example.evchargingmobileapp.api;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import android.util.Log;

public class ApiClient {
    private static final String BASE_URL = "http://192.168.124.14:7000/api/";  // <-- Changed to HTTP

    private static Retrofit retrofit = null;

    public static Retrofit getClient() {
        if (retrofit == null) {
            Log.d("ApiClient", "Creating Retrofit instance with URL: " + BASE_URL);

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}