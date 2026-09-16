package com.exam.online_exam_system.dto;

import lombok.Data;
import java.util.List;

@Data
public class InterviewEvaluateResponse {
    private Long sessionId;
    private String jobRole;
    private double overallScore;        // average out of 10
    private String overallFeedback;
    private String performanceLevel;    // Excellent / Good / Average / Needs Improvement
    private List<QuestionFeedback> feedbacks;

    @Data
    public static class QuestionFeedback {
        private int index;
        private String question;
        private String userAnswer;
        private String idealAnswer;
        private String feedback;
        private int score;              // 0-10
        private String category;
    }
}
