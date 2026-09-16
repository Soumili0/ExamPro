package com.exam.online_exam_system.repository;

import com.exam.online_exam_system.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {
    List<InterviewAnswer> findBySessionId(Long sessionId);
    List<InterviewAnswer> findByUserId(Long userId);
}
