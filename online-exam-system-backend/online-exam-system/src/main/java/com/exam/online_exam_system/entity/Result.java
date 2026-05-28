package com.exam.online_exam_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long quizId;

    private int totalQuestions;

    private int correctAnswers;

    private int incorrectAnswers;

    private double percentage;

    private LocalDateTime submittedAt;

    private String status;
}
