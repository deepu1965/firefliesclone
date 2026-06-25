"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { TranscriptSegment } from "@/types/transcript";
import { msToMmss } from "@/lib/utils/time";

function findActiveSegment(segments: TranscriptSegment[], currentMs: number): number | null {
  if (!segments.length) return null;
  let lo = 0;
  let hi = segments.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (segments[mid].end_time_ms <= currentMs) lo = mid + 1;
    else if (segments[mid].start_time_ms > currentMs) hi = mid - 1;
    else return segments[mid].id;
  }
  return null;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

interface MediaPlayerProps {
  audioSrc: string;
  segments: TranscriptSegment[];
}

export function MediaPlayer({ audioSrc, segments }: MediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const {
    currentTimeMs,
    isPlaying,
    duration,
    setCurrentTime,
    setIsPlaying,
    setDuration,
    setActiveSegmentId,
    setAudioRef,
    seekTo,
  } = usePlayerStore();

  useEffect(() => {
    setAudioRef(audioRef);
  }, [setAudioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const ms = Math.floor(audio.currentTime * 1000);
      setCurrentTime(ms);
      setActiveSegmentId(findActiveSegment(segments, ms));
    };
    const onLoadedMetadata = () => setDuration(Math.floor(audio.duration * 1000));
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setActiveSegmentId(null); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [segments, setCurrentTime, setIsPlaying, setDuration, setActiveSegmentId]);

  useEffect(() => {
    if (segments.length > 0) {
      setActiveSegmentId(segments[0].id);
    }
  }, [segments, setActiveSegmentId]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const skipBy = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newMs = Math.max(0, Math.min(duration, currentTimeMs + seconds * 1000));
    seekTo(newMs);
  }, [currentTimeMs, duration, seekTo]);

  const getRatioFromEvent = useCallback((e: React.MouseEvent) => {
    const bar = seekBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }, []);

  const handleSeekBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      setIsSeeking(true);
      const ratio = getRatioFromEvent(e);
      seekTo(Math.floor(ratio * duration));
    },
    [duration, getRatioFromEvent, seekTo]
  );

  const handleSeekBarMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const ratio = getRatioFromEvent(e);
      setSeekPreview(Math.floor(ratio * duration));
      if (isSeeking) {
        seekTo(Math.floor(ratio * duration));
      }
    },
    [duration, getRatioFromEvent, isSeeking, seekTo]
  );

  const handleSpeedChange = useCallback(
    (s: number) => {
      setSpeed(s);
      if (audioRef.current) audioRef.current.playbackRate = s;
    },
    []
  );

  const progress = duration > 0 ? Math.min((currentTimeMs / duration) * 100, 100) : 0;
  const previewProgress =
    seekPreview !== null && duration > 0
      ? Math.min((seekPreview / duration) * 100, 100)
      : null;

  return (
    <>
      <audio ref={audioRef} preload="metadata">
        <source src={audioSrc} type="audio/mpeg" />
        <source src="/sample-audio.wav" type="audio/wav" />
      </audio>

      <div
        className="bg-ff-bg-sidebar border-b border-ff-border px-4 flex items-center gap-2.5 h-[42px] shrink-0 select-none"
        onMouseUp={() => setIsSeeking(false)}
        onMouseLeave={() => { setIsSeeking(false); setSeekPreview(null); }}
      >
        {/* Skip back 15s */}
        <button
          onClick={() => skipBy(-15)}
          className="hidden sm:flex w-6 h-6 items-center justify-center text-ff-text-dim hover:text-ff-text-body transition-colors shrink-0"
          aria-label="Skip back 15 seconds"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a4 4 0 104-4H5M5 1L3 3l2 2" />
            <text x="5.5" y="9" fontSize="3.5" fill="currentColor" stroke="none" textAnchor="middle" fontFamily="sans-serif">15</text>
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-7 h-7 rounded-full bg-ff-accent flex items-center justify-center shrink-0 hover:bg-ff-accent-light transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="white">
              <rect x="1" y="0.5" width="2.5" height="8" rx="0.5" />
              <rect x="5.5" y="0.5" width="2.5" height="8" rx="0.5" />
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="white">
              <path d="M1.5 1l6.5 3.5-6.5 3.5z" />
            </svg>
          )}
        </button>

        {/* Skip forward 15s */}
        <button
          onClick={() => skipBy(15)}
          className="hidden sm:flex w-6 h-6 items-center justify-center text-ff-text-dim hover:text-ff-text-body transition-colors shrink-0"
          aria-label="Skip forward 15 seconds"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 7a4 4 0 11-4-4h2M9 1l2 2-2 2" />
            <text x="8.5" y="9" fontSize="3.5" fill="currentColor" stroke="none" textAnchor="middle" fontFamily="sans-serif">15</text>
          </svg>
        </button>

        {/* Current time */}
        <span className="text-[11px] text-ff-text-dim shrink-0 tabular-nums w-10 text-right">
          {msToMmss(currentTimeMs)}
        </span>

        {/* Seek bar */}
        <div
          ref={seekBarRef}
          className="flex-1 h-[4px] bg-ff-bg-surface rounded-full cursor-pointer relative group"
          onMouseDown={handleSeekBarMouseDown}
          onMouseMove={handleSeekBarMouseMove}
          onMouseUp={() => setIsSeeking(false)}
        >
          {/* Filled progress */}
          <div
            className="h-full bg-ff-accent rounded-full pointer-events-none transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
          {/* Preview overlay */}
          {previewProgress !== null && (
            <div
              className="absolute inset-y-0 left-0 bg-ff-accent-light opacity-20 rounded-full pointer-events-none"
              style={{ width: `${previewProgress}%` }}
            />
          )}
          {/* Thumb */}
          <div
            className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-ff-accent-light shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        {/* Duration */}
        <span className="text-[11px] text-ff-text-dim shrink-0 tabular-nums w-10">
          {msToMmss(duration)}
        </span>

        {/* Speed selector */}
        <div className="relative shrink-0">
          <select
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="appearance-none bg-ff-bg-surface border border-ff-border rounded-[5px] px-2 py-0.5 text-[11px] text-ff-badge-text cursor-pointer hover:border-ff-border-active transition-colors outline-none"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
