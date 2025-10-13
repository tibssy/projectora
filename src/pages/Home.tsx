import { Link } from "react-router-dom";
import AnimationCard from "../components/AnimationCard";

// Mock data for our animations. Later, this will come from Firebase.
const animations = [
  {
    id: 1,
    title: "Pumpkin Eyes",
    theme: "Halloween",
    thumbnailUrl: "https://placehold.co/600x400/ff79c6/FFFFFF?text=🎃", // Placeholder image
    likes: 1345,
    views: 25800,
  },
  {
    id: 2,
    title: "Ghostly Peek",
    theme: "Halloween",
    thumbnailUrl: "https://placehold.co/600x400/8be9fd/FFFFFF?text=👻", // Placeholder image
    likes: 980,
    views: 18200,
  },
  {
    id: 3,
    title: "Spider Drop",
    theme: "Halloween",
    thumbnailUrl: "https://placehold.co/600x400/50fa7b/FFFFFF?text=🕷️", // Placeholder image
    likes: 2100,
    views: 42500,
  },
];

const Home = () => {
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