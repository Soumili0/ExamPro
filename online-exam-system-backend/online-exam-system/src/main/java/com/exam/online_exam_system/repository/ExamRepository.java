package com.exam.online_exam_system.repository;

import com.exam.online_exam_system.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByPublished(boolean published);
}
