// src/components/BackgroundControls.tsx

import { HexColorPicker } from 'react-colorful';

// Define the props our component will accept from its parent
type BackgroundControlsProps = {
  mode: 'solid' | 'gradient';
  setMode: (mode: 'solid' | 'gradient') => void;
  color1: string;
  setColor1: (color: string) => void;
  color2: string;
  setColor2: (color: string) => void;
};

export const BackgroundControls = ({
  mode,
  setMode,
  color1,
  setColor1,
  color2,
  setColor2,
}: BackgroundControlsProps) => {

  const buttonBaseClass = "px-3 py-1 text-sm rounded-md transition-colors";
  const activeButtonClass = "bg-light-mauve dark:bg-dark-mauve text-light-base dark:text-dark-base";
  const inactiveButtonClass = "bg-light-surface/50 dark:bg-dark-surface/50 hover:bg-light-surface dark:hover:bg-dark-surface";

  return (
    <div className="mt-4 p-4 bg-light-surface dark:bg-dark-surface rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-sm">Background Style</p>
        {/* Mode Toggle Buttons */}
        <div className="flex p-1 bg-light-base dark:bg-dark-base rounded-lg">
          <button
            onClick={() => setMode('solid')}
            className={`${buttonBaseClass} ${mode === 'solid' ? activeButtonClass : inactiveButtonClass}`}
          >
            Solid
          </button>
          <button
            onClick={() => setMode('gradient')}
            className={`${buttonBaseClass} ${mode === 'gradient' ? activeButtonClass : inactiveButtonClass}`}
          >
            Gradient
          </button>
        </div>
      </div>

      {/* Color Pickers */}
      <div className="flex gap-4 justify-center">
        <div className="flex flex-col items-center gap-2">
          <HexColorPicker color={color1} onChange={setColor1} />
          <span className="font-mono text-xs p-1 bg-light-base dark:bg-dark-base rounded">{color1}</span>
        </div>
        {/* Conditionally render the second color picker for gradient mode */}
        {mode === 'gradient' && (
          <div className="flex flex-col items-center gap-2">
            <HexColorPicker color={color2} onChange={setColor2} />
            <span className="font-mono text-xs p-1 bg-light-base dark:bg-dark-base rounded">{color2}</span>
          </div>
        )}
      </div>
    </div>
  );
};