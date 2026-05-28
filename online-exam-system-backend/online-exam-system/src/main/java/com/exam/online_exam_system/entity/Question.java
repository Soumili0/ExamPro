package com.exam.online_exam_system.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String questionTitle;

    private String option1;

    private String option2;

    private String option3;

    private String option4;

    private String correctAnswer;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonIgnoreProperties("questions")
    private Exam exam;
}
