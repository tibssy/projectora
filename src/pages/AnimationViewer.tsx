import { useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import screenfull from "screenfull";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Maximize,
    Minimize,
    Camera,
    CameraOff,
    Loader2,
    Heart,
} from "lucide-react";
import {
    useRive,
    useViewModel,
    useViewModelInstance,
    useViewModelInstanceTrigger,
    Layout,
    Alignment,
    useViewModelInstanceNumber,
} from "@rive-app/react-webgl2";
import { usePoseTracking, type Landmarks } from "../hooks/usePoseTracking";
import { ControlPanel } from "../components/ControlPanel";

const animations = [
    {
        id: 1,
        title: "Frenzywhisk",
        theme: "Halloween",
        riveUrl:
            "https://res.cloudinary.com/dls8hlthp/raw/upload/v1760925641/monster1_wahbow.riv",
        likes: 0,
        views: 1,
    },
    {
        id: 2,
        title: "Mormo",
        theme: "Halloween",
        riveUrl:
            "https://res.cloudinary.com/dls8hlthp/raw/upload/v1761684362/monster2_xy_bxgt5n.riv",
        likes: 0,
        views: 1,
    },
    {
        id: 3,
        title: "Vicis Chomp",
        theme: "Halloween",
        riveUrl:
            "https://res.cloudinary.com/dls8hlthp/raw/upload/v1761649711/monster3_xy_chnnml.riv",
        likes: 0,
        views: 1,
    },
    {
        id: 4,
        title: "Grinshadow",
        theme: "Halloween",
        riveUrl:
            "https://res.cloudinary.com/dls8hlthp/raw/upload/v1761684362/monster4_xy_osd19r.riv",
        likes: 0,
        views: 1,
    },
];

const POSE_CONNECTIONS = [
    [11, 12],
    [23, 24],
    [11, 23],
    [12, 24],
    [11, 13],
    [13, 15],
    [15, 17],
    [15, 19],
    [15, 21],
    [17, 19],
    [12, 14],
    [14, 16],
    [16, 18],
    [16, 20],
    [16, 22],
    [18, 20],
    [23, 25],
    [25, 27],
    [27, 29],
    [27, 31],
    [29, 31],
    [24, 26],
    [26, 28],
    [28, 30],
    [28, 32],
    [30, 32],
];

const SMOOTHING_ALPHA = 0.3;
const DEFAULT_OPACITY = 0.5;

const AnimationViewer = () => {
    const { animationId } = useParams<{ animationId: string }>();
    const animation = animations.find(
        (anim) => anim.id === parseInt(animationId || "")
    );
    const videoRef = useRef<HTMLVideoElement>(null);
    const smoothedLandmarksRef = useRef<Landmarks | null>(null);
    const [videoOpacity, setVideoOpacity] = useState(DEFAULT_OPACITY);
    const [lastOpacity, setLastOpacity] = useState(DEFAULT_OPACITY);
    const [backgroundMode, setBackgroundMode] = useState<"solid" | "gradient">(
        "solid"
    );
    const [bgColor1, setBgColor1] = useState("#99a5f6bc");
    const [bgColor2, setBgColor2] = useState("#2C2584");
    const [gradientAngle, setGradientAngle] = useState(315);
    const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [timeInterval, setTimeInterval] = useState(0);
    const [isProximityEnabled, setIsProximityEnabled] = useState(false);
    const [proximityThreshold, setProximityThreshold] = useState(0.4);
    const wasCloseRef = useRef(false);
    const [activeTab, setActiveTab] = useState("layout");
    const [centerX, setCenterX] = useState(50);
    const [centerY, setCenterY] = useState(50);
    const [multiplierX, setMultiplierX] = useState(1);
    const [multiplierY, setMultiplierY] = useState(1);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    const {
        latestLandmarks,
        isWebcamRunning,
        isLoading,
        error,
        startWebcam,
        stopWebcam,
    } = usePoseTracking(videoRef);

    const { rive, RiveComponent } = useRive({
        src: animation ? animation.riveUrl : "",
        autoplay: true,
        artboard: "Artboard",
        stateMachines: "State Machine 1",
        autoBind: false,
        layout: new Layout({ alignment: Alignment.BottomCenter }),
    });

    const viewModel = useViewModel(rive);
    const viewModelInstance = useViewModelInstance(viewModel, { rive });
    const { setValue: setRiveX } = useViewModelInstanceNumber(
        "x",
        viewModelInstance
    );
    const { setValue: setRiveY } = useViewModelInstanceNumber(
        "y",
        viewModelInstance
    );

    // --- smooths ALL landmarks ---
    useEffect(() => {
        if (!latestLandmarks || !isWebcamRunning) return;

        if (!smoothedLandmarksRef.current) {
            smoothedLandmarksRef.current = latestLandmarks;
            return;
        }

        // Loop through all incoming raw landmarks and apply smoothing
        const newSmoothedLandmarks = latestLandmarks.map(
            (rawLandmark, index) => {
                const oldSmoothedLandmark =
                    smoothedLandmarksRef.current![index];
                const newSmoothedX =
                    rawLandmark.x * SMOOTHING_ALPHA +
                    oldSmoothedLandmark.x * (1 - SMOOTHING_ALPHA);
                const newSmoothedY =
                    rawLandmark.y * SMOOTHING_ALPHA +
                    oldSmoothedLandmark.y * (1 - SMOOTHING_ALPHA);
                const newSmoothedZ =
                    rawLandmark.z * SMOOTHING_ALPHA +
                    oldSmoothedLandmark.z * (1 - SMOOTHING_ALPHA);
                return { x: newSmoothedX, y: newSmoothedY, z: newSmoothedZ };
            }
        );

        // Update the ref for the next frame
        smoothedLandmarksRef.current = newSmoothedLandmarks;

        // smoothed nose data for control
        const smoothedNose = newSmoothedLandmarks[0];
        if (setRiveX && setRiveY && smoothedNose) {
            const movementX =
                (1.0 - smoothedNose.x - centerX / 100) * multiplierX;
            const movementY = (smoothedNose.y - centerY / 100) * multiplierY;
            const finalX = 50 + movementX * 100;
            const finalY = 50 + movementY * 100;
            setRiveX(finalX);
            setRiveY(finalY);
        }
    }, [
        latestLandmarks,
        isWebcamRunning,
        setRiveX,
        setRiveY,
        centerX,
        centerY,
        multiplierX,
        multiplierY,
    ]);

    // --- Auto-start camera when calibration tab is selected ---
    useEffect(() => {
        if (activeTab === "calibration" && !isWebcamRunning && !isLoading) {
            startWebcam();
        }
    }, [activeTab, isWebcamRunning, isLoading, startWebcam]);

    // --- Drawing loop with smoothed landmarks ---
    useEffect(() => {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let animationFrameId: number;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (
                activeTab === "calibration" &&
                isWebcamRunning &&
                !isFullscreen
            ) {
                const crosshairX = (centerX / 100) * canvas.width;
                const crosshairY = (centerY / 100) * canvas.height;
                ctx.strokeStyle = "#f38ba8";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(crosshairX - 16, crosshairY);
                ctx.lineTo(crosshairX + 16, crosshairY);
                ctx.moveTo(crosshairX, crosshairY - 16);
                ctx.lineTo(crosshairX, crosshairY + 16);
                ctx.stroke();

                // Use the smoothed landmarks for a stable drawing
                const landmarksToDraw = smoothedLandmarksRef.current;
                if (landmarksToDraw) {
                    ctx.strokeStyle = "#AFB9F8";
                    ctx.lineWidth = 8;
                    POSE_CONNECTIONS.forEach((connection) => {
                        const startLandmark = landmarksToDraw[connection[0]];
                        const endLandmark = landmarksToDraw[connection[1]];
                        if (startLandmark && endLandmark) {
                            const startX =
                                (1.0 - startLandmark.x) * canvas.width;
                            const startY = startLandmark.y * canvas.height;
                            const endX = (1.0 - endLandmark.x) * canvas.width;
                            const endY = endLandmark.y * canvas.height;
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();
                        }
                    });
                    ctx.fillStyle = "#a6e3a1";
                    landmarksToDraw.forEach((landmark, index) => {
                        if (index === 0) return;
                        const landmarkX = (1.0 - landmark.x) * canvas.width;
                        const landmarkY = landmark.y * canvas.height;
                        ctx.beginPath();
                        ctx.arc(landmarkX, landmarkY, 12, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                    const nose = landmarksToDraw[0];
                    if (nose) {
                        ctx.fillStyle = "#C7AAEC";
                        const noseX = (1.0 - nose.x) * canvas.width;
                        const noseY = nose.y * canvas.height;
                        ctx.beginPath();
                        ctx.arc(noseX, noseY, 12, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
            }
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [activeTab, isWebcamRunning, latestLandmarks, centerX, centerY]);

    useEffect(() => {
        if (isWebcamRunning) {
            setVideoOpacity(DEFAULT_OPACITY);
            setLastOpacity(DEFAULT_OPACITY);
        }
    }, [isWebcamRunning]);
    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setOverlayImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };
    useEffect(() => {
        const h = () => {
            if (screenfull.isEnabled) setIsFullscreen(screenfull.isFullscreen);
        };
        if (screenfull.isEnabled) screenfull.on("change", h);
        return () => {
            if (screenfull.isEnabled) screenfull.off("change", h);
        };
    }, []);
    const handleImageClear = () => setOverlayImageUrl(null);

    const { trigger: firePrimaryTrigger } = useViewModelInstanceTrigger(
        "primaryTrigger",
        viewModelInstance,
        { onTrigger: () => console.log("Primary Trigger Fired!") }
    );
    const { trigger: fireSecondaryTrigger } = useViewModelInstanceTrigger(
        "secondaryTrigger",
        viewModelInstance,
        { onTrigger: () => console.log("Secondary Trigger Fired!") }
    );

    useEffect(() => {
        if (timeInterval === 0 || !isWebcamRunning) return;
        let t: number;
        const s = () => {
            const d =
                timeInterval === -1
                    ? 30000 + Math.random() * 90000
                    : timeInterval * 1000;
            t = window.setTimeout(() => {
                firePrimaryTrigger?.();
                s();
            }, d);
        };
        s();
        return () => clearTimeout(t);
    }, [timeInterval, isWebcamRunning, firePrimaryTrigger]);

    // --- Proximity trigger uses smoothed Z value ---
    useEffect(() => {
        const smoothedNose = smoothedLandmarksRef.current
            ? smoothedLandmarksRef.current[0]
            : null;
        if (!isProximityEnabled || !isWebcamRunning || !smoothedNose) return;
        const isCurrentlyClose = Math.abs(smoothedNose.z) > proximityThreshold;
        if (isCurrentlyClose && !wasCloseRef.current) {
            firePrimaryTrigger?.();
            wasCloseRef.current = true;
        } else if (!isCurrentlyClose && wasCloseRef.current) {
            fireSecondaryTrigger?.();
            wasCloseRef.current = false;
        }
    }, [
        latestLandmarks,
        isProximityEnabled,
        isWebcamRunning,
        proximityThreshold,
        firePrimaryTrigger,
        fireSecondaryTrigger,
    ]);

    const handleFullscreenToggle = () => {
        if (screenfull.isEnabled && containerRef.current)
            screenfull.toggle(containerRef.current);
    };
    if (!animation)
        return (
            <div className="text-center mt-20">
                <h1 className="text-2xl font-bold">Animation not found!</h1>
                <Link
                    to="/"
                    className="text-light-mauve dark:text-dark-mauve mt-4 inline-block"
                >
                    Go back to Home
                </Link>
            </div>
        );
    const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const n = parseFloat(e.target.value);
        setVideoOpacity(n);
        if (n > 0) setLastOpacity(n);
    };
    const toggleMirrorVisibility = () => {
        if (videoOpacity > 0) setVideoOpacity(0);
        else setVideoOpacity(lastOpacity > 0 ? lastOpacity : 0.3);
    };

    const backgroundStyle =
        backgroundMode === "solid"
            ? bgColor1
            : `linear-gradient(${gradientAngle}deg, ${bgColor1}, ${bgColor2})`;
    const riveTransformStyle = {
        transform: `translateX(${positionX}%) translateY(${
            positionY * -1
        }%) scale(${scale})`,
        transition: "transform 150ms ease-out",
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between">
                <h1 className="text-4xl font-bold text-light-lavender dark:text-dark-lavender mb-4">
                    {animation.title}
                </h1>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 mb-4 text-md text-light-text/80 dark:text-dark-text/80 hover:text-light-mauve dark:hover:text-dark-mauve transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Gallery
                </Link>
            </div>
            <div className="w-full flex justify-center" ref={containerRef}>
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                    <div
                        className="absolute inset-0 w-full h-full rounded-lg shadow-lg overflow-hidden"
                        style={{ background: backgroundStyle }}
                    ></div>
                    {overlayImageUrl && (
                        <img
                            src={overlayImageUrl}
                            alt="User uploaded overlay"
                            className="absolute inset-0 w-full h-full object-cover object-bottom z-10 pointer-events-none"
                        />
                    )}
                    <div
                        className="relative w-full h-full z-20 origin-bottom"
                        style={riveTransformStyle}
                    >
                        <RiveComponent className="w-full h-full" />
                    </div>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ opacity: isWebcamRunning ? videoOpacity : 0 }}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg transform -scale-x-100 transition-opacity duration-300 pointer-events-none z-30"
                    ></video>
                    <canvas
                        ref={overlayCanvasRef}
                        width="1280"
                        height="720"
                        className="absolute inset-0 w-full h-full z-35 pointer-events-none"
                    ></canvas>
                    <button
                        onClick={handleFullscreenToggle}
                        className="absolute top-3 right-3 z-40 p-2 bg-black/30 text-white rounded-lg backdrop-blur-sm hover:bg-black/50 transition-colors"
                        title={
                            isFullscreen
                                ? "Exit Fullscreen"
                                : "Enter Fullscreen (Projector Mode)"
                        }
                    >
                        {isFullscreen ? (
                            <Minimize size={20} />
                        ) : (
                            <Maximize size={20} />
                        )}
                    </button>
                    <button
                        onClick={isWebcamRunning ? stopWebcam : startWebcam}
                        disabled={isLoading}
                        className="absolute top-14 right-3 z-40 p-2 bg-black/30 text-white rounded-lg backdrop-blur-sm hover:bg-black/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isWebcamRunning ? "Stop Camera" : "Start Camera"}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : isWebcamRunning ? (
                            <CameraOff size={20} />
                        ) : (
                            <Camera size={20} />
                        )}
                    </button>
                    {isWebcamRunning && (
                        <div className="absolute top-28 right-3 z-40 p-3 w-9 bg-black/30 backdrop-blur-sm rounded-lg flex flex-col items-center gap-3">
                            <button
                                onClick={toggleMirrorVisibility}
                                title={
                                    videoOpacity > 0
                                        ? "Hide Mirror"
                                        : "Show Mirror"
                                }
                                className="text-white"
                            >
                                {videoOpacity > 0 ? (
                                    <Eye size={20} />
                                ) : (
                                    <EyeOff size={20} />
                                )}
                            </button>
                            <div className="h-24 flex items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={videoOpacity}
                                    onChange={handleOpacityChange}
                                    className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer -rotate-90 accent-light-mauve dark:accent-dark-mauve"
                                />
                            </div>
                        </div>
                    )}
                    <button className="absolute bottom-3 left-3 z-40 flex items-center gap-2 px-3 py-1.5 bg-black/30 text-white rounded-lg backdrop-blur-sm hover:bg-black/50 transition-colors">
                        <Heart
                            size={18}
                            className="text-red-400 fill-current"
                        />
                        <span className="font-semibold text-sm">
                            {animation.likes.toLocaleString()}
                        </span>
                    </button>
                    <div className="absolute bottom-3 right-3 z-40 flex items-center gap-2 px-3 py-1.5 bg-black/30 text-white rounded-lg backdrop-blur-sm">
                        <Eye size={18} />
                        <span className="font-semibold text-sm">
                            {animation.views.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
            <ControlPanel
                scale={scale}
                setScale={setScale}
                positionX={positionX}
                setPositionX={setPositionX}
                positionY={positionY}
                setPositionY={setPositionY}
                firePrimaryTrigger={firePrimaryTrigger}
                latestLandmark={latestLandmarks ? latestLandmarks[0] : null}
                timeInterval={timeInterval}
                setTimeInterval={setTimeInterval}
                isProximityEnabled={isProximityEnabled}
                setIsProximityEnabled={setIsProximityEnabled}
                proximityThreshold={proximityThreshold}
                setProximityThreshold={setProximityThreshold}
                smoothedLandmark={
                    smoothedLandmarksRef.current
                        ? smoothedLandmarksRef.current[0]
                        : null
                }
                mode={backgroundMode}
                setMode={setBackgroundMode}
                color1={bgColor1}
                setColor1={setBgColor1}
                color2={bgColor2}
                setColor2={setBgColor2}
                gradientAngle={gradientAngle}
                setGradientAngle={setGradientAngle}
                overlayImageUrl={overlayImageUrl}
                onImageUpload={handleImageUpload}
                onImageClear={handleImageClear}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                centerX={centerX}
                setCenterX={setCenterX}
                centerY={centerY}
                setCenterY={setCenterY}
                multiplierX={multiplierX}
                setMultiplierX={setMultiplierX}
                multiplierY={multiplierY}
                setMultiplierY={setMultiplierY}
            />
            {error && <p className="mt-4 text-red-400 font-medium">{error}</p>}
        </div>
    );
};

export default AnimationViewer;
