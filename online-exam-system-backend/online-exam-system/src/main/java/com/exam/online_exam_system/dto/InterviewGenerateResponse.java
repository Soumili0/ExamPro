package com.exam.online_exam_system.dto;

import lombok.Data;
import java.util.List;

@Data
public class InterviewGenerateResponse {
    private Long sessionId;
    private String jobRole;
    private List<InterviewQuestionDto> questions;
}
