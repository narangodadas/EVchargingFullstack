/*******************************************************
 *file :         UserUpdateRequest.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/

package com.example.evchargingmobileapp.models;

public class UserUpdateRequest {
    private String name;
    private String email;
    private String password;

    // Constructors, getters, setters
    public UserUpdateRequest() {}
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}