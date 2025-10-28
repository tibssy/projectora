export type CalibrationControlsProps = {
    centerX: number;
    setCenterX: (value: number) => void;
    centerY: number;
    setCenterY: (value: number) => void;
    multiplierX: number;
    setMultiplierX: (value: number) => void;
    multiplierY: number;
    setMultiplierY: (value: number) => void;
};

export const CalibrationControls = ({
    centerX,
    setCenterX,
    centerY,
    setCenterY,
    multiplierX,
    setMultiplierX,
    multiplierY,
    setMultiplierY,
}: CalibrationControlsProps) => {
    return (
        <div className="p-4 bg-light-surface dark:bg-dark-surface rounded-lg space-y-4">
            <div>
                <h3 className="font-bold mb-2">Center Point Offset</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Horizontal Center ({centerX}%)
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={centerX}
                            onChange={(e) => setCenterX(Number(e.target.value))}
                            className="w-full h-2 slider-thumb"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Vertical Center ({centerY}%)
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={centerY}
                            onChange={(e) => setCenterY(Number(e.target.value))}
                            className="w-full h-2 slider-thumb"
                        />
                    </div>
                </div>
            </div>
            <div className="pt-4 border-t border-light-text/10 dark:border-dark-text/10">
                <h3 className="font-bold mb-2">Movement Sensitivity</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Horizontal Multiplier ({multiplierX.toFixed(2)}x)
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.05"
                            value={multiplierX}
                            onChange={(e) =>
                                setMultiplierX(Number(e.target.value))
                            }
                            className="w-full h-2 slider-thumb"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Vertical Multiplier ({multiplierY.toFixed(2)}x)
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.05"
                            value={multiplierY}
                            onChange={(e) =>
                                setMultiplierY(Number(e.target.value))
                            }
                            className="w-full h-2 slider-thumb"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
