import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";

export const AppRoutes = () => {
  return (
    <div id="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
};
