import { Link } from "react-router-dom";
import AnimationCard from "../components/AnimationCard";

// Mock data for our animations. Later, this will come from Firebase.
const animations = [
  {
    id: 1,
    title: "Frenzywhisk",
    theme: "Halloween",
    thumbnailUrl: "https://res.cloudinary.com/dls8hlthp/image/upload/v1760925652/swappy-20251020_025520_isyfam.png", // Placeholder image
    likes: 0,
    views: 1,
  },
  {
    id: 2,
    title: "Mormo",
    theme: "Halloween",
    thumbnailUrl: "https://res.cloudinary.com/dls8hlthp/image/upload/v1760902775/monster2_cxgvtr.png", // Placeholder image
    likes: 0,
    views: 1,
  },
  {
    id: 3,
    title: "Vicis Chomp",
    theme: "Halloween",
    thumbnailUrl: "https://res.cloudinary.com/dls8hlthp/image/upload/v1760825385/monster3_hqsfdu.png", // Placeholder image
    likes: 0,
    views: 1,
  },
  {
    id: 4,
    title: "Grinshadow",
    theme: "Halloween",
    thumbnailUrl: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761328482/swappy-20251024_185341_isqtcu.png", // Placeholder image
    likes: 0,
    views: 1,
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