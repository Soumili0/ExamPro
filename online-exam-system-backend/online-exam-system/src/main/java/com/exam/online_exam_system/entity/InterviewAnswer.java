package com.exam.online_exam_system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "interview_answer")
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId;

    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(columnDefinition = "TEXT")
    private String idealAnswer;

    private Integer score;       // 0-10 per question

    private String category;     // e.g. "Technical", "Behavioral"
}
