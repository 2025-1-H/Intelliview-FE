import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const feedbackData = [
  {
    id: 1,
    date: "2025-05-03",
    interviewType: "표준 면접",
    score: 82,
    questions: 7,
  },
  {
    id: 2,
    date: "2025-05-01",
    interviewType: "표준 면접",
    score: 75,
    questions: 7,
  },
];

const FeedBackList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📁 피드백 목록</h2>
        <Button variant="outline" onClick={() => navigate("/live-interview")}>
          뒤로가기
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-5 bg-gray-50 p-4 border-b text-sm font-medium">
          <div>날짜</div>
          <div>면접 유형</div>
          <div>점수</div>
          <div>질문 수</div>
          <div></div>
        </div>

        {feedbackData.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-5 p-4 border-b hover:bg-gray-50 text-sm"
          >
            <div>{item.date}</div>
            <div>{item.interviewType}</div>
            <div>{item.score}점</div>
            <div>{item.questions}개</div>
            <div>
              <Button size="sm" variant="ghost">
                상세보기
              </Button>
            </div>
          </div>
        ))}
      </div>

      {feedbackData.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          아직 피드백 기록이 없습니다.
        </div>
      )}
    </div>
  );
};

export default FeedBackList;
