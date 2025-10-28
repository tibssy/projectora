import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Themes from "./pages/Themes";
import Submit from "./pages/Submit";
import About from "./pages/About";
import AnimationViewer from "./pages/AnimationViewer";

function App() {
    return (
        <Router basename="/projectora/">
            <div className="min-h-screen bg-light-base dark:bg-dark-base dark:text-dark-text transition-colors duration-500">
                <Navbar />
                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/view/:animationId"
                            element={<AnimationViewer />}
                        />
                        <Route path="/themes" element={<Themes />} />
                        <Route path="/submit" element={<Submit />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
