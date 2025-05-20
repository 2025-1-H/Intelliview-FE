import React, { useState, useRef } from 'react';

const VideoFeedback: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
const [feedback, setFeedback] = useState<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); 
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setRecordedChunks(chunks);
        if (videoRef.current) {
        videoRef.current.srcObject = null;  // 스트림 해제
        videoRef.current.src = url; 
      }
      };


      recorder.start();
      setMediaStream(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('카메라 접근에 실패했습니다.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    mediaStream?.getTracks().forEach((track) => track.stop());
    setIsRecording(false); 
  };

    const resetRecording = () => {
    setVideoURL(null);
    setRecordedChunks([]);
    setIsRecording(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const uploadToServer = async () => { //분석요청함수
  if (recordedChunks.length === 0) return;

  setIsUploading(true);

  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const formData = new FormData();
  formData.append('video', blob, 'recorded-video.webm');

  try {
    const response = await fetch('https://yourserver.com/analyze', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    setFeedback(result); 

  } catch (error) {
    console.error('업로드 실패:', error);
    alert('분석 요청 중 오류 발생');
  } finally {
    setIsUploading(false);
  }
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
          
              <div className="aspect-video bg-black/5 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        controls={!!videoURL}
                        className="w-full rounded-lg bg-black mb-4 aspect-video"
                        src={videoURL || undefined}
                      />

                      {!isRecording && !videoURL && (
                        <div className="absolute text-center text-muted-foreground text-base">
                          녹화를 시작하려면 아래 버튼을 누르세요
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
              

                {videoURL && !feedback && (
                  <button 
                    onClick={resetRecording}
                    className="btn-bounce bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-medium flex-1"
                  >
                    다시 녹화
                  </button>
                )}

                {videoURL && !feedback && !isUploading && (
                  
                  <button 
                    onClick={uploadToServer}
                    className="btn-bounce bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex-1"
                  >
                    분석 요청
                  </button>
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
