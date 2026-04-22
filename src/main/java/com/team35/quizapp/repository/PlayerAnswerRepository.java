package com.team35.quizapp.repository;

import com.team35.quizapp.entity.PlayerAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlayerAnswerRepository extends JpaRepository<PlayerAnswer, Long> {
    boolean existsByPlayerIdAndQuestionId(Long playerId, Long questionId);

    // Count distinct players who answered a question (for answer-count broadcast)
    @Query("SELECT COUNT(DISTINCT pa.player.id) FROM PlayerAnswer pa WHERE pa.player.gameSession.gamePin = :gamePin AND pa.question.id = :questionId")
    long countDistinctPlayersByGamePinAndQuestionId(@Param("gamePin") Integer gamePin, @Param("questionId") Long questionId);
}
