import { useState, useRef, useCallback, useEffect } from "react";


export function useVideoPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onLoadMetadata = () => setDuration(video.duration);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("loadedmetadata", onLoadMetadata);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("ended", onPause);

        return () => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            video.removeEventListener("loadedmetadata", onLoadMetadata);
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("ended", onPause);
        };
    }, []);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.paused ? video.play() : video.pause();
    }, []);
    
    const seek = useCallback((time: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = time;
        setCurrentTime(time);
    }, []);

    return {
        videoRef,
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        seek
    };
}