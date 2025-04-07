
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: '자기소개 피드백', path: '/video-feedback' },
    { name: '실시간 면접', path: '/live-interview' },
    { name: '면접 캘린더', path: '/calendar' },
    { name: '오늘의 질문', path: '/daily-question' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          to="/" 
          className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2"
        >
          <span className="bg-primary text-white rounded-md px-2 py-1 text-sm">Interview</span>
          <span>Guru</span>
        </Link>
        
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-primary/5 text-foreground/80'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="md:hidden">
          {/* Mobile menu button - simplified for now */}
          <button className="p-2 rounded-md hover:bg-primary/5">
            <div className="w-5 h-0.5 bg-foreground mb-1"></div>
            <div className="w-5 h-0.5 bg-foreground mb-1"></div>
            <div className="w-5 h-0.5 bg-foreground"></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
