package com.example.evchargingmobileapp.interfaces;

public interface ApiCallback<T> {
    void onSuccess(T response);
    void onError(String errorMessage);
}