import { useEffect, useRef, useState } from "react";

const TRACKS = {
  waiting:  { src: "/audio/lobby.mp3",    loop: true,  volume: 0.3 },
  playing:  { src: "/audio/question.mp3", loop: true,  volume: 0.3 },
  result:   { src: "/audio/result.mp3",   loop: false, volume: 0.5 },
  finished: { src: "/audio/victory.mp3",  loop: false, volume: 0.5 },
};

export function useGameMusic(phase, enabled = true) {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(() => localStorage.getItem("quiz-muted") === "1");

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    const track = TRACKS[phase];
    if (!track || muted || !enabled) { audio.pause(); return; }
    if (!audio.src.endsWith(track.src)) {
      audio.src = track.src;
      audio.currentTime = 0;
    }
    audio.loop = track.loop;
    audio.volume = track.volume;
    audio.play().catch(() => {});
    return () => { if (!track.loop) audio.pause(); };
  }, [phase, muted, enabled]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return {
    muted,
    toggleMute: () => setMuted(m => {
      const n = !m;
      localStorage.setItem("quiz-muted", n ? "1" : "0");
      return n;
    }),
  };
}
