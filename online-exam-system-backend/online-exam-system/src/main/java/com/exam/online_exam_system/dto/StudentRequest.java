package com.exam.online_exam_system.dto;

import lombok.Data;

@Data
public class StudentRequest {
    private String name;
    private String email;
    private String password;
    private String roll;
    private String department;
    private boolean active = true;
}
