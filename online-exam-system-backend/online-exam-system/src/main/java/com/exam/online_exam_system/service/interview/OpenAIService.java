package com.exam.online_exam_system.service.interview;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Calls OpenAI GPT API (gpt-3.5-turbo / gpt-4o-mini).
 * Used as fallback when Gemini API fails.
 */
@Service
public class OpenAIService {

    @Value("${openai.api.key:}")
    private String apiKey;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equals("YOUR_OPENAI_API_KEY_HERE");
    }

    public String call(String prompt) {
        if (!isConfigured()) {
            throw new RuntimeException("OpenAI API key not configured.");
        }
        try {
            String requestBody = mapper.writeValueAsString(java.util.Map.of(
                "model", "gpt-4o-mini",
                "messages", java.util.List.of(
                    java.util.Map.of("role", "system", "content", "You are an expert interviewer and exam coach. Always respond with valid JSON only, no markdown formatting."),
                    java.util.Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 2048
            ));

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("OpenAI API error " + response.statusCode() + ": " + response.body());
            }

            JsonNode root = mapper.readTree(response.body());
            return root.path("choices").get(0)
                    .path("message").path("content").asText();

        } catch (Exception e) {
            throw new RuntimeException("OpenAI call failed: " + e.getMessage(), e);
        }
    }
}
