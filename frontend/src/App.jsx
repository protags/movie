import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Discover from './pages/Discover';
import MediaDetails from './pages/MediaDetails';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Library from './pages/Library';
import Test from './pages/Test';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white selection:bg-purple-600/30 selection:text-purple-200">
      {/* Toast Notification Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13141f',
            color: '#f3f4f6',
            border: '1px solid #232537',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#a855f7',
              secondary: '#13141f',
            },
          },
        }}
      />

      {/* Navigation Bar */}
      <Navbar />

      {/* Page Routing Container */}
      <main className="flex-1 w-full flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover/:type" element={<Discover />} />
          <Route path="/details/:type/:id" element={<MediaDetails />} />
          <Route path="/watch/:type/:id" element={<Watch />} />
          <Route path="/watch/:type/:id/:season/:episode" element={<Watch />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path='/test' element={<Test />} />
          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Footer credits and disclosures */}
      <Footer />
    </div>
  );
}