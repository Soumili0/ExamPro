package com.exam.online_exam_system.service.interview;

import com.exam.online_exam_system.dto.InterviewEvaluateRequest;
import com.exam.online_exam_system.dto.InterviewEvaluateResponse;
import com.exam.online_exam_system.dto.InterviewQuestionDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * AI Service with dual provider support:
 *   Primary  → Google Gemini 2.0 Flash
 *   Fallback → OpenAI GPT-3.5 Turbo
 *
 * If Gemini fails for any reason, automatically retries with OpenAI.
 */
@Service
public class GeminiAIService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAIService.class);

    @Value("${gemini.api.key:}")
    private String geminiKey;

    @Autowired
    private OpenAIService openAIService;

    @Autowired
    private GroqAIService groqAIService;

    private static final String GEMINI_V1    = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-05-20:generateContent";
    private static final String GEMINI_V1B   = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
    private static final String GEMINI_PRO   = "https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper   = new ObjectMapper();

    // ──────────────────────────────────────────────────────
    // PUBLIC API
    // ──────────────────────────────────────────────────────

    public List<InterviewQuestionDto> generateQuestions(String jobRole, int count) {
        String prompt = buildQuestionPrompt(jobRole, count);
        String raw = callWithFallback(prompt);
        return parseQuestions(raw, count);
    }

    public InterviewEvaluateResponse evaluateAnswers(InterviewEvaluateRequest request) {
        String prompt = buildEvaluationPrompt(request);
        String raw = callWithFallback(prompt);
        return parseEvaluation(raw, request);
    }

    // ──────────────────────────────────────────────────────
    // FALLBACK CHAIN: Groq → Gemini → OpenAI (only if configured)
    // ──────────────────────────────────────────────────────

    private String callWithFallback(String prompt) {
        boolean groqConfigured = groqAIService.isConfigured();
        boolean geminiConfigured = geminiKey != null && !geminiKey.isBlank();
        boolean openAiConfigured = openAIService.isConfigured();

        if (!groqConfigured && !geminiConfigured && !openAiConfigured) {
            throw new RuntimeException(
                "No AI provider is configured. Add a valid Groq or Gemini API key in application.properties."
            );
        }

        List<String> failures = new ArrayList<>();

        // ── 1. Try Groq first (FREE, fastest) ──
        if (groqConfigured) {
            try {
                String result = groqAIService.call(prompt);
                log.info("Groq succeeded.");
                return result;
            } catch (Exception e) {
                String message = "Groq failed: " + e.getMessage();
                failures.add(message);
                log.warn(message);
            }
        }

        // ── 2. Try Gemini (4 methods) ──
        if (geminiConfigured) {
            String body = buildGeminiBody(prompt);

            // Method 1: x-goog-api-key header + v1
            try {
                String result = callGeminiEndpoint(GEMINI_V1, body, "header");
                log.info("Gemini v1 (header) succeeded.");
                return result;
            } catch (Exception e) {
                String message = "Gemini v1 header failed: " + e.getMessage();
                failures.add(message);
                log.warn(message);
            }

            // Method 2: ?key= query param + v1
            try {
                String result = callGeminiEndpoint(GEMINI_V1 + "?key=" + geminiKey, body, "param");
                log.info("Gemini v1 (param) succeeded.");
                return result;
            } catch (Exception e) {
                String message = "Gemini v1 param failed: " + e.getMessage();
                failures.add(message);
                log.warn(message);
            }

            // Method 3: Bearer token + v1beta
            try {
                String result = callGeminiEndpoint(GEMINI_V1B, body, "bearer");
                log.info("Gemini v1beta (bearer) succeeded.");
                return result;
            } catch (Exception e) {
                String message = "Gemini v1beta bearer failed: " + e.getMessage();
                failures.add(message);
                log.warn(message);
            }

            // Method 4: Pro model fallback
            try {
                String result = callGeminiEndpoint(GEMINI_PRO + "?key=" + geminiKey, body, "param");
                log.info("Gemini pro succeeded.");
                return result;
            } catch (Exception e) {
                String message = "Gemini pro failed: " + e.getMessage();
                failures.add(message);
                log.warn(message);
            }
        }

        // ── 3. Fallback to OpenAI only if configured ──
        if (openAiConfigured) {
            log.info("Falling back to OpenAI GPT.");
            return openAIService.call(prompt);
        }

        throw new RuntimeException(
            "No working AI provider is available right now. Groq/Gemini keys are present but failed validation, and OpenAI is disabled because this account has no credits remaining."
        );
    }

    private String callGeminiEndpoint(String url, String body, String authMethod) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json");

        switch (authMethod) {
            case "header" -> builder.header("x-goog-api-key", geminiKey);
            case "bearer" -> builder.header("Authorization", "Bearer " + geminiKey);
            // "param" → key already in URL
        }

        HttpResponse<String> response = httpClient.send(
                builder.POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = mapper.readTree(response.body());
        JsonNode candidates = root.path("candidates");
        if (candidates.isEmpty()) {
            throw new RuntimeException("No candidates in response");
        }
        return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
    }

    private String buildGeminiBody(String prompt) {
        try {
            return """
                    {
                      "contents": [{"parts": [{"text": %s}]}],
                      "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096}
                    }
                    """.formatted(mapper.writeValueAsString(prompt));
        } catch (Exception e) {
            throw new RuntimeException("Failed to build request body", e);
        }
    }

    // ──────────────────────────────────────────────────────
    // PROMPTS
    // ──────────────────────────────────────────────────────

    private String buildQuestionPrompt(String jobRole, int count) {
        boolean isTechnical = jobRole.startsWith("[TECHNICAL]");
        boolean isAptitude  = jobRole.startsWith("[APTITUDE]");
        String topic = jobRole.replaceAll("\\[(TECHNICAL|APTITUDE)]\\s*", "").trim();

        if (isTechnical) {
            return String.format(
                "Generate exactly %d technical multiple-choice questions about '%s'. " +
                "Each question MUST have exactly 4 options and one correct answer. " +
                "Output ONLY a raw JSON array — no markdown, no explanation. " +
                "Each object must have: index (number), question (string), type (always \"mcq\"), " +
                "options (array of exactly 4 strings), correctAnswer (string matching one option exactly), category (string). " +
                "Categories: Technical, Problem Solving, Conceptual. " +
                "Example: [{\"index\":1,\"question\":\"What is a stack?\",\"type\":\"mcq\"," +
                "\"options\":[\"LIFO structure\",\"FIFO structure\",\"Tree structure\",\"Graph structure\"]," +
                "\"correctAnswer\":\"LIFO structure\",\"category\":\"Conceptual\"}]",
                count, topic);
        } else if (isAptitude) {
            return String.format(
                "Generate exactly %d aptitude multiple-choice questions on the topic '%s'. " +
                "CAT/GRE/placement exam style. Each question MUST have exactly 4 options and one correct answer. " +
                "Output ONLY a raw JSON array — no markdown, no explanation. " +
                "Each object must have: index (number), question (string), type (always \"mcq\"), " +
                "options (array of exactly 4 strings like [\"A. 12\",\"B. 15\",\"C. 18\",\"D. 20\"]), " +
                "correctAnswer (string matching one option exactly), category (string). " +
                "Categories: Aptitude, Logical, Verbal. " +
                "Example: [{\"index\":1,\"question\":\"If x+y=10 and x-y=4, find x.\",\"type\":\"mcq\"," +
                "\"options\":[\"A. 5\",\"B. 6\",\"C. 7\",\"D. 8\"]," +
                "\"correctAnswer\":\"C. 7\",\"category\":\"Aptitude\"}]",
                count, topic);
        } else {
            return String.format(
                "Generate exactly %d job interview questions for the role '%s'. " +
                "Mix: 40%% Technical (mcq with 4 options), 30%% Behavioral (text answer), 30%% Situational (text answer). " +
                "Output ONLY a raw JSON array — no markdown, no explanation. " +
                "Each object must have: index (number), question (string), type (\"mcq\" or \"text\"), category (string). " +
                "For type=mcq: also include options (4 strings) and correctAnswer. " +
                "For type=text: no options field needed. " +
                "Categories: Technical, Behavioral, Situational. " +
                "Example mcq: {\"index\":1,\"question\":\"What is REST?\",\"type\":\"mcq\",\"options\":[\"A. Protocol\",\"B. Architecture\",\"C. Language\",\"D. Database\"],\"correctAnswer\":\"B. Architecture\",\"category\":\"Technical\"} " +
                "Example text: {\"index\":2,\"question\":\"Tell me about yourself.\",\"type\":\"text\",\"category\":\"Behavioral\"}",
                count, topic);
        }
    }

    private String buildEvaluationPrompt(InterviewEvaluateRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format(
            "Evaluate the following interview answers for the role '%s'. " +
            "For each answer provide: score (integer 0-10), feedback (2-3 sentences of constructive feedback), idealAnswer (2-4 sentences). " +
            "Output ONLY a raw JSON object — absolutely no markdown, no code blocks, no explanation before or after. " +
            "Required format: {\"overallFeedback\":\"...\",\"answers\":[{\"index\":1,\"score\":8,\"feedback\":\"...\",\"idealAnswer\":\"...\"}]} " +
            "Answers:\n",
            request.getJobRole()));

        List<InterviewEvaluateRequest.AnswerEntry> entries = request.getAnswers();
        for (int i = 0; i < entries.size(); i++) {
            sb.append("Q").append(i + 1)
              .append(" [").append(entries.get(i).getCategory()).append("]: ")
              .append(entries.get(i).getQuestion())
              .append("\nAnswer: ")
              .append(entries.get(i).getAnswer() == null || entries.get(i).getAnswer().isBlank()
                      ? "(no answer provided)" : entries.get(i).getAnswer())
              .append("\n\n");
        }
        return sb.toString();
    }

    // ──────────────────────────────────────────────────────
    // PARSERS
    // ──────────────────────────────────────────────────────

    private List<InterviewQuestionDto> parseQuestions(String raw, int expectedCount) {
        List<InterviewQuestionDto> result = new ArrayList<>();
        try {
            String json = extractJson(raw, "[", "]");
            log.info("Parsing questions JSON (first 400 chars): {}",
                json.length() > 400 ? json.substring(0, 400) : json);
            JsonNode arr = mapper.readTree(json);
            for (JsonNode node : arr) {
                InterviewQuestionDto dto = new InterviewQuestionDto();
                dto.setIndex(node.path("index").asInt(result.size() + 1));
                dto.setQuestion(node.path("question").asText());
                dto.setCategory(node.path("category").asText("General"));

                // MCQ if options array present
                JsonNode optionsNode = node.path("options");
                if (!optionsNode.isMissingNode() && optionsNode.isArray() && optionsNode.size() > 0) {
                    dto.setType("mcq");
                    List<String> opts = new ArrayList<>();
                    optionsNode.forEach(o -> opts.add(o.asText()));
                    dto.setOptions(opts);
                    dto.setCorrectAnswer(node.path("correctAnswer").asText(""));
                } else {
                    dto.setType(node.path("type").asText("text"));
                }
                result.add(dto);
            }
            if (!result.isEmpty()) return result;
        } catch (Exception e) {
            log.warn("Question parse failed: {}", e.getMessage());
        }
        // Fallback — only if parsing completely fails
        for (int i = 1; i <= expectedCount; i++) {
            InterviewQuestionDto dto = new InterviewQuestionDto();
            dto.setIndex(i);
            dto.setQuestion("Describe your approach to problem solving with a real-world example. (Question " + i + ")");
            dto.setCategory("Behavioral");
            dto.setType("text");
            result.add(dto);
        }
        return result;
    }

    private InterviewEvaluateResponse parseEvaluation(String raw, InterviewEvaluateRequest request) {
        InterviewEvaluateResponse response = new InterviewEvaluateResponse();
        response.setJobRole(request.getJobRole());
        List<InterviewEvaluateResponse.QuestionFeedback> feedbacks = new ArrayList<>();

        try {
            String json = extractJson(raw, "{", "}");
            JsonNode root = mapper.readTree(json);
            response.setOverallFeedback(root.path("overallFeedback").asText("Keep practicing!"));

            JsonNode answers = root.path("answers");
            int totalScore = 0;
            List<InterviewEvaluateRequest.AnswerEntry> entries = request.getAnswers();

            for (int i = 0; i < entries.size(); i++) {
                InterviewEvaluateResponse.QuestionFeedback fb = new InterviewEvaluateResponse.QuestionFeedback();
                fb.setIndex(i + 1);
                fb.setQuestion(entries.get(i).getQuestion());
                fb.setUserAnswer(entries.get(i).getAnswer());
                fb.setCategory(entries.get(i).getCategory());

                if (i < answers.size()) {
                    JsonNode ans = answers.get(i);
                    fb.setScore(ans.path("score").asInt(5));
                    fb.setFeedback(ans.path("feedback").asText("Good attempt."));
                    fb.setIdealAnswer(ans.path("idealAnswer").asText(""));
                } else {
                    fb.setScore(5); fb.setFeedback("Keep practicing."); fb.setIdealAnswer("");
                }
                totalScore += fb.getScore();
                feedbacks.add(fb);
            }

            double avg = entries.isEmpty() ? 0 : (double) totalScore / entries.size();
            response.setOverallScore(Math.round(avg * 10.0) / 10.0);
            response.setPerformanceLevel(getPerformanceLevel(avg));

        } catch (Exception e) {
            log.warn("Evaluation parse failed: {}", e.getMessage());
            response.setOverallFeedback("Evaluation complete. Review individual feedback below.");
            response.setOverallScore(5.0);
            response.setPerformanceLevel("Average");
            for (InterviewEvaluateRequest.AnswerEntry entry : request.getAnswers()) {
                InterviewEvaluateResponse.QuestionFeedback fb = new InterviewEvaluateResponse.QuestionFeedback();
                fb.setQuestion(entry.getQuestion());
                fb.setUserAnswer(entry.getAnswer());
                fb.setScore(5);
                fb.setFeedback("Aim for more structured, specific answers with real examples.");
                fb.setIdealAnswer("Provide a concise answer with relevant examples.");
                fb.setCategory(entry.getCategory());
                feedbacks.add(fb);
            }
        }

        response.setFeedbacks(feedbacks);
        return response;
    }

    private String extractJson(String raw, String open, String close) {
        if (raw == null || raw.isBlank()) return raw;
        // Strip all markdown variations
        raw = raw.replaceAll("(?s)```json\\s*", "")
                 .replaceAll("(?s)```javascript\\s*", "")
                 .replaceAll("(?s)```\\s*", "")
                 .trim();
        int start = raw.indexOf(open);
        int end   = raw.lastIndexOf(close);
        if (start != -1 && end > start) {
            String candidate = raw.substring(start, end + 1);
            try { mapper.readTree(candidate); return candidate; }
            catch (Exception ignored) { log.warn("JSON candidate invalid, using raw"); }
        }
        return raw;
    }

    private String getPerformanceLevel(double score) {
        if (score >= 8.5) return "Excellent";
        if (score >= 7.0) return "Good";
        if (score >= 5.0) return "Average";
        return "Needs Improvement";
    }
}
