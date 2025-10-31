import { HexColorPicker } from "react-colorful";
import { Upload, X } from "lucide-react";
import { type PremadeBackground } from "../premadeBackgrounds";

export type AppearanceControlsProps = {
    mode: "solid" | "gradient";
    setMode: (mode: "solid" | "gradient") => void;
    color1: string;
    setColor1: (color: string) => void;
    color2: string;
    setColor2: (color: string) => void;
    gradientAngle: number;
    setGradientAngle: (angle: number) => void;
    overlayImageUrl: string | null;
    onImageUpload: (file: File) => void;
    onImageClear: () => void;
    premadeBackgrounds: PremadeBackground[];
    selectedPremadeId: string | null;
    onPremadeSelect: (background: PremadeBackground) => void;
};

export const AppearanceControls = ({
    mode,
    setMode,
    color1,
    setColor1,
    color2,
    setColor2,
    gradientAngle,
    setGradientAngle,
    overlayImageUrl,
    onImageUpload,
    onImageClear,
    premadeBackgrounds,
    selectedPremadeId,
    onPremadeSelect,
}: AppearanceControlsProps) => {
    const buttonBaseClass = "px-3 py-1 text-sm rounded-md transition-colors";
    const activeButtonClass =
        "bg-light-mauve dark:bg-dark-mauve text-light-base dark:text-dark-base";
    const inactiveButtonClass =
        "bg-light-surface/50 dark:bg-dark-surface/50 hover:bg-light-surface dark:hover:bg-dark-surface";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
        e.target.value = "";
    };

    return (
        <div className="px-4 py-2 bg-light-surface dark:bg-dark-surface rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm">Background Style</p>
                {/* Mode Toggle Buttons */}
                <div className="flex p-1 bg-light-base dark:bg-dark-base rounded-lg">
                    <button
                        onClick={() => setMode("solid")}
                        className={`${buttonBaseClass} ${
                            mode === "solid"
                                ? activeButtonClass
                                : inactiveButtonClass
                        }`}
                    >
                        Solid
                    </button>
                    <button
                        onClick={() => setMode("gradient")}
                        className={`${buttonBaseClass} ${
                            mode === "gradient"
                                ? activeButtonClass
                                : inactiveButtonClass
                        }`}
                    >
                        Gradient
                    </button>
                </div>
            </div>

            {/* Color Pickers */}
            <div className="flex gap-4 justify-center">
                <div className="flex flex-col items-center gap-2">
                    <HexColorPicker color={color1} onChange={setColor1} />
                </div>
                {mode === "gradient" && (
                    <div className="flex flex-col items-center gap-2">
                        <HexColorPicker color={color2} onChange={setColor2} />
                    </div>
                )}
            </div>

            {/* Gradient Angle Slider */}
            {mode === "gradient" && (
                <div className="mt-6">
                    <label
                        htmlFor="angle-slider"
                        className="block text-sm font-bold mb-2 text-center"
                    >
                        Gradient Angle ({gradientAngle}°)
                    </label>
                    <input
                        id="angle-slider"
                        type="range"
                        min="0"
                        max="360"
                        value={gradientAngle}
                        onChange={(e) =>
                            setGradientAngle(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-light-text/20 dark:bg-dark-text/20 rounded-lg appearance-none cursor-pointer accent-light-mauve dark:accent-dark-mauve"
                    />
                </div>
            )}

            {/* --- IMAGE OVERLAY CONTROLS --- */}
            <div className="mt-2 pt-4 border-t border-light-text/10 dark:border-dark-text/10">
                <p className="font-bold text-sm mb-4">Image Overlay</p>
                <div className="flex items-center gap-4">
                    {/* File Upload Button */}
                    <label className="flex items-center gap-2 px-4 py-2 bg-light-base dark:bg-dark-base rounded-lg font-semibold cursor-pointer hover:ring-2 hover:ring-light-mauve dark:hover:ring-dark-mauve transition-all">
                        <Upload size={16} />
                        <span>Upload Image</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml"
                            onChange={handleFileChange}
                        />
                    </label>

                    {/* Image Preview & Clear Button */}
                    {overlayImageUrl && (
                        <div className="flex items-center gap-2 p-1 pl-3 bg-light-base dark:bg-dark-base rounded-lg">
                            <img
                                src={overlayImageUrl}
                                alt="Overlay preview"
                                className="w-8 h-8 rounded object-cover"
                            />
                            <span className="text-xs font-mono truncate max-w-[100px]">
                                Custom Image
                            </span>
                            <button
                                onClick={onImageClear}
                                className="p-1 rounded-full hover:bg-red-500/20 text-red-500"
                                title="Clear Image"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Premade Backgrounds Section --- */}
            <div className="mt-6 pt-4 border-t border-light-text/10 dark:border-dark-text/10">
                <p className="font-bold text-sm mb-4">Premade Backgrounds</p>
                <div className="grid grid-cols-3 gap-2">
                    {premadeBackgrounds.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => onPremadeSelect(bg)}
                            className={`
                relative aspect-video rounded-lg overflow-hidden border-2 transition-all group
                ${
                    selectedPremadeId === bg.id
                        ? "border-light-mauve dark:border-dark-mauve ring-2 ring-light-mauve dark:ring-dark-mauve"
                        : "border-transparent hover:border-light-mauve/50 dark:hover:border-dark-mauve/50"
                }
              `}
                            title={bg.name}
                        >
                            <div
                                className="absolute inset-0 transition-colors"
                                style={{ backgroundColor: color1 }}
                            ></div>

                            <img
                                src={bg.url}
                                alt={bg.name}
                                className="relative w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
