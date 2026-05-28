package com.exam.online_exam_system.service;

import com.exam.online_exam_system.dto.ResetPasswordRequest;
import com.exam.online_exam_system.dto.StudentRequest;
import com.exam.online_exam_system.dto.UpdateProfileRequest;
import com.exam.online_exam_system.entity.User;
import com.exam.online_exam_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllStudents() {
        return userRepository.findAllByRole("student");
    }

    public User createStudent(StudentRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("student");
        user.setRoll(request.getRoll());
        user.setDepartment(request.getDepartment());
        user.setActive(request.isActive());
        return userRepository.save(user);
    }

    public User updateStudent(Long studentId, StudentRequest request) {
        User user = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRoll() != null) {
            user.setRoll(request.getRoll());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        user.setActive(request.isActive());
        return userRepository.save(user);
    }

    public void deleteStudent(Long studentId) {
        userRepository.deleteById(studentId);
    }

    public User setActive(Long studentId, boolean active) {
        User user = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        user.setActive(active);
        return userRepository.save(user);
    }

    public String resetPassword(Long studentId, ResetPasswordRequest request) {
        User user = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return "Password reset successfully";
    }

    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword()) && !request.getPassword().equals(user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        return userRepository.save(user);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
