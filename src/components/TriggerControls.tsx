// src/components/TriggerControls.tsx
import { Zap, Timer, PersonStanding } from 'lucide-react';

type TriggerControlsProps = {
  // Time Trigger Props
  timeInterval: number; // in seconds. 0 = off, -1 = random
  setTimeInterval: (interval: number) => void;
  // Proximity Trigger Props
  isProximityEnabled: boolean;
  setIsProximityEnabled: (enabled: boolean) => void;
  proximityThreshold: number;
  setProximityThreshold: (threshold: number) => void;
};

export const TriggerControls = ({
  timeInterval,
  setTimeInterval,
  isProximityEnabled,
  setIsProximityEnabled,
  proximityThreshold,
  setProximityThreshold,
}: TriggerControlsProps) => {
  return (
    <div className="mt-4 p-4 bg-light-surface dark:bg-dark-surface rounded-lg">
      <h3 className="flex items-center gap-2 font-bold mb-4">
        <Zap size={18} />
        Automatic Triggers
      </h3>
      <div className="space-y-6">
        {/* Timed Trigger Section */}
        <div className="flex items-center gap-4">
          <Timer size={20} className="flex-shrink-0" />
          <div className="w-full">
            <label htmlFor="time-trigger" className="block text-sm font-medium mb-1">
              Timed Trigger
            </label>
            <select
              id="time-trigger"
              value={timeInterval}
              onChange={(e) => setTimeInterval(Number(e.target.value))}
              className="w-full p-2 bg-light-base dark:bg-dark-base rounded-md text-sm"
            >
              <option value={0}>Off</option>
              <option value={30}>Every 30 Seconds</option>
              <option value={60}>Every 1 Minute</option>
              <option value={120}>Every 2 Minutes</option>
              <option value={-1}>Random (30s - 2m)</option>
            </select>
          </div>
        </div>

        {/* Proximity Trigger Section */}
        <div className="flex items-center gap-4">
          <PersonStanding size={20} className="flex-shrink-0" />
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="proximity-toggle" className="text-sm font-medium">
                Proximity Trigger
              </label>
              <input
                type="checkbox"
                id="proximity-toggle"
                checked={isProximityEnabled}
                onChange={(e) => setIsProximityEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-light-mauve dark:accent-dark-mauve"
              />
            </div>
            {isProximityEnabled && (
              <div>
                <label htmlFor="proximity-slider" className="block text-xs text-light-text/70 dark:text-dark-text/70 mb-1">
                  Closeness Threshold: {proximityThreshold.toFixed(2)}
                </label>
                <input
                  id="proximity-slider"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={proximityThreshold}
                  onChange={(e) => setProximityThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-light-text/20 dark:bg-dark-text/20 rounded-lg appearance-none cursor-pointer accent-light-mauve dark:accent-dark-mauve"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};