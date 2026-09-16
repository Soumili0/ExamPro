package com.exam.online_exam_system.controller;

import com.exam.online_exam_system.dto.*;
import com.exam.online_exam_system.entity.InterviewAnswer;
import com.exam.online_exam_system.service.interview.MockInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
public class MockInterviewController {

    @Autowired
    private MockInterviewService mockInterviewService;

    /**
     * POST /api/interview/generate
     * Body: { jobRole, questionCount, userId }
     * Returns: { sessionId, jobRole, questions[] }
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateInterview(
            @RequestBody InterviewGenerateRequest request) {
        try {
            InterviewGenerateResponse response = mockInterviewService.generateInterview(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildAiErrorResponse(e, "generate");
        }
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateInterview(
            @RequestBody InterviewEvaluateRequest request) {
        try {
            InterviewEvaluateResponse response = mockInterviewService.evaluateInterview(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildAiErrorResponse(e, "evaluate");
        }
    }

    /**
     * GET /api/interview/history/{userId}
     * Returns all past interview sessions for a user
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<InterviewSessionDto>> getUserHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(mockInterviewService.getUserHistory(userId));
    }

    /**
     * GET /api/interview/session/{sessionId}/answers
     * Returns detailed answers for a session
     */
    @GetMapping("/session/{sessionId}/answers")
    public ResponseEntity<List<InterviewAnswer>> getSessionAnswers(@PathVariable Long sessionId) {
        return ResponseEntity.ok(mockInterviewService.getSessionAnswers(sessionId));
    }

    /**
     * GET /api/interview/test-ai
     * Tests both AI providers and returns which one works.
     */
    @GetMapping("/test-ai")
    public ResponseEntity<?> testAI() {
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        try {
            InterviewGenerateRequest req = new InterviewGenerateRequest();
            req.setJobRole("Software Engineer");
            req.setQuestionCount(1);
            req.setUserId(0L);
            InterviewGenerateResponse resp = mockInterviewService.generateInterview(req);
            result.put("status", "SUCCESS");
            result.put("provider", "AI");
            result.put("firstQuestion", resp.getQuestions().isEmpty() ? "none" : resp.getQuestions().get(0).getQuestion());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("error", buildAiMessage(e));
            return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).body(result);
        }
    }

    private ResponseEntity<?> buildAiErrorResponse(Exception e, String operation) {
        String message = buildAiMessage(e);

        if (message.contains("No working AI provider") || message.contains("configured") || message.contains("Groq") || message.contains("Gemini")) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).body(
                java.util.Map.of("message", message)
            );
        }

        return ResponseEntity.internalServerError().body(
            java.util.Map.of("message", operation.equals("evaluate") ? "AI evaluation error: " + message : "AI service error: " + message)
        );
    }

    private String buildAiMessage(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Unknown AI error";

        if (msg.contains("No working AI provider") || msg.contains("No AI provider is configured")) {
            return "AI service is temporarily unavailable. Please configure a valid Groq or Gemini API key, or contact the administrator.";
        }

        if (msg.contains("OpenAI") || msg.contains("credit") || msg.contains("quota") || msg.contains("429")) {
            return "AI service is temporarily unavailable because the OpenAI account has no credits remaining. Please add a valid Groq or Gemini API key.";
        }

        if (msg.contains("Groq") || msg.contains("Gemini") || msg.contains("API key") || msg.contains("401") || msg.contains("403") || msg.contains("404")) {
            return "AI service is temporarily unavailable. Please verify the Groq or Gemini API keys in application.properties.";
        }

        return msg;
    }
    @GetMapping("/admin/all")
    public ResponseEntity<List<InterviewSessionDto>> getAllSessions() {
        return ResponseEntity.ok(mockInterviewService.getAllSessions());
    }
}
