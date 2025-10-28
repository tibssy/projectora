import { TriggerControls } from './TriggerControls';

export type InteractionControlsProps = {
  firePrimaryTrigger: (() => void) | null;
  latestLandmark: { x: number; y: number; z: number; } | null;
  timeInterval: number;
  setTimeInterval: (interval: number) => void;
  isProximityEnabled: boolean;
  setIsProximityEnabled: (enabled: boolean) => void;
  proximityThreshold: number;
  setProximityThreshold: (threshold: number) => void;
  smoothedLandmark: { x: number; y: number; z: number; } | null;
};

export const InteractionControls = (props: InteractionControlsProps) => {
  const { firePrimaryTrigger, latestLandmark, smoothedLandmark } = props;
  
  return (
    <div className="p-4 bg-light-surface dark:bg-dark-surface rounded-lg space-y-4">
      {/* Manual Trigger Button */}
      <div>
        <h3 className="font-bold mb-2">Manual Action</h3>
        <button
          onClick={() => firePrimaryTrigger?.()}
          disabled={!firePrimaryTrigger}
          className="w-full px-4 py-2 bg-light-base dark:bg-dark-base rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:ring-2 hover:ring-light-mauve dark:hover:ring-dark-mauve transition-all"
        >
          Trigger Action
        </button>
      </div>

      {/* Automatic Triggers (we can just render our existing component) */}
      <TriggerControls {...props} />

      {/* Debugging Area */}
      <div>
        <h3 className="font-bold mb-2">Live Tracking Data</h3>
        <div className="p-4 bg-light-base dark:bg-dark-base rounded-lg text-xs font-mono">
          <p>Webcam Status: <span className="text-green-400">ACTIVE</span></p>
          {/* 3. Update the JSX to display the smoothed values */}
          <p>X (raw): {latestLandmark?.x.toFixed(3)} | X (smooth): <span className="font-bold">{smoothedLandmark?.x.toFixed(3)}</span></p>
          <p>Y (raw): {latestLandmark?.y.toFixed(3)} | Y (smooth): <span className="font-bold">{smoothedLandmark?.y.toFixed(3)}</span></p>
          <p>Z (raw): {latestLandmark?.z.toFixed(3)} | Z (smooth): <span className="font-bold">{smoothedLandmark?.z.toFixed(3)}</span></p>
        </div>
      </div>
    </div>
  );
};