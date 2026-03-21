package com.team35.quizapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "player",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_player_session_nickname",
        columnNames = {"game_session_id", "nickname"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", nullable = false)
    @JsonIgnore
    private GameSession gameSession;

    @Column(nullable = false)
    private String nickname;

    @Builder.Default
    private Integer score = 0;

    @CreationTimestamp
    private LocalDateTime joinedAt;

    @Builder.Default
    private Boolean isKicked = false;
}
