import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InterviewInfoProps {
  onStartInterview: () => void;
}

export default function InterviewInfo({ onStartInterview }: InterviewInfoProps) {
  const [jobType, setJobType] = useState("");
  const [company, setCompany] = useState("");
  const [preference, setPreference] = useState("");

  return (
    <div className="max-w-xl mx-auto p-6 mt-24 space-y-6">
      <h1 className="text-2xl font-bold text-center">실시간 면접 시작하기</h1>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1️⃣ 원하는 직군을 선택하세요.</p>
              <div className="flex gap-2 flex-wrap">
                {["프론트엔드", "백엔드", "기획", "디자인"].map((type) => (
                  <Button
                    key={type}
                    variant={jobType === type ? "default" : "outline"}
                    onClick={() => setJobType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">2️⃣ 지원할 회사를 입력해주세요.</p>
              <Input
                placeholder="예: 카카오엔터프라이즈"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <p className="font-semibold mb-2">3️⃣ 우대사항이 있다면 작성해주세요 (선택)</p>
              <Textarea
                placeholder="예: React, 자유로운 개발 문화 등"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-6">
            <p className="font-semibold mb-2">✅ 입력 내용 요약</p>
            <ul className="space-y-1 text-sm">
              <li>📌 직군: {jobType || "(선택 안 함)"}</li>
              <li>🏢 희망 회사: {company || "(미입력)"}</li>
              <li>🌟 우대사항: {preference || "(작성 안 함)"}</li>
            </ul>

            <p className="font-semibold pt-4">🧾 면접 체크리스트</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>카메라/마이크 연결 확인</li>
              <li>주변 소음 없는지 확인</li>
              <li>인터넷 연결 상태 확인</li>
              <li>AI 면접이 녹화될 수 있음에 동의함</li>
            </ul>
          </div>

          <div className="text-right pt-6">
            <Button 
              className="bg-blue-600 text-white" 
              onClick={onStartInterview} 
              disabled={!jobType || !company}
            >
              면접 시작
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
