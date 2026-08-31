import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DownloadPage } from './pages/DownloadPage';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
