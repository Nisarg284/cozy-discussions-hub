
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Subreddit from "./pages/Subreddit";
import PostDetail from "./pages/PostDetail";
import VideoSearchPage from "./pages/VideoSearchPage";
import Explore from "./pages/Explore";
import UserProfile from "./pages/UserProfile";
import CreatePost from "./pages/CreatePost";
import CreateSubreddit from "./pages/CreateSubreddit";
import ModeratorPage from "./pages/ModeratorPage";
import Messages from "./pages/Messages";
import VideoCall from "./pages/VideoCall";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner position="top-center" />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/redirect" element={<Auth />} />
                <Route path="/r/:subreddit" element={<Subreddit />} />
                <Route path="/r/:subreddit/comments/:postId" element={<PostDetail />} />
                <Route path="/submit" element={<CreatePost />} />
                <Route path="/r/:subreddit/submit" element={<CreatePost />} />
                <Route path="/subreddits/create" element={<CreateSubreddit />} />
                <Route path="/mod/r/:subreddit" element={<ModeratorPage />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:view" element={<Messages />} />
                <Route path="/messages/:view/:messageId" element={<Messages />} />
                <Route path="/videos" element={<VideoSearchPage />} />
                <Route path="/video-call" element={<VideoCall />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/user/:username" element={<UserProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
