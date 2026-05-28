package com.exam.online_exam_system.controller;

import com.exam.online_exam_system.dto.LoginRequest;
import com.exam.online_exam_system.dto.LoginResponse;
import com.exam.online_exam_system.dto.RegisterRequest;
import com.exam.online_exam_system.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Register API
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    // Login API
    @PostMapping("/login")
public LoginResponse login(
        @RequestBody LoginRequest request) {

    return authService.login(request);
}
}