/*******************************************************
 *file :         LoginRequest.java
 *Author:        IT22149626 - Chandrasiri G.A.S.D.
 ********************************************************/


package com.example.evchargingmobileapp.models;

public class LoginRequest {
    private String nic;
    private String password;
    private String role;

    public LoginRequest() {}

    public LoginRequest(String nic, String password) {
        this.nic = nic;
        this.password = password;
    }

    public LoginRequest(String nic, String password, String role) {
        this.nic = nic;
        this.password = password;
        this.role = role;
    }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}