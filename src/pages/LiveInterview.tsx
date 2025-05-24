import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LiveInterview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-gray-50 rounded-2xl shadow-lg p-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-10">실시간 AI 면접</h1>
        <p className="text-gray-600 text-base md:text-lg mb-8">
          실제 면접과 유사한 환경에서 <span className="text-blue-600 font-semibold">AI 면접관</span>과
          실시간으로 면접을 진행하고<br className="hidden md:inline" />
          상세한 피드백 리포트를 받아보세요.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-10 text-left shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">🧾 면접 진행 순서</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 leading-relaxed">
            <li><span className="text-blue-600 font-semibold">직군</span>과 <span className="text-blue-600 font-semibold">희망 회사</span>를 선택합니다.</li>
            <li>총 <span className="text-blue-600 font-semibold">5개</span>의 질문에 답변하며 영상을 녹화합니다.</li>
            <li>면접이 끝나면 <span className="text-blue-600 font-semibold">AI 분석 리포트</span>가 자동으로 생성됩니다.</li>
          </ol>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <Button
            className="w-64 h-16 text-base font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
            onClick={() => navigate("/live-interview/feedback")}
          >
            피드백 목록 보기
          </Button>

          <Button
            className="w-64 h-16 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={() => navigate("/live-interview/ready")}
          >
            면접 시작
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;


// import React from "react";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";

// const LiveInterview: React.FC = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="max-w-3xl mx-auto py-20 px-4 text-center">
//       <h1 className="text-4xl font-bold mb-4">실시간 면접</h1>
//       <p className="text-gray-600 text-sm mb-8">
//         실제 면접과 유사한 환경에서 AI 면접관과 실시간으로 면접을 진행하고 상세한 피드백을 받아보세요.
//       </p>

//       <div className="mb-12 text-xl font-medium">
//         <p className="mb-2">[실시간 면접은 이렇게 진행돼요 👇]</p>
//         <p className="leading-relaxed">
//           1. 직군과 희망 회사를 선택합니다. <br />
//           2. 총 5개의 질문에 답변하며 영상을 녹화합니다. <br />
//           3. 면접이 끝나면 AI 리포트가 자동 생성됩니다.
//         </p>
//       </div>

//       <div className="flex flex-col md:flex-row justify-center items-center gap-6">
//         <Button
//           className="w-64 h-20 text-lg bg-blue-500 text-white hover:bg-blue-600"
//           onClick={() => navigate("/live-interview/feedback")}
//         >
//           피드백 목록 보기
//         </Button>

//         <Button
//           className="w-64 h-20 text-lg bg-blue-500 text-white hover:bg-blue-600"
//           onClick={() => navigate("/live-interview/ready")} // 🔥 핵심: 여기가 라우팅 포인트
//         >
//           면접 시작
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default LiveInterview;
