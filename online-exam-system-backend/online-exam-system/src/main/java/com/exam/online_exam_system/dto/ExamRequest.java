package com.exam.online_exam_system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExamRequest {
    private String title;
    private String subject;
    private Integer durationMinutes;
    private Integer totalMarks;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean published;
}
