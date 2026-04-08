package com.team35.quizapp.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team35.quizapp.entity.Quiz;
import com.team35.quizapp.repository.QuizRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {
    private final QuizRepository quizRepository;

    @GetMapping("/my-quizzes")
    public ResponseEntity<List<Quiz>> getMyQuizzes(Principal principal) {
        // Principal is automatically populated by Spring Security from JWT
        String email = principal.getName(); 
        return ResponseEntity.ok(quizRepository.findByCreatorEmail(email));
    }
}

    private final QuizService quizService;

    @Operation(summary = "Create a new quiz")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuizResponse createQuiz(@RequestBody CreateQuizRequest request) {
        return quizService.createQuiz(request);
    }

    @Operation(summary = "Get my quizzes")
    @GetMapping
    public List<QuizResponse> getMyQuizzes() {
        return quizService.getMyQuizzes();
    }

    @Operation(summary = "Delete a quiz")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
    }
}
