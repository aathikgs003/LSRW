import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

// Import the Video-Style Tests (The ones ending in 'Test.jsx')
import TestInterface from './pages/TestInterface'; // Speaking
import ListeningTest from './pages/ListeningTest';
import ReadingTest from './pages/ReadingTest';
import WritingTest from './pages/WritingTest';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Menu */}
        <Route path="/" element={<Dashboard />} />

        {/* Speaking Module (Dynamic ID for Food, Family, etc.) */}
        <Route path="/test/:id" element={<TestInterface />} />
        
        {/* Other Modules */}
        <Route path="/listening" element={<ListeningTest />} />
        <Route path="/reading" element={<ReadingTest />} />
        <Route path="/writing" element={<WritingTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;