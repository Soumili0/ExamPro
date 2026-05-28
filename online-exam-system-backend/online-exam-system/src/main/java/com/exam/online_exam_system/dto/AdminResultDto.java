package com.exam.online_exam_system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminResultDto {
    private Long userId;
    private String studentName;
    private String studentEmail;
    private Long examId;
    private String examTitle;
    private int score;
    private int totalQuestions;
    private double percentage;
    private LocalDateTime completedAt;
}
