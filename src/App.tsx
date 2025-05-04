import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { StrictMode } from "react";
import Index from "./pages/Index";
import LogoutPage from "./pages/LogoutPage";
import NotFound from "./pages/NotFound";
import VideoFeedback from "./pages/VideoFeedback";
import LiveInterview from "./pages/LiveInterview";
import Calendar from "./pages/Calendar";
import DailyQuestion from "./pages/DailyQuestion";
import Header from "./components/ui/layout/Header";
import Footer from "./components/ui/layout/Footer";
import AnimatedTransition from "./components/ui/AnimatedTransition";

const queryClient = new QueryClient();

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <AnimatedTransition>
          <Outlet />
        </AnimatedTransition>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LogoutPage />} />
              
              {/* 헤더와 푸터가 있는,레이아웃을 적용할 라우트들 */}
              <Route element={<Layout />}>
                <Route path="/home" element={<Index />} />
                <Route path="/video-feedback" element={<VideoFeedback />} />
                <Route path="/live-interview" element={<LiveInterview />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/daily-question" element={<DailyQuestion />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;