package com.team35.quizapp.dto.websocket;

import java.util.Map;

public record PlayerStatusMessage(Map<String, Boolean> status) {}