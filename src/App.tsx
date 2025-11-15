import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CampaignPage from './pages/CampaignPage';
import ProfileUploadPage from './pages/ProfileUploadPage';
import ThreeLayerEditPage from './pages/ThreeLayerEditPage';
import ResultPage from './pages/ResultPage';
import ThemeTest from './components/ThemeTest';

function App() {
  return (
    <div className="no-pull-refresh">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theme-test" element={<ThemeTest />} />
          <Route path="/:slug" element={<CampaignPage />} />
          <Route path="/:slug/profile-upload" element={<ProfileUploadPage />} />
          <Route path="/:slug/edit" element={<ThreeLayerEditPage />} />
          <Route path="/:slug/result" element={<ResultPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
