import { Wand2 } from "lucide-react";

const Submit = () => {
    return (
        <div className="max-w-3xl mx-auto text-center mt-10 p-8 bg-light-surface dark:bg-dark-surface rounded-xl shadow-lg">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-light-mauve/20 dark:bg-dark-mauve/20 rounded-full">
                    <Wand2
                        size={32}
                        className="text-light-mauve dark:text-dark-mauve"
                    />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-light-lavender dark:text-dark-lavender mb-3">
                Feature Coming Soon!
            </h1>
            <p className="text-light-text/80 dark:text-dark-text/80 mb-6">
                We're building a feature that will allow creators like you to
                submit your own interactive Rive animations to the Projectora
                gallery. Stay tuned!
            </p>
            <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                Have a cool idea or an animation you want to share right now?{" "}
                <br />
                <a
                    href="mailto:tibssy1982@gmail.com?subject=Projectora Animation Submission"
                    className="font-bold underline text-light-mauve dark:text-dark-mauve hover:opacity-80 transition-opacity"
                >
                    Get in touch with us!
                </a>
            </p>
        </div>
    );
};

export default Submit;
