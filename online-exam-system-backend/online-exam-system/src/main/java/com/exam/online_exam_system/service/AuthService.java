package com.exam.online_exam_system.service;

import com.exam.online_exam_system.dto.LoginRequest;
import com.exam.online_exam_system.dto.LoginResponse;
import com.exam.online_exam_system.dto.RegisterRequest;
import com.exam.online_exam_system.entity.User;
import com.exam.online_exam_system.repository.UserRepository;
import com.exam.online_exam_system.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        userRepository.save(user);
        return "User Registered Successfully";
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new LoginResponse("User Not Found Please Register", null, null, null, null);
        }

        if (!user.isActive()) {
            return new LoginResponse("Account is deactivated", null, null, null, null);
        }

        boolean validPassword = passwordEncoder.matches(request.getPassword(), user.getPassword())
                || request.getPassword().equals(user.getPassword());

        if (!validPassword) {
            return new LoginResponse("Invalid Password", null, null, null, null);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse("Login Successful", token, user.getRole(), user.getEmail(), user.getId());
    }
}
