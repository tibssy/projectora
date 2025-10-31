import { useRef, useEffect, useState, useCallback } from "react";
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
import {
    getAnimationById,
    incrementViewCount,
    incrementLikeCount,
    type Animation,
} from "../firebaseApi";
import { hasLikedAnimation, addLikedAnimation } from "../likedAnimations";
import {
    PREMADE_BACKGROUNDS,
    type PremadeBackground,
} from "../premadeBackgrounds";

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

const THEME_COLORS = {
    Halloween: "#9F73DB",
    Christmas: "#89b4fa",
    Nature: "#a6e3a1",
    Generic: "#313244",
};

const SMOOTHING_ALPHA = 0.3;
const DEFAULT_OPACITY = 0.5;

const ViewerContent = ({ animation }: { animation: Animation }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const smoothedLandmarksRef = useRef<Landmarks | null>(null);
    const [videoOpacity, setVideoOpacity] = useState(DEFAULT_OPACITY);
    const [lastOpacity, setLastOpacity] = useState(DEFAULT_OPACITY);
    const [backgroundMode, setBackgroundMode] = useState<"solid" | "gradient">(
        "solid"
    );
    const [bgColor1, setBgColor1] = useState(THEME_COLORS.Halloween);
    const [bgColor2, setBgColor2] = useState("#25174cff");
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
    const [isUiVisible, setIsUiVisible] = useState(true);
    const inactivityTimerRef = useRef<number | null>(null);
    const [localLikes, setLocalLikes] = useState(animation.likes);
    const [localViews, setLocalViews] = useState(animation.views);
    const [hasLiked, setHasLiked] = useState(() =>
        hasLikedAnimation(animation.id)
    );
    const [selectedPremadeId, setSelectedPremadeId] = useState<string | null>(
        null
    );

    const {
        latestLandmarks,
        isWebcamRunning,
        isLoading,
        error,
        startWebcam,
        stopWebcam,
    } = usePoseTracking(videoRef);

    const { rive, RiveComponent } = useRive({
        src: animation.riveUrl,
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

    useEffect(() => {
        incrementViewCount(animation.id);
        setLocalViews((prevViews) => prevViews + 1);
    }, [animation.id]);

    // --- smooths ALL landmarks ---
    useEffect(() => {
        if (!latestLandmarks || !isWebcamRunning) return;

        if (!smoothedLandmarksRef.current) {
            smoothedLandmarksRef.current = latestLandmarks;
            return;
        }
        const newSmoothedLandmarks = latestLandmarks.map((raw, i) => {
            const old = smoothedLandmarksRef.current![i];
            return {
                x: raw.x * SMOOTHING_ALPHA + old.x * (1 - SMOOTHING_ALPHA),
                y: raw.y * SMOOTHING_ALPHA + old.y * (1 - SMOOTHING_ALPHA),
                z: raw.z * SMOOTHING_ALPHA + old.z * (1 - SMOOTHING_ALPHA),
            };
        });
        smoothedLandmarksRef.current = newSmoothedLandmarks;
        const nose = newSmoothedLandmarks[0];
        if (setRiveX && setRiveY && nose) {
            const mX = (1.0 - nose.x - centerX / 100) * multiplierX;
            const mY = (nose.y - centerY / 100) * multiplierY;
            setRiveX(50 + mX * 100);
            setRiveY(50 + mY * 100);
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
        if (
            activeTab === "calibration" &&
            !isWebcamRunning &&
            !isLoading &&
            !isFullscreen
        ) {
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
                const landmarksToDraw = smoothedLandmarksRef.current;

                if (landmarksToDraw) {
                    ctx.strokeStyle = "#AFB9F8";
                    ctx.lineWidth = 8;
                    POSE_CONNECTIONS.forEach((c) => {
                        const s = landmarksToDraw[c[0]],
                            e = landmarksToDraw[c[1]];
                        if (s && e) {
                            const sX = (1.0 - s.x) * canvas.width,
                                sY = s.y * canvas.height;
                            const eX = (1.0 - e.x) * canvas.width,
                                eY = e.y * canvas.height;
                            ctx.beginPath();
                            ctx.moveTo(sX, sY);
                            ctx.lineTo(eX, eY);
                            ctx.stroke();
                        }
                    });
                    ctx.fillStyle = "#a6e3a1";
                    landmarksToDraw.forEach((l, i) => {
                        if (i === 0) return;
                        const lX = (1.0 - l.x) * canvas.width,
                            lY = l.y * canvas.height;
                        ctx.beginPath();
                        ctx.arc(lX, lY, 12, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                    const nose = landmarksToDraw[0];
                    if (nose) {
                        ctx.fillStyle = "#C7AAEC";
                        const nX = (1.0 - nose.x) * canvas.width,
                            nY = nose.y * canvas.height;
                        ctx.beginPath();
                        ctx.arc(nX, nY, 12, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
            }
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [
        activeTab,
        isWebcamRunning,
        latestLandmarks,
        centerX,
        centerY,
        isFullscreen,
    ]);

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
            setSelectedPremadeId(null);
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

    const handleImageClear = () => {
        setOverlayImageUrl(null);
        setSelectedPremadeId(null);
    };

    const handlePremadeSelect = (background: PremadeBackground) => {
        setOverlayImageUrl(background.url);
        setSelectedPremadeId(background.id);
        const newBgColor =
            THEME_COLORS[background.theme] || THEME_COLORS.Generic;
        setBgColor1(newBgColor);
        setBackgroundMode("solid");
    };

    const handleColorChange = (color: string) => {
        setBgColor1(color);
    };

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
        if (timeInterval === 0) return;
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
    }, [timeInterval, firePrimaryTrigger]);

    // --- Proximity trigger uses smoothed Z value ---
    useEffect(() => {
        const nose = smoothedLandmarksRef.current?.[0];
        if (!isProximityEnabled || !isWebcamRunning || !nose) return;
        const isClose = Math.abs(nose.z) > proximityThreshold;
        if (isClose && !wasCloseRef.current) {
            firePrimaryTrigger?.();
            wasCloseRef.current = true;
        } else if (!isClose && wasCloseRef.current) {
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

    const handleActivity = useCallback(() => {
        if (!isFullscreen) return;
        setIsUiVisible(true);
        if (inactivityTimerRef.current)
            clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = window.setTimeout(() => {
            setIsUiVisible(false);
        }, 3000);
    }, [isFullscreen]);

    // --- Manage the activity timer lifecycle ---
    useEffect(() => {
        if (isFullscreen) {
            handleActivity();
        } else {
            setIsUiVisible(true);
            if (inactivityTimerRef.current)
                clearTimeout(inactivityTimerRef.current);
        }

        return () => {
            if (inactivityTimerRef.current)
                clearTimeout(inactivityTimerRef.current);
        };
    }, [isFullscreen, handleActivity]);

    const handleLike = useCallback(() => {
        if (hasLiked) return;

        setHasLiked(true);
        addLikedAnimation(animation.id);
        incrementLikeCount(animation.id);
        setLocalLikes((prevLikes) => prevLikes + 1);
    }, [animation.id, hasLiked]);

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
            <div
                className="w-full flex justify-center"
                ref={containerRef}
                onMouseMove={handleActivity}
                onTouchStart={handleActivity}
            >
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

                    {/* Controls */}
                    <div
                        className={`absolute top-3 right-3 z-40 flex flex-col gap-2 transition-opacity duration-500 ${
                            !isFullscreen || isUiVisible
                                ? "opacity-100"
                                : "opacity-0"
                        }`}
                    >
                        <button
                            onClick={handleFullscreenToggle}
                            className="p-2 bg-black/30 text-white rounded-lg backdrop-blur-sm hover:bg-black/50 transition-colors"
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
                            className="p-2 bg-black/30 text-white rounded-lg backdrop-blur-sm hover:bg-black/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                                isWebcamRunning ? "Stop Camera" : "Start Camera"
                            }
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
                            <div className="p-3 w-9 bg-black/30 backdrop-blur-sm rounded-lg flex flex-col items-center gap-3">
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
                    </div>
                    <button
                        onClick={handleLike}
                        disabled={hasLiked}
                        className={`absolute bottom-3 left-3 z-40 flex items-center gap-2 px-3 py-1.5 text-white transition-opacity duration-500 ${
                            !isFullscreen || isUiVisible
                                ? "opacity-100"
                                : "opacity-0"
                        } ${
                            hasLiked
                                ? "bg-black/0"
                                : "bg-black/30 rounded-lg backdrop-blur-sm hover:bg-black/50"
                        }`}
                    >
                        <Heart
                            size={18}
                            className="text-red-400 fill-current"
                        />
                        <span>{localLikes.toLocaleString()}</span>
                    </button>
                    <div
                        className={`absolute bottom-3 right-3 z-40 flex items-center gap-2 px-3 py-1.5 bg-black/30 text-white rounded-lg backdrop-blur-sm transition-opacity duration-500 ${
                            !isFullscreen || isUiVisible
                                ? "opacity-100"
                                : "opacity-0"
                        }`}
                    >
                        <Eye size={18} />
                        <span>{localViews.toLocaleString()}</span>
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
                setColor1={handleColorChange}
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
                premadeBackgrounds={PREMADE_BACKGROUNDS}
                selectedPremadeId={selectedPremadeId}
                onPremadeSelect={handlePremadeSelect}
            />
            {error && <p className="mt-4 text-red-400 font-medium">{error}</p>}
        </div>
    );
};

const AnimationViewer = () => {
    const { animationId } = useParams<{ animationId: string }>();
    const [animation, setAnimation] = useState<Animation | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

    useEffect(() => {
        if (!animationId) return;
        const fetchAnimation = async () => {
            try {
                setIsLoadingData(true);
                const animData = await getAnimationById(animationId);
                if (animData) {
                    setAnimation(animData);
                } else {
                    setDataError(
                        `Animation with ID "${animationId}" could not be found.`
                    );
                }
            } catch (err) {
                console.error("Failed to fetch animation:", err);
                setDataError(
                    "Could not load animation data. Please try again."
                );
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchAnimation();
    }, [animationId]);

    if (isLoadingData) {
        return <div className="text-center mt-20">Loading Animation...</div>;
    }

    if (dataError || !animation) {
        return (
            <div className="text-center mt-20">
                <h1 className="text-2xl font-bold text-red-400">
                    {dataError || "Animation not found!"}
                </h1>
                <Link
                    to="/"
                    className="text-light-mauve dark:text-dark-mauve mt-4 inline-block"
                >
                    Go back to Home
                </Link>
            </div>
        );
    }

    return <ViewerContent animation={animation} />;
};

export default AnimationViewer;
