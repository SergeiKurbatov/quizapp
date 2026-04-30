package com.team35.quizapp.config;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;

@Component
public class JoinRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 60_000;

    private final ConcurrentHashMap<String, List<Long>> attempts = new ConcurrentHashMap<>();

    public boolean isAllowed(String ip) {
        long now = System.currentTimeMillis();
        attempts.compute(ip, (key, timestamps) -> {
            if (timestamps == null) timestamps = new CopyOnWriteArrayList<>();
            timestamps.removeIf(t -> now - t > WINDOW_MS);
            return timestamps;
        });
        List<Long> timestamps = attempts.get(ip);
        if (timestamps.size() >= MAX_ATTEMPTS) return false;
        timestamps.add(now);
        return true;
    }
}