import { Heart, Eye } from "lucide-react";

type AnimationCardProps = {
    title: string;
    theme: string;
    thumbnailUrl: string;
    likes: number;
    views: number;
};

const AnimationCard = ({
    title,
    theme,
    thumbnailUrl,
    likes,
    views,
}: AnimationCardProps) => {
    return (
        <div className="group overflow-hidden rounded-xl bg-light-surface dark:bg-dark-surface shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            {/* Thumbnail Image */}
            <div className="relative">
                <img
                    src={thumbnailUrl}
                    alt={`Thumbnail for ${title}`}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 rounded-full bg-dark-mauve/80 px-2 py-1 text-xs font-bold text-dark-base backdrop-blur-sm">
                    {theme}
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-lavender truncate">
                    {title}
                </h3>

                {/* Stats (Likes & Views) */}
                <div className="mt-3 flex items-center justify-between text-sm text-light-text/80 dark:text-dark-text/80">
                    <div className="flex items-center gap-2">
                        <Heart size={16} className="text-red-400" />
                        <span>{likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye size={16} className="text-sky-300" />
                        <span>{views.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimationCard;
