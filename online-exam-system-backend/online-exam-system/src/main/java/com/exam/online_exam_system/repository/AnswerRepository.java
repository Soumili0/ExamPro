package com.exam.online_exam_system.repository;

import com.exam.online_exam_system.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository
        extends JpaRepository<Answer, Long> {

    List<Answer> findByUserId(Long userId);
}