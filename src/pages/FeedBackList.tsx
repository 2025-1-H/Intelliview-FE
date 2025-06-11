import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/services/api"; 

const FeedBackList: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await apiGet("/api/v1/interview/report");
        console.log('피드백 응답 데이터:', data);
        setFeedbacks(data);
      } catch (err) {
        console.error("목록 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  return (
    <div>
      <h2>📁 피드백 목록</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        feedbacks.map((item) => (
          <div key={item.id}>
            <span>{item.date}</span>
            <span>{item.score}점</span>
            <Button
              onClick={() =>
                navigate("/feedback-detail", { state: { interviewId: item.id } })
              }
            >
              상세보기
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedBackList;


// import { useLocation } from "react-router-dom";
// import React, { useEffect, useState } from "react";
// import { apiGet } from '@/services/api';



// const FeedBackList = () => {
//   const location = useLocation();
//   const interviewId = location.state?.interviewId;

//   const [feedback, setFeedback] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!interviewId) return;

//     const fetchFeedback = async () => {
//       try {
//         const data = await apiGet(`/api/v1/interview/${interviewId}/report`);
//         setFeedback(data);
//       } catch (err) {
//         console.error("피드백 로딩 실패:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeedback();
//   }, [interviewId]);

//   if (!interviewId) return <div>인터뷰 ID가 없습니다.</div>;
//   if (loading) return <div>로딩 중...</div>;

//   return (
//     <div>
//       <h1>피드백 결과</h1>
//       <p>{feedback?.content}</p>
//       <video src={feedback?.videoUrl} controls />
//     </div>
//   );
// };

// export default FeedBackList;


// import React, { useEffect, useState } from "react";
// import { apiGet } from '@/services/api';
// import { useLocation } from "react-router-dom";


// const FeedBackList = () => {
//   const [feedback, setFeedback] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();
//   const interviewId = location.state?.interviewId;

//   useEffect(() => {
//     if (!interviewId) return;

//     const fetchFeedback = async () => {
//       try {
//         const res = await apiGet(`/api/v1/interview/${interviewId}/report`);
//         const data = await res.json();
//         setFeedback(data);
//       } catch (err) {
//         console.error("피드백 로딩 실패:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeedback();
//   }, []);

//   if (loading) return <div>로딩 중...</div>;
//   if (!feedback) return <div>피드백 없음</div>;

//   return (
//     <div>
//       <h1>피드백 결과</h1>
//       <p>{feedback.content}</p>
//       <video src={feedback.videoUrl} controls />
//     </div>
//   );
// };

// export default FeedBackList;


//아래는 맨처음 작성한 코드드
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";

// const feedbackData = [
//   {
//     id: 1,
//     date: "2025-05-03",
//     interviewType: "표준 면접",
//     score: 82,
//     questions: 7,
//   },
//   {
//     id: 2,
//     date: "2025-05-01",
//     interviewType: "표준 면접",
//     score: 75,
//     questions: 7,
//   },
// ];

// const FeedBackList: React.FC = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="max-w-4xl mx-auto py-12 px-4">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold">📁 피드백 목록</h2>
//         <Button variant="outline" onClick={() => navigate("/live-interview")}>
//           뒤로가기
//         </Button>
//       </div>

//       <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
//         <div className="grid grid-cols-5 bg-gray-50 p-4 border-b text-sm font-medium">
//           <div>날짜</div>
//           <div>면접 유형</div>
//           <div>점수</div>
//           <div>질문 수</div>
//           <div></div>
//         </div>

//         {feedbackData.map((item) => (
//           <div
//             key={item.id}
//             className="grid grid-cols-5 p-4 border-b hover:bg-gray-50 text-sm"
//           >
//             <div>{item.date}</div>
//             <div>{item.interviewType}</div>
//             <div>{item.score}점</div>
//             <div>{item.questions}개</div>
//             <div>
//               <Button size="sm" variant="ghost">
//                 상세보기
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {feedbackData.length === 0 && (
//         <div className="text-center py-16 text-muted-foreground">
//           아직 피드백 기록이 없습니다.
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeedBackList;
