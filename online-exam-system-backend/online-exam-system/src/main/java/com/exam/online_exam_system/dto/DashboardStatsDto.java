package com.exam.online_exam_system.dto;

import lombok.Data;

@Data
public class DashboardStatsDto {
    private long totalStudents;
    private long totalExams;
    private long totalQuestions;
    private long activeExams;
    private long completedExams;
}
