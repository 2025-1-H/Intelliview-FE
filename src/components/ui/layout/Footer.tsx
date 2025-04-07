
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
            <ul className="space-y-2">
              <li>
                <Link to="/video-feedback" className="text-muted-foreground hover:text-foreground text-sm">
                  자기소개 피드백
                </Link>
              </li>
              <li>
                <Link to="/live-interview" className="text-muted-foreground hover:text-foreground text-sm">
                  실시간 면접
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-muted-foreground hover:text-foreground text-sm">
                  면접 캘린더
                </Link>
              </li>
              <li>
                <Link to="/daily-question" className="text-muted-foreground hover:text-foreground text-sm">
                  오늘의 질문
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">회사</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm">
                  소개
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm">
                  개인정보 처리방침
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm">
                  이용약관
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">문의</h3>
            <p className="text-muted-foreground text-sm">
              궁금한 점이 있으시면 아래로 문의해주세요.
            </p>
            <a href="mailto:support@interviewguru.kr" className="text-primary text-sm mt-2 inline-block">
              support@interviewguru.kr
            </a>
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
