import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CampaignPage from './pages/CampaignPage';
import UploadPage from './pages/UploadPage';
import PreviewPage from './pages/PreviewPage';
import ResultPage from './pages/ResultPage';
import EditPage from './pages/EditPage';
import ThemeTest from './components/ThemeTest';

function App() {
  return (
    <div className="no-pull-refresh">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theme-test" element={<ThemeTest />} />
          <Route path="/:slug" element={<CampaignPage />} />
          <Route path="/:slug/upload" element={<UploadPage />} />
          <Route path="/:slug/preview" element={<PreviewPage />} />
          <Route path="/:slug/result" element={<ResultPage />} />
          <Route path="/:slug/edit" element={<EditPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
