package com.team35.quizapp.dto.game;

import java.util.List;

public record SubmitAnswerRequest(
        String nickname,
        Long questionId,
        List<Long> answerIds
) {}
