package com.exam.online_exam_system.repository;

import com.exam.online_exam_system.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {
    List<Question> findByExamId(Long examId);
}