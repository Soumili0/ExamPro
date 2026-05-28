package com.exam.online_exam_system.controller;

import com.exam.online_exam_system.dto.QuestionRequest;
import com.exam.online_exam_system.entity.Question;
import com.exam.online_exam_system.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // Add Question
    @PostMapping
    public Question addQuestion(
            @RequestBody QuestionRequest question) {

        return questionService.addQuestion(question);
    }

    // Get All Questions
    @GetMapping
    public List<Question> getAllQuestions() {

        return questionService.getAllQuestions();
    }

    // Get Questions by Exam
    @GetMapping("/exam/{examId}")
    public List<Question> getQuestionsByExam(@PathVariable Long examId) {
        return questionService.getQuestionsByExam(examId);
    }
}