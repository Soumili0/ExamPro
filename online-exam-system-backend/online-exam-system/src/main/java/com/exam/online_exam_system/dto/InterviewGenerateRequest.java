package com.exam.online_exam_system.dto;

import lombok.Data;

@Data
public class InterviewGenerateRequest {
    private String jobRole;
    private Integer questionCount; // defaults to 5 if null
    private Long userId;
}
