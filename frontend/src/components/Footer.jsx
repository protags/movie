import React from 'react';
import { RiMovie2Line } from 'react-icons/ri';
import { FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="w-full bg-background-dark border-t border-border-dark py-8 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <RiMovie2Line className="w-6 h-6 text-purple-400 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]" />
          <span className="text-lg font-extrabold tracking-wider bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-cyan-400">
            CINETAG
          </span>
        </div>

        <p className="text-xs text-gray-500 text-center md:text-left leading-relaxed max-w-md">
          This site does not store any files on its servers. All videos are embedded directly from third-party services. Media information is provided by TMDB.
        </p>

        <div className="flex flex-col items-center md:items-end gap-1.5 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <FiHeart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by <strong className="text-purple-400">Protag</strong></span>
          </div>
          <span className="text-[10px] text-gray-500">© {new Date().getFullYear()} CINETAG. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
