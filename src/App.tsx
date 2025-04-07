
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VideoFeedback from "./pages/VideoFeedback";
import LiveInterview from "./pages/LiveInterview";
import Calendar from "./pages/Calendar";
import DailyQuestion from "./pages/DailyQuestion";
import Header from "./components/ui/layout/Header";
import Footer from "./components/ui/layout/Footer";
import AnimatedTransition from "./components/ui/AnimatedTransition";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <AnimatedTransition>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/video-feedback" element={<VideoFeedback />} />
                    <Route path="/live-interview" element={<LiveInterview />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/daily-question" element={<DailyQuestion />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatedTransition>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
