import { BrowserRouter, Routes, Route } from "react-router-dom";

function HomePage() {
  return <h1>TNM Jewels</h1>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}