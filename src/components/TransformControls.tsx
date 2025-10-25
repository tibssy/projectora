type TransformControlsProps = {
  scale: number;
  setScale: (value: number) => void;
  positionX: number;
  setPositionX: (value: number) => void;
  positionY: number;
  setPositionY: (value: number) => void;
};

export const TransformControls = ({
  scale,
  setScale,
  positionX,
  setPositionX,
  positionY,
  setPositionY,
}: TransformControlsProps) => {
  return (
    <div className="mt-4 p-4 bg-light-surface dark:bg-dark-surface rounded-lg space-y-4">
      {/* Scale Slider */}
      <div>
        <label htmlFor="scale-slider" className="block text-sm font-bold mb-1">
          Scale ({scale.toFixed(2)}x)
        </label>
        <input
          id="scale-slider"
          type="range"
          min="0.5"
          max="3"
          step="0.05"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-full h-2 bg-light-text/20 dark:bg-dark-text/20 rounded-lg appearance-none cursor-pointer accent-light-mauve dark:accent-dark-mauve"
        />
      </div>

      {/* Position X Slider */}
      <div>
        <label htmlFor="pos-x-slider" className="block text-sm font-bold mb-1">
          Horizontal Position ({positionX}%)
        </label>
        <input
          id="pos-x-slider"
          type="range"
          min="-50"
          max="50"
          step="1"
          value={positionX}
          onChange={(e) => setPositionX(parseInt(e.target.value))}
          className="w-full h-2 bg-light-text/20 dark:bg-dark-text/20 rounded-lg appearance-none cursor-pointer accent-light-mauve dark:accent-dark-mauve"
        />
      </div>
      
      {/* Position Y Slider */}
      <div>
        <label htmlFor="pos-y-slider" className="block text-sm font-bold mb-1">
          Vertical Position ({positionY}%)
        </label>
        <input
          id="pos-y-slider"
          type="range"
          min="-50"
          max="50"
          step="1"
          value={positionY}
          onChange={(e) => setPositionY(parseInt(e.target.value))}
          className="w-full h-2 bg-light-text/20 dark:bg-dark-text/20 rounded-lg appearance-none cursor-pointer accent-light-mauve dark:accent-dark-mauve"
        />
      </div>
    </div>
  );
};