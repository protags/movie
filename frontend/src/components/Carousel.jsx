import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Carousel({ children, title }) {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      containerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel py-2">
      {/* Title */}
      {title && (
        <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-wide mb-4 px-1 border-l-4 border-purple-500 pl-3">
          {title}
        </h3>
      )}

      {/* Slide Controls */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-16 bg-black/60 backdrop-blur-md border border-white/10 rounded-r-xl text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-purple-600/90"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-16 bg-black/60 backdrop-blur-md border border-white/10 rounded-l-xl text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-purple-600/90"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
      >
        {children}
      </div>
    </div>
  );
}
