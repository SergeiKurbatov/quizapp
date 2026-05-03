import { useState, useRef, useCallback } from "react";

/**
 * Custom hook to handle the "Previous -> Delay -> Current" leaderboard reveal.
 * @param {number} delayMs - How long to wait before showing the new data.
 */
export function useDelayedLeaderboard(delayMs = 1000) {
  const [displayLeaderboard, setDisplayLeaderboard] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const prevLeaderboardRef = useRef([]);

  const updateLeaderboard = useCallback((newLeaderboard) => {
    // show the previous data first
    setDisplayLeaderboard(prevLeaderboardRef.current);
    setIsUpdating(true);

    // start the "drumm" delay
    setTimeout(() => {
      const updatedData = newLeaderboard || [];
      setDisplayLeaderboard(updatedData);
      prevLeaderboardRef.current = updatedData;
      setIsUpdating(false);
    }, delayMs);
  }, [delayMs]);

  return { displayLeaderboard, isUpdating, updateLeaderboard };
}