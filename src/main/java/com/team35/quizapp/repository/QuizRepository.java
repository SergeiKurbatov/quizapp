package com.team35.quizapp.repository;

import com.team35.quizapp.entity.Quiz;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    // Find quizzes where the creator's email matches
    List<Quiz> findByCreatorEmail(String email);
}
