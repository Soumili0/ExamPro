package com.exam.online_exam_system.controller;

import com.exam.online_exam_system.dto.ExamSubmitRequest;
import com.exam.online_exam_system.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exam")
public class ExamController {

    @Autowired
    private ExamService examService;

    // Submit Answer
    @PostMapping("/submit")
    public String submitAnswer(
            @RequestBody ExamSubmitRequest request) {

        return examService.submitAnswer(request);
    }

    // Get Score
    @GetMapping("/score/{userId}")
    public int getScore(
            @PathVariable Long userId) {

        return examService.calculateScore(userId);
    }
}