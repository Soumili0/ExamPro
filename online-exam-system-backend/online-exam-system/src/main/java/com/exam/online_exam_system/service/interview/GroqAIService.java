package com.exam.online_exam_system.service.interview;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

/**
 * Groq API — FREE, fast, uses llama-3.3-70b model.
 * Get free key at: https://console.groq.com
 */
@Service
public class GroqAIService {

    private static final Logger log = LoggerFactory.getLogger(GroqAIService.class);

    @Value("${groq.api.key:}")
    private String apiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama3-70b-8192";

    private final HttpClient  httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper    = new ObjectMapper();

    public boolean isConfigured() {
        boolean configured = apiKey != null && !apiKey.isBlank() && apiKey.startsWith("gsk_");
        log.info("Groq isConfigured: {} (key prefix: {})", configured,
                apiKey != null && apiKey.length() > 6 ? apiKey.substring(0, 6) + "..." : "empty");
        return configured;
    }

    public String call(String prompt) {
        if (!isConfigured()) {
            throw new RuntimeException("Groq API key not configured.");
        }
        log.info("Calling Groq API with model: {}", MODEL);
        try {
            String body = mapper.writeValueAsString(Map.of(
                "model", MODEL,
                "messages", List.of(
                    Map.of("role", "system",
                           "content", "You are an expert interviewer and exam coach. Always respond with valid JSON only. No markdown, no code blocks, no extra text."),
                    Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens",  4096
            ));

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Groq error {}: {}", response.statusCode(), response.body());
                throw new RuntimeException(
                    "Groq API error " + response.statusCode() + ": " + response.body());
            }

            log.info("Groq API call successful");
            JsonNode root = mapper.readTree(response.body());
            String content = root.path("choices").get(0)
                       .path("message").path("content").asText();
            log.info("Groq raw response (first 300 chars): {}", 
                content.length() > 300 ? content.substring(0, 300) : content);
            return content;

        } catch (Exception e) {
            throw new RuntimeException("Groq call failed: " + e.getMessage(), e);
        }
    }
}
