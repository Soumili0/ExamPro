package com.exam.online_exam_system.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewSessionDto {
    private Long id;
    private Long userId;
    private String studentName;
    private String jobRole;
    private Integer totalQuestions;
    private Double overallScore;
    private boolean completed;
    private LocalDateTime createdAt;
}
