package com.exam.online_exam_system.service;

import com.exam.online_exam_system.dto.AdminResultDto;
import com.exam.online_exam_system.dto.DashboardStatsDto;
import com.exam.online_exam_system.dto.ExamRequest;
import com.exam.online_exam_system.dto.ExamSubmitRequest;
import com.exam.online_exam_system.entity.Answer;
import com.exam.online_exam_system.entity.Exam;
import com.exam.online_exam_system.entity.Question;
import com.exam.online_exam_system.entity.User;
import com.exam.online_exam_system.repository.AnswerRepository;
import com.exam.online_exam_system.repository.ExamRepository;
import com.exam.online_exam_system.repository.QuestionRepository;
import com.exam.online_exam_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ExamService {

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private UserRepository userRepository;

    public String submitAnswer(ExamSubmitRequest request) {
        Answer answer = new Answer();
        answer.setUserId(request.getUserId());
        answer.setExamId(request.getExamId());
        answer.setQuestionId(request.getQuestionId());
        answer.setSelectedAnswer(request.getSelectedAnswer());
        answerRepository.save(answer);
        return "Answer Submitted";
    }

    public int calculateScore(Long userId) {
        int score = 0;
        var answers = answerRepository.findByUserId(userId);
        for (Answer answer : answers) {
            Question question = questionRepository.findById(answer.getQuestionId()).orElse(null);
            if (question != null && question.getCorrectAnswer().equals(answer.getSelectedAnswer())) {
                score++;
            }
        }
        return score;
    }

    public Exam createExam(ExamRequest request) {
        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setSubject(request.getSubject());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setPublished(Boolean.TRUE.equals(request.getPublished()));
        return examRepository.save(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Exam getExam(Long id) {
        return examRepository.findById(id).orElseThrow(() -> new RuntimeException("Exam not found"));
    }

    public List<Exam> getPublishedExams() {
        return examRepository.findByPublished(true);
    }

    public List<AdminResultDto> getResultsByUser(Long userId) {
        List<Answer> answers = answerRepository.findByUserId(userId);
        Map<Long, List<Answer>> grouped = answers.stream()
                .collect(Collectors.groupingBy(Answer::getExamId));

        List<AdminResultDto> results = new ArrayList<>();
        User student = userRepository.findById(userId).orElse(null);
        if (student == null) {
            return results;
        }

        for (Map.Entry<Long, List<Answer>> entry : grouped.entrySet()) {
            Long groupedExamId = entry.getKey();
            List<Answer> answerGroup = entry.getValue();
            if (answerGroup.isEmpty()) continue;

            Exam exam = examRepository.findById(groupedExamId).orElse(null);
            if (exam == null) continue;

            int totalQuestions = answerGroup.size();
            int score = 0;
            for (Answer answer : answerGroup) {
                Question question = questionRepository.findById(answer.getQuestionId()).orElse(null);
                if (question != null && question.getCorrectAnswer().equals(answer.getSelectedAnswer())) {
                    score++;
                }
            }

            AdminResultDto dto = new AdminResultDto();
            dto.setUserId(userId);
            dto.setStudentName(student.getName());
            dto.setStudentEmail(student.getEmail());
            dto.setExamId(groupedExamId);
            dto.setExamTitle(exam.getTitle());
            dto.setScore(score);
            dto.setTotalQuestions(totalQuestions);
            dto.setPercentage(totalQuestions > 0 ? (score * 100.0 / totalQuestions) : 0);
            dto.setCompletedAt(exam.getEndTime() != null ? exam.getEndTime() : LocalDateTime.now());
            results.add(dto);
        }

        results.sort(Comparator.comparingInt(AdminResultDto::getScore).reversed());
        return results;
    }

    public Exam updateExam(Long id, ExamRequest request) {
        Exam exam = getExam(id);
        if (request.getTitle() != null) exam.setTitle(request.getTitle());
        if (request.getSubject() != null) exam.setSubject(request.getSubject());
        if (request.getDurationMinutes() != null) exam.setDurationMinutes(request.getDurationMinutes());
        if (request.getTotalMarks() != null) exam.setTotalMarks(request.getTotalMarks());
        if (request.getStartTime() != null) exam.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) exam.setEndTime(request.getEndTime());
        if (request.getPublished() != null) exam.setPublished(request.getPublished());
        return examRepository.save(exam);
    }

    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    public Exam setPublished(Long id, boolean published) {
        Exam exam = getExam(id);
        exam.setPublished(published);
        return examRepository.save(exam);
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalStudents(userRepository.findAllByRole("student").size());
        stats.setTotalExams(examRepository.count());
        stats.setTotalQuestions(questionRepository.count());
        stats.setActiveExams(examRepository.findByPublished(true).size());
        stats.setCompletedExams((int) examRepository.findAll().stream()
                .filter(exam -> exam.isPublished() && exam.getEndTime() != null && exam.getEndTime().isBefore(LocalDateTime.now()))
                .count());
        return stats;
    }

    public List<AdminResultDto> getResults(String query, Long examId) {
        List<Answer> answers = answerRepository.findAll();
        if (examId != null) {
            answers = answers.stream().filter(answer -> Objects.equals(answer.getExamId(), examId)).collect(Collectors.toList());
        }

        Map<String, List<Answer>> grouped = answers.stream()
                .collect(Collectors.groupingBy(answer -> answer.getUserId() + ":" + answer.getExamId()));

        List<AdminResultDto> results = new ArrayList<>();
        for (Map.Entry<String, List<Answer>> entry : grouped.entrySet()) {
            List<Answer> answerGroup = entry.getValue();
            if (answerGroup.isEmpty()) continue;

            Long userId = answerGroup.get(0).getUserId();
            Long groupedExamId = answerGroup.get(0).getExamId();
            User student = userRepository.findById(userId).orElse(null);
            Exam exam = examRepository.findById(groupedExamId).orElse(null);

            if (student == null || exam == null) {
                continue;
            }

            int totalQuestions = answerGroup.size();
            int score = 0;
            for (Answer answer : answerGroup) {
                Question question = questionRepository.findById(answer.getQuestionId()).orElse(null);
                if (question != null && question.getCorrectAnswer().equals(answer.getSelectedAnswer())) {
                    score++;
                }
            }

            AdminResultDto dto = new AdminResultDto();
            dto.setUserId(userId);
            dto.setStudentName(student.getName());
            dto.setStudentEmail(student.getEmail());
            dto.setExamId(groupedExamId);
            dto.setExamTitle(exam.getTitle());
            dto.setScore(score);
            dto.setTotalQuestions(totalQuestions);
            dto.setPercentage(totalQuestions > 0 ? (score * 100.0 / totalQuestions) : 0);
            dto.setCompletedAt(exam.getEndTime() != null ? exam.getEndTime() : LocalDateTime.now());
            results.add(dto);
        }

        if (query != null && !query.isBlank()) {
            String lowerQuery = query.toLowerCase();
            results = results.stream()
                    .filter(dto -> dto.getStudentName().toLowerCase().contains(lowerQuery)
                            || dto.getStudentEmail().toLowerCase().contains(lowerQuery)
                            || dto.getExamTitle().toLowerCase().contains(lowerQuery))
                    .collect(Collectors.toList());
        }

        results.sort(Comparator.comparingInt(AdminResultDto::getScore).reversed());
        return results;
    }
}
