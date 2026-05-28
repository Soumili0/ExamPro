package com.exam.online_exam_system.dto;

import lombok.Data;

@Data
public class LoginResponse {

    private String message;

    private String token;

    private String role;

    private String email;

    private Long userId;

    public LoginResponse(String message, String token, String role, String email, Long userId) {
        this.message = message;
        this.token = token;
        this.role = role;
        this.email = email;
        this.userId = userId;
    }

    public LoginResponse(String message, String role, String email) {
        this.message = message;
        this.role = role;
        this.email = email;
        this.token = null;
        this.userId = null;
    }
}