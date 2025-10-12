import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Themes from "./pages/Themes";
import Submit from "./pages/Submit";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base dark:bg-base-dark transition-colors duration-300">
        <Navbar />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
