
import React, { useState } from 'react';

const VideoFeedback: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | {
    overview: string;
    strengths: string[];
    improvements: string[];
    bodylanguage: string;
    voice: string;
    content: string;
    score: number;
  }>(null);

  const startRecording = () => {
    setIsRecording(true);
    // In a real implementation, we would start recording here
    // For demo purposes, we'll simulate recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate creating a video URL
    setVideoURL('https://example.com/demo-video.mp4');
  };

  const uploadVideo = () => {
    setIsUploading(true);
    
    // Simulate API call to get feedback
    setTimeout(() => {
      setFeedback({
        overview: "전반적으로 안정적인 자기소개를 하셨습니다. 목소리 톤과 내용은 좋았으나, 시선 처리와 바디랭귀지에서 개선할 점이 보입니다.",
        strengths: [
          "명확한 목소리 톤과 발음",
          "구조적으로 잘 정리된 내용",
          "적절한 속도로 발표"
        ],
        improvements: [
          "시선 처리 - 카메라를 더 자주 응시하세요",
          "손동작이 다소 과도함 - 더 자연스러운 제스처 사용 권장",
          "내용에 구체적인 예시 추가 필요"
        ],
        bodylanguage: "다소 긴장된 모습이 보이며, 손동작이 과도한 경향이 있습니다. 어깨의 긴장을 풀고 더 자연스러운 자세를 유지하세요.",
        voice: "목소리 톤과 속도는 적절하나, 중요 포인트에서 강조가 부족합니다. 핵심 내용을 강조하는 톤 변화를 추가하세요.",
        content: "자기소개의 구조는 명확하나, 구체적인 경험이나 성과에 대한 언급이 부족합니다. 본인의 역량을 입증할 수 있는 구체적인 사례를 추가하세요.",
        score: 78
      });
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-4">자기소개 영상 피드백</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            자기소개 영상을 녹화하고 AI의 분석을 통해 개선점을 확인하세요.
            면접에서의 첫인상을 결정짓는 자기소개를 완벽하게 준비할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="glass rounded-xl p-6 animate-slide-in">
            <h2 className="text-xl font-medium mb-4">녹화하기</h2>
            
            <div className="aspect-video bg-black/5 rounded-lg mb-4 flex items-center justify-center">
              {videoURL ? (
                <div className="w-full h-full bg-black/10 rounded-lg flex items-center justify-center text-muted-foreground">
                  영상 미리보기
                </div>
              ) : (
                <div className="text-muted-foreground">
                  {isRecording ? "녹화 중..." : "카메라를 켜서 녹화를 시작하세요"}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {!isRecording && !videoURL && (
                <button 
                  onClick={startRecording}
                  className="btn-bounce bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex-1"
                >
                  녹화 시작
                </button>
              )}
              
              {isRecording && (
                <button 
                  onClick={stopRecording}
                  className="btn-bounce bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex-1"
                >
                  녹화 종료
                </button>
              )}
              
              {videoURL && !feedback && !isUploading && (
                <>
                  <button 
                    onClick={() => setVideoURL(null)}
                    className="btn-bounce bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-medium flex-1"
                  >
                    다시 녹화
                  </button>
                  
                  <button 
                    onClick={uploadVideo}
                    className="btn-bounce bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex-1"
                  >
                    분석 요청
                  </button>
                </>
              )}
              
              {isUploading && (
                <button 
                  disabled
                  className="bg-primary/70 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex-1 opacity-70"
                >
                  분석 중...
                </button>
              )}
            </div>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="mb-2">💡 자기소개 녹화 팁:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>밝은 조명에서 촬영하세요.</li>
                <li>카메라를 눈높이에 맞추세요.</li>
                <li>1-2분 내외로 간결하게 말하세요.</li>
                <li>주요 경력과 역량에 초점을 맞추세요.</li>
              </ul>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6 animate-slide-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-medium mb-4">AI 피드백</h2>
            
            {feedback ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">종합 평가</h3>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      점수: {feedback.score}/100
                    </div>
                  </div>
                  <p className="text-sm">{feedback.overview}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium text-green-700 mb-2">잘한 점</h3>
                    <ul className="text-sm space-y-2">
                      {feedback.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h3 className="font-medium text-amber-700 mb-2">개선할 점</h3>
                    <ul className="text-sm space-y-2">
                      {feedback.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">!</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">바디랭귀지</h3>
                    <p className="text-sm">{feedback.bodylanguage}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">목소리 및 발음</h3>
                    <p className="text-sm">{feedback.voice}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">내용 구성</h3>
                    <p className="text-sm">{feedback.content}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setFeedback(null);
                      setVideoURL(null);
                    }}
                    className="btn-bounce bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm w-full"
                  >
                    새로운 영상 녹화하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">🎥</div>
                <p>영상을 녹화하고 분석을 요청하면<br/>AI가 상세한 피드백을 제공합니다.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="glass rounded-xl p-8 animate-slide-up">
          <h2 className="text-xl font-medium mb-6 text-center">자기소개 가이드라인</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 p-5 rounded-lg">
              <div className="text-primary text-xl font-medium mb-3">구성 요소</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">1.</span>
                  <span>간략한 소개 (이름, 지원 분야)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">2.</span>
                  <span>주요 경력 및 성과 (1-2개)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">3.</span>
                  <span>핵심 역량 및 강점</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">4.</span>
                  <span>지원 동기와 포부</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/50 p-5 rounded-lg">
              <div className="text-primary text-xl font-medium mb-3">바디랭귀지</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>자연스러운 시선 처리 (70-80% 카메라 응시)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>바른 자세 (어깨를 펴고 약간 앞으로 기울임)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>적절한 제스처 (과도하지 않게 사용)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>자신감 있는 표정 (미소, 진지함 적절히 조절)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/50 p-5 rounded-lg">
              <div className="text-primary text-xl font-medium mb-3">말하기 스킬</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>적절한 속도 (너무 빠르거나 느리지 않게)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>명확한 발음과 적절한 볼륨</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>강조점에서 톤 변화 주기</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span>간결하고 논리적인 문장 구사</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFeedback;
