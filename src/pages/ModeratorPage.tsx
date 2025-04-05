
import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ModTools from "@/components/ModTools";

const ModeratorPage = () => {
  const { subreddit } = useParams<{ subreddit: string }>();
  
  return (
    <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
      <Navbar />
      <div className="pt-16">
        <ModTools subreddit={subreddit || ""} />
      </div>
    </div>
  );
};

export default ModeratorPage;
