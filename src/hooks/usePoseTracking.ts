import { useState, useEffect, useRef, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export type Landmark = {
  x: number;
  y: number;
  z: number;
};

export const usePoseTracking = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [latestLandmark, setLatestLandmark] = useState<Landmark | null>(null);
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        poseLandmarkerRef.current = landmarker;
        setIsLoading(false);
      } catch (e) {
        console.error("Error loading PoseLandmarker:", e);
        setError("Failed to load the AI model. Please try again later.");
        setIsLoading(false);
      }
    };
    createPoseLandmarker();
  }, []);

  const predictWebcam = useCallback(() => {
    const video = videoRef.current;
    const landmarker = poseLandmarkerRef.current;
    
    if (!video || !landmarker || video.paused || video.ended) {
        animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
        return;
    };

    landmarker.detectForVideo(video, performance.now(), (result) => {
      if (result.landmarks && result.landmarks.length > 0) {
        setLatestLandmark(result.landmarks[0][0]);
      }
    });

    animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
  }, [videoRef]);

  const startWebcam = useCallback(async () => {
    if (isLoading || isWebcamRunning || !videoRef.current) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
            setIsWebcamRunning(true);
            animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
        });
    } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Webcam access was denied. Please enable it in your browser settings.");
    }
  }, [isLoading, isWebcamRunning, videoRef, predictWebcam]);

  const stopWebcam = useCallback(() => {
    if (!isWebcamRunning || !videoRef.current || !videoRef.current.srcObject) return;

    setIsWebcamRunning(false);
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
    
  }, [isWebcamRunning, videoRef]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return { latestLandmark, isWebcamRunning, isLoading, error, startWebcam, stopWebcam };
};