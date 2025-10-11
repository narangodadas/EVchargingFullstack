/*******************************************************
 *file :         User.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/

package com.example.evchargingmobileapp.models;

public class User {
    private String nic;
    private String name;
    private String email;
    private String password;
    private String role; // "evowner", "stationoperator"
    private boolean isActive;
    private String createdAt;

    public User() {}

    public User(String nic, String name, String email, String password, String role) {
        this.nic = nic;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.isActive = true;
    }

    // Getters and Setters
    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}