package com.exam.online_exam_system.dto;

import lombok.Data;
import java.util.List;

@Data
public class InterviewEvaluateRequest {
    private Long sessionId;
    private Long userId;
    private String jobRole;
    private List<AnswerEntry> answers;

    @Data
    public static class AnswerEntry {
        private String question;
        private String answer;
        private String category;
    }
}
