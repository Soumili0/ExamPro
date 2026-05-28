package com.exam.online_exam_system.controller;

import com.exam.online_exam_system.dto.AdminResultDto;
import com.exam.online_exam_system.dto.UpdateProfileRequest;
import com.exam.online_exam_system.entity.Exam;
import com.exam.online_exam_system.entity.User;
import com.exam.online_exam_system.service.ExamService;
import com.exam.online_exam_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ExamService examService;

    @PutMapping("/profile")
    public User updateProfile(@RequestParam Long userId, @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(userId, request);
    }

    @GetMapping("/profile")
    public User getProfile(@RequestParam Long userId) {
        return userService.getUserById(userId);
    }

    @GetMapping("/exams")
    public List<Exam> getPublishedExams() {
        return examService.getPublishedExams();
    }

    @GetMapping("/results/{userId}")
    public List<AdminResultDto> getUserResults(@PathVariable Long userId) {
        return examService.getResultsByUser(userId);
    }
}
