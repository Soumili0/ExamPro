package com.exam.online_exam_system.dto;

import lombok.Data;
import java.util.List;

@Data
public class InterviewQuestionDto {
    private int index;
    private String question;
    private String category;   // Technical / Behavioral / Situational / Aptitude / Logical
    private String type;       // "mcq" | "text"  — frontend uses this to render UI
    private List<String> options;  // A, B, C, D — only present when type = "mcq"
    private String correctAnswer;  // correct option text — for MCQ
}
