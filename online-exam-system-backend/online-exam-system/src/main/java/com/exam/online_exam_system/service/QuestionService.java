package com.exam.online_exam_system.service;

import com.exam.online_exam_system.dto.QuestionRequest;
import com.exam.online_exam_system.entity.Exam;
import com.exam.online_exam_system.entity.Question;
import com.exam.online_exam_system.repository.ExamRepository;
import com.exam.online_exam_system.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    public Question addQuestion(QuestionRequest request) {
        Question question = new Question();
        question.setQuestionTitle(request.getQuestionTitle());
        question.setOption1(request.getOption1());
        question.setOption2(request.getOption2());
        question.setOption3(request.getOption3());
        question.setOption4(request.getOption4());
        question.setCorrectAnswer(request.getCorrectAnswer());

        if (request.getExamId() != null) {
            Exam exam = examRepository.findById(request.getExamId())
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            question.setExam(exam);
        }

        return questionRepository.save(question);
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public List<Question> getQuestionsByExam(Long examId) {
        return questionRepository.findByExamId(examId);
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public Question updateQuestion(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        if (request.getQuestionTitle() != null) {
            question.setQuestionTitle(request.getQuestionTitle());
        }
        if (request.getOption1() != null) {
            question.setOption1(request.getOption1());
        }
        if (request.getOption2() != null) {
            question.setOption2(request.getOption2());
        }
        if (request.getOption3() != null) {
            question.setOption3(request.getOption3());
        }
        if (request.getOption4() != null) {
            question.setOption4(request.getOption4());
        }
        if (request.getCorrectAnswer() != null) {
            question.setCorrectAnswer(request.getCorrectAnswer());
        }
        if (request.getExamId() != null) {
            Exam exam = examRepository.findById(request.getExamId())
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            question.setExam(exam);
        }
        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
}
