package com.exam.online_exam_system.service.interview;

import com.exam.online_exam_system.dto.*;
import com.exam.online_exam_system.entity.InterviewAnswer;
import com.exam.online_exam_system.entity.InterviewSession;
import com.exam.online_exam_system.repository.InterviewAnswerRepository;
import com.exam.online_exam_system.repository.InterviewSessionRepository;
import com.exam.online_exam_system.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MockInterviewService {

    @Autowired
    private GeminiAIService geminiAIService;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private InterviewAnswerRepository answerRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    // ──────────────────────────────────────────────
    // Generate questions + create session
    // ──────────────────────────────────────────────
    public InterviewGenerateResponse generateInterview(InterviewGenerateRequest request) {
        int count = (request.getQuestionCount() == null || request.getQuestionCount() < 1)
                ? 5 : Math.min(request.getQuestionCount(), 10);

        List<InterviewQuestionDto> questions = geminiAIService.generateQuestions(request.getJobRole(), count);

        InterviewSession session = new InterviewSession();
        session.setUserId(request.getUserId());
        session.setJobRole(request.getJobRole());
        session.setTotalQuestions(questions.size());
        session.setCompleted(false);
        try { session.setQuestionsJson(mapper.writeValueAsString(questions)); } catch (Exception ignored) {}
        InterviewSession saved = sessionRepository.save(session);

        InterviewGenerateResponse response = new InterviewGenerateResponse();
        response.setSessionId(saved.getId());
        response.setJobRole(request.getJobRole());
        response.setQuestions(questions);
        return response;
    }

    // ──────────────────────────────────────────────
    // Evaluate answers
    // ──────────────────────────────────────────────
    public InterviewEvaluateResponse evaluateInterview(InterviewEvaluateRequest request) {
        InterviewEvaluateResponse evalResult = geminiAIService.evaluateAnswers(request);
        evalResult.setSessionId(request.getSessionId());

        for (InterviewEvaluateResponse.QuestionFeedback fb : evalResult.getFeedbacks()) {
            InterviewAnswer answer = new InterviewAnswer();
            answer.setSessionId(request.getSessionId());
            answer.setUserId(request.getUserId());
            answer.setQuestion(fb.getQuestion());
            answer.setUserAnswer(fb.getUserAnswer());
            answer.setAiFeedback(fb.getFeedback());
            answer.setIdealAnswer(fb.getIdealAnswer());
            answer.setScore(fb.getScore());
            answer.setCategory(fb.getCategory());
            answerRepository.save(answer);
        }

        sessionRepository.findById(request.getSessionId()).ifPresent(session -> {
            session.setCompleted(true);
            session.setOverallScore(evalResult.getOverallScore());
            sessionRepository.save(session);
        });

        return evalResult;
    }

    // ──────────────────────────────────────────────
    // User: past sessions
    // ──────────────────────────────────────────────
    public List<InterviewSessionDto> getUserHistory(Long userId) {
        return sessionRepository.findByUserId(userId)
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────
    // Admin: all sessions
    // ──────────────────────────────────────────────
    public List<InterviewSessionDto> getAllSessions() {
        return sessionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────
    // Session detail
    // ──────────────────────────────────────────────
    public List<InterviewAnswer> getSessionAnswers(Long sessionId) {
        return answerRepository.findBySessionId(sessionId);
    }

    private InterviewSessionDto toDto(InterviewSession session) {
        InterviewSessionDto dto = new InterviewSessionDto();
        dto.setId(session.getId());
        dto.setUserId(session.getUserId());
        dto.setJobRole(session.getJobRole());
        dto.setTotalQuestions(session.getTotalQuestions());
        dto.setOverallScore(session.getOverallScore());
        dto.setCompleted(session.isCompleted());
        dto.setCreatedAt(session.getCreatedAt());
        userRepository.findById(session.getUserId())
                      .ifPresent(u -> dto.setStudentName(u.getName()));
        return dto;
    }
}
