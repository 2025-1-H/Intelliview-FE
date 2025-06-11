import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { apiGet } from '@/services/api';

const FeedBackDetail = () => {
  const location = useLocation();
  const interviewId = location.state?.interviewId; //피드백 목록에서 넘긴 interviewId를 받아서 api요청에 활용

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!interviewId) return;

    const fetchFeedback = async () => {
      try {
        const data = await apiGet(`/api/v1/interview/${interviewId}/report`);
        setFeedback(data);
      } catch (err) {
        console.error("피드백 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  if (!interviewId) return <div>인터뷰 ID가 없습니다.</div>;
  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <h1>피드백 결과</h1>
      <p>{feedback?.content}</p>
      <video src={feedback?.videoUrl} controls />
    </div>
  );
};

export default FeedBackDetail;
