import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="bg-primary text-white rounded-md px-2 py-1 text-sm">Interview</span>
              <span>Guru</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              AI 기반 면접 준비 도우미로 자신있는 면접을 준비하세요.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">서비스</h3>
            {/* 서비스들을 가로로 배열 */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link to="/live-interview" className="text-muted-foreground hover:text-foreground text-sm">
                실시간 면접
              </Link>
              <Link to="/calendar" className="text-muted-foreground hover:text-foreground text-sm">
                면접 캘린더
              </Link>
              <Link to="/daily-question" className="text-muted-foreground hover:text-foreground text-sm">
                오늘의 질문
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {currentYear} Interview Guru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;