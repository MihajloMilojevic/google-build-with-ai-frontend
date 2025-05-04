import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/Home';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import SinglePostPage from './pages/SinglePostPage';

const App = () => {
    return (
      <Router>
        <div className='min-h-screen bg-gray-100'>

          {/* Main Content Area */}
          <main className="container mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/posts/:id" element={<SinglePostPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
  
      </Router>
    );
  };
  
  export default App;