import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useRive } from "@rive-app/react-webgl2";
import AnimationCard from "../components/AnimationCard";
import { getAnimations, type Animation } from "../firebaseApi";

const THEMES = ["All", "Halloween", "Christmas", "Nature"];

const Home = () => {
    const [animations, setAnimations] = useState<Animation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState("All");

    useEffect(() => {
        const fetchAnimations = async () => {
            try {
                setIsLoading(true);
                const anims = await getAnimations();
                setAnimations(anims);
            } catch (err) {
                console.error("Failed to fetch animations:", err);
                setError("Could not load animations. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnimations();
    }, []);

    const heroAnimationUrl =
        "https://res.cloudinary.com/dls8hlthp/raw/upload/v1761918738/hero_animation_xmksi1.riv";
    const { RiveComponent: HeroRiveComponent } = useRive({
        src: heroAnimationUrl,
        autoplay: true,
        artboard: "Artboard",
        stateMachines: "State Machine 1",
    });

    const filteredAnimations = useMemo(() => {
        if (selectedTheme === "All") {
            return animations;
        }
        return animations.filter((anim) => anim.theme === selectedTheme);
    }, [animations, selectedTheme]);

    if (isLoading) {
        return <div className="text-center mt-20">Loading animations...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-400">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* --- HERO SECTION --- */}
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-12">
                <HeroRiveComponent className="w-full h-full" />
            </div>

            {/* --- GALLERY SECTION --- */}
            <div>
                <h2 className="text-3xl font-bold text-center mb-4">
                    Animation Gallery
                </h2>

                {/* Filter Buttons */}
                <div className="flex justify-center mb-8">
                    <div className="flex gap-2 p-1 bg-light-surface dark:bg-dark-surface rounded-xl overflow-x-auto whitespace-nowrap">
                        {THEMES.map((theme) => (
                            <button
                                key={theme}
                                onClick={() => setSelectedTheme(theme)}
                                className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                                    selectedTheme === theme
                                        ? "bg-light-mauve dark:bg-dark-mauve text-light-base dark:text-dark-base"
                                        : "hover:bg-light-base/50 dark:hover:bg-dark-base/50"
                                }`}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Animation Card Grid */}
                {filteredAnimations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAnimations.map((anim) => (
                            <Link to={`/view/${anim.id}`} key={anim.id}>
                                <AnimationCard
                                    title={anim.title}
                                    theme={anim.theme}
                                    thumbnailUrl={anim.thumbnailUrl}
                                    likes={anim.likes}
                                    views={anim.views}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-light-text/70 dark:text-dark-text/70">
                        No animations found for the "{selectedTheme}" theme yet!
                    </p>
                )}
            </div>
        </div>
    );
};

export default Home;
