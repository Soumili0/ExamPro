package com.exam.online_exam_system.dto;

import lombok.Data;

@Data
public class ExamSubmitRequest {

    private Long userId;

    private Long examId;

    private Long questionId;

    private String selectedAnswer;
}