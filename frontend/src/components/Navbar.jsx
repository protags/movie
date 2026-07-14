import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { RiMovie2Line } from 'react-icons/ri';

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/discover/movies' },
    { name: 'TV Shows', path: '/discover/tv' },
    { name: 'Anime', path: '/discover/anime' },
    { name: 'My Library', path: '/library' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="relative z-40 w-full bg-zinc-950/95 border-b border-zinc-900/80 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white group">
          <RiMovie2Line className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
          <span className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-cyan-400">
            CINETAG
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative py-1 ${isActive(link.path)
                  ? 'text-purple-400'
                  : 'text-gray-300 hover:text-white'
                }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Search Icon button */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/search"
            className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors duration-200"
            title="Search"
          >
            <FiSearch className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile hamburger & search */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            to="/search"
            className="p-2 text-gray-300 hover:text-white"
          >
            <FiSearch className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel border-t border-white/5 py-4 px-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 ${isActive(link.path) ? 'text-purple-400' : 'text-gray-300'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
