package com.exam.online_exam_system.repository;

import com.exam.online_exam_system.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserId(Long userId);
    List<InterviewSession> findAllByOrderByCreatedAtDesc();
}
