import React from 'react';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:pt-40 md:pb-32">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-block animate-bounce-subtle">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                AI 면접 준비의 새로운 시작
              </span>
            </div>
            
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
              <span className="text-primary">AI</span>와 함께하는 <br /> 
              면접 실력 향상
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl animate-fade-in" style={{ animationDelay: '100ms' }}>
              실시간 면접 시뮬레이션과 오늘의 질문으로 Interview Guru와 함께 
              자신감 있게 면접을 준비하세요. AI 기반 피드백으로 실력을 향상시키고 
              면접 성공률을 높이세요.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* 자기소개 피드백 버튼 임시 비활성화 */}
              {/*
              <Link 
                to="/video-feedback" 
                className="btn-bounce bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium shadow-sm"
              >
                자기소개 피드백 받기
              </Link>
              */}
              
              <Link 
                to="/live-interview" 
                className="btn-bounce bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium shadow-sm"
              >
                실시간 면접 시작하기
              </Link>
              
              <Link 
                to="/daily-question" 
                className="btn-bounce bg-secondary hover:bg-secondary/80 text-foreground px-8 py-3 rounded-lg font-medium"
              >
                오늘의 질문 풀기
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">주요 기능</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Interview Guru는 여러분의 면접 준비를 위한 다양한 기능을 제공합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 자기소개 피드백 카드 임시 제거 */}
            {/*
            {
              title: '자기소개 피드백',
              description: '자기소개 영상을 AI가 분석하여 개선점을 제시합니다.',
              icon: '📹',
              delay: 0,
              link: '/video-feedback'
            },
            */}
            {[
              {
                title: '실시간 면접',
                description: 'AI 면접관과 실시간으로 면접을 진행하고 피드백을 받으세요.',
                icon: '🎙️',
                delay: 0,
                link: '/live-interview'
              },
              {
                title: '오늘의 질문',
                description: '매일 새로운 면접 질문에 도전하고 실력을 키워보세요.',
                icon: '💡',
                delay: 100,
                link: '/daily-question'
              },
              {
                title: '면접 캘린더',
                description: '매일의 면접 준비 기록을 캘린더에서 확인하고 관리하세요.',
                icon: '📅',
                delay: 200,
                link: '/calendar'
              }
            ].map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group glass rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in btn-bounce"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;