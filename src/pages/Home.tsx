import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AnimationCard from "../components/AnimationCard";
import { getAnimations, type Animation } from "../firebaseApi";

const Home = () => {
    const [animations, setAnimations] = useState<Animation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (isLoading) {
        return <div className="text-center mt-20">Loading animations...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-400">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-light-lavender dark:text-dark-lavender mb-8 text-center">
                Halloween Collection
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {animations.map((anim) => (
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
        </div>
    );
};

export default Home;
