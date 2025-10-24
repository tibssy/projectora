import { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRive } from '@rive-app/react-canvas';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { BackgroundControls } from '../components/BackgroundControls';
import { Modal } from '../components/Modal';

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
    riveUrl: 'https://res.cloudinary.com/dls8hlthp/raw/upload/v1760902733/monster2_xrbdi7.riv',
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
    riveUrl: 'https://res.cloudinary.com/dls8hlthp/raw/upload/v1761328854/monster5_qlqyzr.riv',
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(135);

  const {
    latestLandmark,
    isWebcamRunning,
    isLoading,
    error,
    startWebcam,
    stopWebcam
  } = usePoseTracking(videoRef, isModalOpen);

  const { RiveComponent, canvas } = useRive({
    src: animation ? animation.riveUrl : '',
    autoplay: true,
    stateMachines: 'State Machine 1',
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

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm text-light-text/80 dark:text-dark-text/80 hover:text-light-mauve dark:hover:text-dark-mauve transition-colors"><ArrowLeft size={16} />Back to Gallery</Link>
      <h1 className="text-4xl font-bold text-light-lavender dark:text-dark-lavender mb-4">{animation.title}</h1>
      <div className="relative aspect-video w-full">
        <div className="w-full h-full rounded-lg shadow-lg" style={{ background: backgroundStyle }}>
          <RiveComponent className="w-full h-full rounded-lg" />
        </div>
        
        {/* Video Overlay (Top Layer) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ opacity: isWebcamRunning ? videoOpacity : 0 }}
          className={`
            absolute top-0 left-0 w-full h-full object-cover rounded-lg
            transform -scale-x-100
            transition-opacity duration-300
            pointer-events-none
          `}
        ></video>
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

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-light-surface dark:bg-dark-surface rounded-lg font-semibold hover:ring-2 hover:ring-light-mauve dark:hover:ring-dark-mauve transition-all"
          >
            Customize Background
          </button>

        </div>
        <div className="text-sm text-light-text/70 dark:text-dark-text/70">👁 {animation.views.toLocaleString()} views</div>
      </div>
      
      {error && <p className="mt-4 text-red-400 font-medium">{error}</p>}
      {isWebcamRunning && (
        <div className="mt-4 p-4 bg-light-surface dark:bg-dark-surface rounded-lg text-xs font-mono text-light-text/80 dark:text-dark-text/80">
          <p className="font-bold mb-2">Live Tracking Data:</p>
          <p>Webcam Status: <span className="text-green-400">ACTIVE</span></p>
          <p>Nose X: {latestLandmark?.x.toFixed(3)}</p>
          <p>Nose Y: {latestLandmark?.y.toFixed(3)}</p>
          <p>Nose Z (depth): {latestLandmark?.z.toFixed(3)}</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customize Background"
      >
        <BackgroundControls
          mode={backgroundMode}
          setMode={setBackgroundMode}
          color1={bgColor1}
          setColor1={setBgColor1}
          color2={bgColor2}
          setColor2={setBgColor2}
          gradientAngle={gradientAngle}
          setGradientAngle={setGradientAngle}
        />
      </Modal>

    </div>
  );
};

export default AnimationViewer;