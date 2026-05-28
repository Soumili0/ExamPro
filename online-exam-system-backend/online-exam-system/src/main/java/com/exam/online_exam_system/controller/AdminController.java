package com.exam.online_exam_system.controller;

import com.exam.online_exam_system.dto.AdminResultDto;
import com.exam.online_exam_system.dto.DashboardStatsDto;
import com.exam.online_exam_system.dto.ExamRequest;
import com.exam.online_exam_system.dto.QuestionRequest;
import com.exam.online_exam_system.dto.ResetPasswordRequest;
import com.exam.online_exam_system.dto.StudentRequest;
import com.exam.online_exam_system.entity.Exam;
import com.exam.online_exam_system.entity.Question;
import com.exam.online_exam_system.entity.User;
import com.exam.online_exam_system.service.ExamService;
import com.exam.online_exam_system.service.QuestionService;
import com.exam.online_exam_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ExamService examService;

    @Autowired
    private QuestionService questionService;

    @GetMapping("/stats")
    public DashboardStatsDto getStats() {
        return examService.getDashboardStats();
    }

    @GetMapping("/students")
    public List<User> getStudents() {
        return userService.getAllStudents();
    }

    @PostMapping("/students")
    public User addStudent(@RequestBody StudentRequest request) {
        return userService.createStudent(request);
    }

    @PutMapping("/students/{id}")
    public User updateStudent(@PathVariable Long id, @RequestBody StudentRequest request) {
        return userService.updateStudent(id, request);
    }

    @DeleteMapping("/students/{id}")
    public String deleteStudent(@PathVariable Long id) {
        userService.deleteStudent(id);
        return "Student deleted";
    }

    @PutMapping("/students/{id}/active")
    public User setStudentActive(@PathVariable Long id, @RequestParam boolean active) {
        return userService.setActive(id, active);
    }

    @PostMapping("/students/{id}/reset-password")
    public String resetStudentPassword(@PathVariable Long id, @RequestBody ResetPasswordRequest request) {
        return userService.resetPassword(id, request);
    }

    @GetMapping("/exams")
    public List<Exam> getExams() {
        return examService.getAllExams();
    }

    @PostMapping("/exams")
    public Exam createExam(@RequestBody ExamRequest request) {
        return examService.createExam(request);
    }

    @PutMapping("/exams/{id}")
    public Exam updateExam(@PathVariable Long id, @RequestBody ExamRequest request) {
        return examService.updateExam(id, request);
    }

    @DeleteMapping("/exams/{id}")
    public String deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return "Exam deleted";
    }

    @PutMapping("/exams/{id}/publish")
    public Exam publishExam(@PathVariable Long id, @RequestParam boolean published) {
        return examService.setPublished(id, published);
    }

    @GetMapping("/questions")
    public List<Question> getQuestions() {
        return questionService.getAllQuestions();
    }

    @PostMapping("/questions")
    public Question addQuestion(@RequestBody QuestionRequest request) {
        return questionService.addQuestion(request);
    }

    @PutMapping("/questions/{id}")
    public Question updateQuestion(@PathVariable Long id, @RequestBody QuestionRequest request) {
        return questionService.updateQuestion(id, request);
    }

    @DeleteMapping("/questions/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return "Question deleted";
    }

    @GetMapping("/results")
    public List<AdminResultDto> getResults(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long examId
    ) {
        return examService.getResults(query, examId);
    }
}
