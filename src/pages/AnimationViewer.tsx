import { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import screenfull from 'screenfull';
import { ArrowLeft, Eye, EyeOff, Maximize, Minimize } from 'lucide-react';
import { useRive, useViewModel, useViewModelInstance, useViewModelInstanceTrigger, Layout, Alignment } from '@rive-app/react-webgl2';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { ControlPanel } from '../components/ControlPanel';

const animations = [
  {
    id: 1,
    title: 'Frenzywhisk',
    theme: 'Halloween',
    riveUrl: 'https://res.cloudinary.com/dls8hlthp/raw/upload/v1760925641/monster1_wahbow.riv',
    likes: 0,
    views: 1,
  },
  {
    id: 2,
    title: 'Mormo',
    theme: 'Halloween',
    riveUrl: 'https://res.cloudinary.com/dls8hlthp/raw/upload/v1761537008/monster2_trigger_2_uce5yd.riv',
    likes: 0,
    views: 1,
  },
  {
    id: 3,
    title: 'Vicis Chomp',
    theme: 'Halloween',
    riveUrl: 'https://res.cloudinary.com/dls8hlthp/raw/upload/v1760903457/monster3_4_mze1rv.riv',
    likes: 0,
    views: 1,
  },
  {
    id: 4,
    title: 'Grinshadow',
    theme: 'Halloween',
    riveUrl: 'https://res.cloudinary.com/dls8hlthp/raw/upload/v1761537565/monster5_updated_jpmhls.riv',
    likes: 0,
    views: 1,
  },
];

const SMOOTHING_ALPHA = 0.3;
const DEFAULT_OPACITY = 0.5;

const AnimationViewer = () => {
  const { animationId } = useParams<{ animationId: string }>();
  const animation = animations.find(anim => anim.id === parseInt(animationId || ''));
  const videoRef = useRef<HTMLVideoElement>(null);
  const smoothedPointerRef = useRef({ x: 0.5, y: 0.5 });
  const [videoOpacity, setVideoOpacity] = useState(DEFAULT_OPACITY);
  const [lastOpacity, setLastOpacity] = useState(DEFAULT_OPACITY);

  const [backgroundMode, setBackgroundMode] = useState<'solid' | 'gradient'>('solid');
  const [bgColor1, setBgColor1] = useState('#313244'); // Default to Catppuccin surface color
  const [bgColor2, setBgColor2] = useState('#b4befe'); // Default to Catppuccin lavender
  const [gradientAngle, setGradientAngle] = useState(135);
  const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeInterval, setTimeInterval] = useState(0); // 0 = off
  const [isProximityEnabled, setIsProximityEnabled] = useState(false);
  const [proximityThreshold, setProximityThreshold] = useState(0.4);
  const wasCloseRef = useRef(false);

  const {
    latestLandmark,
    isWebcamRunning,
    isLoading,
    error,
    startWebcam,
    stopWebcam
  } = usePoseTracking(videoRef);

  const { rive, RiveComponent, canvas } = useRive({
    src: animation ? animation.riveUrl : '',
    autoplay: true,
    artboard: 'Artboard',
    stateMachines: 'State Machine 1',
    autoBind: false,
    layout: new Layout({
      alignment: Alignment.BottomCenter,
    })
  });

  useEffect(() => {
    if (!latestLandmark || !canvas || !isWebcamRunning) return;

    const rawNormalizedX = 1.0 - latestLandmark.x;
    const rawNormalizedY = latestLandmark.y;

    const newSmoothedX = (rawNormalizedX * SMOOTHING_ALPHA) + (smoothedPointerRef.current.x * (1 - SMOOTHING_ALPHA));
    const newSmoothedY = (rawNormalizedY * SMOOTHING_ALPHA) + (smoothedPointerRef.current.y * (1 - SMOOTHING_ALPHA));

    smoothedPointerRef.current = { x: newSmoothedX, y: newSmoothedY };

    const riveRect = canvas.getBoundingClientRect();
    const localX = newSmoothedX * riveRect.width;
    const localY = newSmoothedY * riveRect.height;
    const clientX = riveRect.left + localX;
    const clientY = riveRect.top + localY;

    const fakeEvent = new MouseEvent('mousemove', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
    });
    canvas.dispatchEvent(fakeEvent);
  }, [latestLandmark, canvas, isWebcamRunning]);

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
    const handleFullscreenChange = () => {
      if (screenfull.isEnabled) {
        setIsFullscreen(screenfull.isFullscreen);
      }
    };

    if (screenfull.isEnabled) {
      screenfull.on('change', handleFullscreenChange);
    }

    // Cleanup the event listener on unmount
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleFullscreenChange);
      }
    };
  }, []);

  const handleImageClear = () => {
    setOverlayImageUrl(null);
  };

  const viewModel = useViewModel(rive); // Get the default view model from the Rive instance
  const viewModelInstance = useViewModelInstance(viewModel, { rive }); // Get the default instance AND bind it

  const { trigger: firePrimaryTrigger } = useViewModelInstanceTrigger(
    'primaryTrigger',
    viewModelInstance,
    {
        onTrigger: () => {
            console.log('Primary Trigger Fired!');
        }
    }
  );

  const { trigger: fireSecondaryTrigger } = useViewModelInstanceTrigger(
    'secondaryTrigger',
    viewModelInstance,
      {
        onTrigger: () => {
            console.log('Secondary Trigger Fired!');
        }
    }
  );

  useEffect(() => {
    // Only run the timer if an interval is set and the camera is on
    if (timeInterval === 0 || !isWebcamRunning) {
      return;
    }

    let timeoutId: number;

    const scheduleTrigger = () => {
      const delay = timeInterval === -1 
        ? 30000 + Math.random() * 90000 // Random between 30s and 2m
        : timeInterval * 1000;

      timeoutId = window.setTimeout(() => {
        firePrimaryTrigger?.();
        scheduleTrigger(); // Schedule the next one
      }, delay);
    };

    scheduleTrigger();

    // Cleanup function: this is critical!
    return () => clearTimeout(timeoutId);

  }, [timeInterval, isWebcamRunning, firePrimaryTrigger]);

  useEffect(() => {
    // Only run if enabled, camera is on, and we have data
    if (!isProximityEnabled || !isWebcamRunning || !latestLandmark) {
      return;
    }

    // MediaPipe's Z is negative, and smaller numbers mean closer.
    // We use Math.abs to make it an intuitive "distance".
    const isCurrentlyClose = Math.abs(latestLandmark.z) > proximityThreshold;

    // Edge Detection: fire only when the state *changes*
    if (isCurrentlyClose && !wasCloseRef.current) {
      // User just entered the zone
      firePrimaryTrigger?.();
      wasCloseRef.current = true; // Update state
    } else if (!isCurrentlyClose && wasCloseRef.current) {
      // User just left the zone
      fireSecondaryTrigger?.(); // Fire the optional secondary trigger
      wasCloseRef.current = false; // Update state
    }
  }, [
    latestLandmark, 
    isProximityEnabled, 
    isWebcamRunning, 
    proximityThreshold, 
    firePrimaryTrigger, 
    fireSecondaryTrigger
  ]);

  const handleFullscreenToggle = () => {
    if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current);
    }
  };

  if (!animation) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold">Animation not found!</h1>
        <Link to="/" className="text-light-mauve dark:text-dark-mauve mt-4 inline-block">
          Go back to Home
        </Link>
      </div>
    );
  }

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    setVideoOpacity(newOpacity);
    if (newOpacity > 0) {
      setLastOpacity(newOpacity);
    }
  };

  const toggleMirrorVisibility = () => {
    if (videoOpacity > 0) {
      setVideoOpacity(0);
    } else {
      setVideoOpacity(lastOpacity > 0 ? lastOpacity : 0.3);
    }
  };

  const backgroundStyle = backgroundMode === 'solid'
    ? bgColor1
    : `linear-gradient(${gradientAngle}deg, ${bgColor1}, ${bgColor2})`;

  const riveTransformStyle = {
    transform: `translateX(${positionX}%) translateY(${positionY}%) scale(${scale})`,
    transition: 'transform 150ms ease-out', // Adds a smooth feel to the sliders
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm text-light-text/80 dark:text-dark-text/80 hover:text-light-mauve dark:hover:text-dark-mauve transition-colors"><ArrowLeft size={16} />Back to Gallery</Link>
      <h1 className="text-4xl font-bold text-light-lavender dark:text-dark-lavender mb-4">{animation.title}</h1>
      <div className="w-full flex justify-center" ref={containerRef}>
        <div className="relative w-full aspect-video overflow-hidden rounded-lg">
          {/* Layer 1: Background Color/Gradient */}
          <div
            className="absolute inset-0 w-full h-full rounded-lg shadow-lg overflow-hidden"
            style={{ background: backgroundStyle }}
          ></div>

          {/* Layer 2: User Image Overlay */}
          {overlayImageUrl && (
            <img
              src={overlayImageUrl}
              alt="User uploaded overlay"
              className="absolute inset-0 w-full h-full object-cover object-bottom z-10 pointer-events-none"
            />
          )}

          {/* Layer 3: Rive Canvas */}
          <div 
            className="relative w-full h-full z-20 origin-bottom"
            style={riveTransformStyle}
          >
            <RiveComponent className="w-full h-full" />
          </div>
          
          {/* Layer 4: Video Overlay */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ opacity: isWebcamRunning ? videoOpacity : 0 }}
            className={`
              absolute inset-0 w-full h-full object-cover rounded-lg
              transform -scale-x-100 transition-opacity duration-300
              pointer-events-none z-30
            `}
          ></video>

          <button 
            onClick={handleFullscreenToggle}
            className="absolute top-3 right-3 z-40 p-2 bg-black/30 text-white rounded-lg backdrop-blur-sm hover:bg-black/50 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Projector Mode)'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center gap-4 flex-wrap">
          <button className="px-4 py-2 bg-light-mauve/80 dark:bg-dark-mauve/80 text-light-base dark:text-dark-base rounded-lg font-semibold hover:bg-light-mauve dark:hover:bg-dark-mauve transition-colors">❤️ Like ({animation.likes})</button>
          <button onClick={isWebcamRunning ? stopWebcam : startWebcam} disabled={isLoading} className="px-4 py-2 bg-light-surface dark:bg-dark-surface rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:ring-2 hover:ring-light-mauve dark:hover:ring-dark-mauve transition-all">
            {isLoading ? 'Loading Model...' : isWebcamRunning ? 'Stop Camera Control' : 'Start Camera Control'}
          </button>
          
          {/* Opacity Control Group */}
          {isWebcamRunning && (
            <div className="flex items-center gap-2 p-2 bg-light-surface dark:bg-dark-surface rounded-lg">
              <button onClick={toggleMirrorVisibility} title={videoOpacity > 0 ? "Hide Mirror" : "Show Mirror"}>
                {videoOpacity > 0 ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={videoOpacity}
                onChange={handleOpacityChange}
                className="w-24 h-2 bg-light-text/20 dark:bg-dark-text/20 rounded-lg appearance-none cursor-pointer accent-light-mauve dark:accent-dark-mauve"
              />
            </div>
          )}

        </div>
        <div className="text-sm text-light-text/70 dark:text-dark-text/70">👁 {animation.views.toLocaleString()} views</div>
      </div>

      <ControlPanel
        // Layout Props
        scale={scale}
        setScale={setScale}
        positionX={positionX}
        setPositionX={setPositionX}
        positionY={positionY}
        setPositionY={setPositionY}
        // Interaction Props
        firePrimaryTrigger={firePrimaryTrigger}
        latestLandmark={latestLandmark}
        timeInterval={timeInterval}
        setTimeInterval={setTimeInterval}
        isProximityEnabled={isProximityEnabled}
        setIsProximityEnabled={setIsProximityEnabled}
        proximityThreshold={proximityThreshold}
        setProximityThreshold={setProximityThreshold}
        // Appearance Props
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
      />

      {error && <p className="mt-4 text-red-400 font-medium">{error}</p>}


    </div>
  );
};

export default AnimationViewer;