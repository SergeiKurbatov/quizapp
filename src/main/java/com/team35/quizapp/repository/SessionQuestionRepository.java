package com.team35.quizapp.repository;

import com.team35.quizapp.entity.SessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionQuestionRepository extends JpaRepository<SessionQuestion, Long> {
}
