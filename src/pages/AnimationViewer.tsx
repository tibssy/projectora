import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRive } from '@rive-app/react-canvas';

const animations = [
  {
    id: 1,
    title: 'Head Character',
    theme: 'Halloween',
    riveUrl: 'https://res.cloudinary.com/dls8hlthp/raw/upload/v1760458852/monster_test_oswvln.riv',
    likes: 1345,
    views: 25800,
  },
  {
    id: 2,
    title: 'Ghostly Peek',
    theme: 'Halloween',
    riveUrl: 'ghostly_peek.riv',
    likes: 980,
    views: 18200,
  },
  {
    id: 3,
    title: 'Spider Drop',
    theme: 'Halloween',
    riveUrl: 'spider_drop.riv',
    likes: 2100,
    views: 42500,
  },
];

const AnimationViewer = () => {
  const { animationId } = useParams<{ animationId: string }>();
  const animation = animations.find(anim => anim.id === parseInt(animationId || ''));

  const { RiveComponent } = useRive({
    src: animation ? animation.riveUrl : '',
    autoplay: true,
    stateMachines: 'State Machine 1',
  });

  if (!animation) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold">Animation not found!</h1>
        <Link to="/" className="text-light-mauve dark:text-dark-mauve mt-4 inline-block">
          Go back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 mb-6 text-sm text-light-text/80 dark:text-dark-text/80 hover:text-light-mauve dark:hover:text-dark-mauve transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Gallery
      </Link>

      {/* Animation Title */}
      <h1 className="text-4xl font-bold text-light-lavender dark:text-dark-lavender mb-4">
        {animation.title}
      </h1>

      {/* Rive Canvas */}
      <div className="aspect-video w-full bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg">
        <RiveComponent className="w-full h-full rounded-lg" />
      </div>

      {/* Placeholder for controls and stats */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-light-mauve dark:bg-dark-mauve text-light-base dark:text-dark-base rounded-lg font-semibold">
            ❤️ Like ({animation.likes})
          </button>
          <button className="px-4 py-2 bg-light-surface dark:bg-dark-surface rounded-lg font-semibold">
            Start Camera Control
          </button>
        </div>
        <div className="text-sm text-light-text/70 dark:text-dark-text/70">
          👁 {animation.views.toLocaleString()} views
        </div>
      </div>
    </div>
  );
};

export default AnimationViewer;