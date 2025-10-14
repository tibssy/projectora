// src/pages/About.tsx

const About = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About Projectora</h1>
      <p className="mb-8">...</p>

      <h2 className="text-2xl font-bold mb-4">Animation Credits</h2>
      <ul className="list-disc pl-5 space-y-3">
        <li>
          <strong>"Head Character"</strong> by <a href="https://rive.app/@hermesjackmotion/" className="underline">hermesjackmotion</a>, 
          downloaded from the Rive Community. Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" className="underline">CC BY 4.0</a>. 
          (<a href="https://rive.app/marketplace/9398-17870-mouse-following-head-character/" className="underline">Original File</a>)
        </li>
        <li>
          <strong>"Ghostly Peek"</strong> by Another Author...
        </li>
        {/* Add one for each community animation you use */}
      </ul>
    </div>
  );
};

export default About;