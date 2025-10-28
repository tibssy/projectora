import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useReducer,
    useTransition,
} from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// --- Type Definitions ---
export type Landmark = { x: number; y: number; z: number };
export type Landmarks = Landmark[];

// --- State Management with a Reducer ---
type Status = "IDLE" | "LOADING_MODEL" | "READY" | "RUNNING" | "ERROR";

type State = {
    status: Status;
    error: string | null;
};

type Action =
    | { type: "MODEL_LOADING" }
    | { type: "MODEL_READY" }
    | { type: "WEBCAM_STARTED" }
    | { type: "WEBCAM_STOPPED" }
    | { type: "ERROR"; payload: string };

const initialState: State = { status: "IDLE", error: null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "MODEL_LOADING":
            return { ...state, status: "LOADING_MODEL" };
        case "MODEL_READY":
            return { ...state, status: "READY" };
        case "WEBCAM_STARTED":
            return { ...state, status: "RUNNING", error: null };
        case "WEBCAM_STOPPED":
            return { ...state, status: "READY" };
        case "ERROR":
            return { ...state, status: "ERROR", error: action.payload };
        default:
            throw new Error("Unknown action type");
    }
}

/**
 * A custom React hook to manage MediaPipe Pose Tracking.
 * It handles loading the model, starting/stopping the webcam, and providing landmark data.
 * @param videoRef A React ref to the <video> element.
 * @returns An object with tracking data, status, and control functions.
 */
export const usePoseTracking = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    isPaused: boolean = false
) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    // const [latestLandmark, setLatestLandmark] = useState<Landmark | null>(null);
    const [latestLandmarks, setLatestLandmarks] = useState<Landmarks | null>(
        null
    );
    const [, startTransition] = useTransition();
    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // --- Effect for Initializing the Model ---
    useEffect(() => {
        async function createPoseLandmarker() {
            dispatch({ type: "MODEL_LOADING" });
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
                );
                const landmarker = await PoseLandmarker.createFromOptions(
                    vision,
                    {
                        baseOptions: {
                            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                            delegate: "GPU",
                        },
                        runningMode: "VIDEO",
                        numPoses: 1,
                    }
                );
                poseLandmarkerRef.current = landmarker;
                dispatch({ type: "MODEL_READY" });
            } catch (e) {
                console.error("Error loading PoseLandmarker:", e);
                dispatch({
                    type: "ERROR",
                    payload: "Failed to load the AI model.",
                });
            }
        }
        createPoseLandmarker();
    }, []);

    // --- Main Prediction Loop ---
    const predictWebcam = useCallback(() => {
        const video = videoRef.current;
        const landmarker = poseLandmarkerRef.current;

        if (
            isPaused ||
            state.status !== "RUNNING" ||
            !video ||
            !landmarker ||
            video.paused ||
            video.ended
        ) {
            animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
            return;
        }

        landmarker.detectForVideo(video, performance.now(), (result) => {
            if (result.landmarks && result.landmarks.length > 0) {
                startTransition(() => setLatestLandmarks(result.landmarks[0]));
            }
        });
        animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
    }, [videoRef, startTransition, state.status, isPaused]);

    useEffect(() => {
        if (state.status === "RUNNING") {
            animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
        }

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [state.status, predictWebcam]);

    // --- Control Functions ---
    const startWebcam = useCallback(async () => {
        if (state.status !== "READY" || !videoRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", () => {
                dispatch({ type: "WEBCAM_STARTED" });
                animationFrameIdRef.current =
                    requestAnimationFrame(predictWebcam);
            });
        } catch (err) {
            console.error("Error accessing webcam:", err);
            dispatch({ type: "ERROR", payload: "Webcam access was denied." });
        }
    }, [state.status, videoRef]);

    const stopWebcam = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        dispatch({ type: "WEBCAM_STOPPED" });
    }, [videoRef]);

    // --- Cleanup Effect ---
    useEffect(() => {
        return () => stopWebcam();
    }, [stopWebcam]);

    return {
        latestLandmarks,
        isWebcamRunning: state.status === "RUNNING",
        isLoading: state.status === "LOADING_MODEL",
        error: state.error,
        startWebcam,
        stopWebcam,
    };
};
