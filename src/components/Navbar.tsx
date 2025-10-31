import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";

const Navbar = () => {
    const [isDark, setIsDark] = useState(() => localStorage.theme !== "light");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            html.classList.remove("dark");

            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    const links = [
        { to: "/", label: "Home" },
        { to: "/themes", label: "Themes" },
        { to: "/submit", label: "Submit" },
        { to: "/about", label: "About" },
    ];

    return (
        <nav className="bg-light-base dark:bg-dark-base shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-bold text-light-mauve dark:text-dark-mauve"
                >
                    Projectora
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex space-x-6">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors duration-500 ${
                                    isActive
                                        ? "text-light-mauve dark:text-dark-mauve"
                                        : "text-light-text/90 dark:text-dark-text hover:text-light-mauve dark:hover:text-dark-mauve"
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-light-surface dark:bg-dark-surface hover:text-light-mauve dark:hover:text-dark-mauve transition-colors duration-500"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-light-base dark:bg-dark-base border-t border-gray-700">
                    <div className="flex flex-col p-4 space-y-3">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-light-text dark:text-dark-text"
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
