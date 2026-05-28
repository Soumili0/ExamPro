package com.exam.online_exam_system.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String password; // current password for verification
    private String newPassword; // new password if changing
}
