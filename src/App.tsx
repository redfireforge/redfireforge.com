import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DownloadPage } from './pages/DownloadPage';
import { HomeRedirect } from './pages/HomeRedirect';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
