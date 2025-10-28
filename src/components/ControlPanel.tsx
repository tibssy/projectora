import { useState } from "react";
import { Move, Zap, Palette, Target } from "lucide-react";
import { LayoutControls, type LayoutControlsProps } from "./LayoutControls";
import {
    InteractionControls,
    type InteractionControlsProps,
} from "./InteractionControls";
import {
    AppearanceControls,
    type AppearanceControlsProps,
} from "./AppearanceControls";
import {
    CalibrationControls,
    type CalibrationControlsProps,
} from "./CalibrationControls";

export type { CalibrationControlsProps } from "./CalibrationControls";
type ControlPanelProps = LayoutControlsProps &
    InteractionControlsProps &
    AppearanceControlsProps &
    CalibrationControlsProps & {
        activeTab: string;
        setActiveTab: (tab: string) => void;
    };

const TABS = [
    { id: "layout", label: "Layout", icon: Move },
    { id: "interaction", label: "Interaction", icon: Zap },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "calibration", label: "Calibration", icon: Target },
];

export const ControlPanel = (props: ControlPanelProps) => {
    const { activeTab, setActiveTab } = props;
    const activeTabIndex = TABS.findIndex((tab) => tab.id === activeTab);

    const buttonBaseClass =
        "flex-1 flex items-center justify-center gap-2 p-1 font-semibold transition-colors duration-300 rounded-lg";
    const activeClass =
        "bg-light-mauve dark:bg-dark-mauve text-light-base dark:text-dark-base";
    const inactiveClass =
        "text-light-text/60 dark:text-dark-text/60 hover:bg-light-surface/50 dark:hover:bg-dark-surface/50";

    return (
        <div className="mt-4">
            {/* Tab Buttons */}
            <div className="flex p-1 space-x-1 bg-light-surface dark:bg-dark-surface rounded-xl">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`${buttonBaseClass} ${
                            activeTab === tab.id ? activeClass : inactiveClass
                        }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content with Carousel Transition */}
            <div className="mt-2 relative overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${activeTabIndex * 100}%)`,
                    }}
                >
                    <div className="w-full flex-shrink-0 p-1">
                        <LayoutControls {...props} />
                    </div>
                    <div className="w-full flex-shrink-0 p-1">
                        <InteractionControls {...props} />
                    </div>
                    <div className="w-full flex-shrink-0 p-1">
                        <AppearanceControls {...props} />
                    </div>
                    <div className="w-full flex-shrink-0 p-1">
                        <CalibrationControls {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
};
