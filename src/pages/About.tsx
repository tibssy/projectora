const About = () => {
  return (
    <div className="max-w-3xl mx-auto text-light-text dark:text-dark-text">
      <h1 className="text-4xl font-bold text-center text-light-lavender dark:text-dark-lavender mb-8">
        About Projectora 👻
      </h1>
      
      <div className="space-y-6 text-lg leading-relaxed bg-light-surface dark:bg-dark-surface p-8 rounded-lg shadow-lg">
        <p>
          <strong>Projectora</strong> is an interactive web experience designed to bring your windows and walls to life. It's a digital gallery of custom-made animations that you can project and control in real-time for events like Halloween, Christmas, or any party.
        </p>
        <p>
          The magic comes from you! By enabling your webcam, you can directly influence the animations. Make a monster's eyes follow your movements or trigger a ghost with a wave of your hand.
        </p>
        <p>
          This project is built with a passion for creative technology, using the power of{' '}
          <a href="https://rive.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-light-mauve dark:text-dark-mauve hover:underline">
            Rive
          </a>{' '}
          for real-time vector animations and{' '}
          <a href="https://developers.google.com/mediapipe" target="_blank" rel="noopener noreferrer" className="font-bold text-light-mauve dark:text-dark-mauve hover:underline">
            MediaPipe
          </a>{' '}
          for cutting-edge pose detection.
        </p>
        <p className="font-semibold text-center pt-4">
          All animations featured on this site are original creations.
        </p>
      </div>
      
      <div className="text-center mt-8">
        <a 
          href="https://github.com/tibssy/projectora"
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-block px-6 py-3 bg-light-mauve dark:bg-dark-mauve text-light-base dark:text-dark-base rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};

export default About;