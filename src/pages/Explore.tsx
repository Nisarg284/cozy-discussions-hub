
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Compass, Search, Users, TrendingUp, Award } from 'lucide-react';
import { searchSubreddits } from '@/services/backendApi';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [activeTab, setActiveTab] = useState('trending');

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['subredditSearch', debouncedQuery],
    queryFn: () => searchSubreddits(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already triggered by the debounced query
  };

  if (error) {
    toast.error('Failed to search subreddits');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <Compass className="mr-2 h-8 w-8 text-reddit-orange" />
            Explore Reddit
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mb-6">
            Discover new communities, topics, and content from around Reddit
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search for subreddits..."
                className="pl-10 h-12 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="trending" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Trending</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center">
              <Award className="mr-2 h-4 w-4" />
              <span>Popular</span>
            </TabsTrigger>
            <TabsTrigger value="suggested" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>Suggested</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4">
            {isLoading && debouncedQuery ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-reddit-orange"></div>
              </div>
            ) : searchResults && debouncedQuery ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.subreddits?.map((subreddit: any) => (
                  <SubredditCard key={subreddit.id} subreddit={subreddit} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder for trending subreddits */}
                <SubredditCard 
                  subreddit={{
                    name: 'r/AskReddit',
                    title: 'Ask Reddit',
                    subscribers: 42500000,
                    icon_img: '',
                    description: 'Ask Reddit is the place to ask and answer thought-provoking questions.'
                  }} 
                />
                <SubredditCard 
                  subreddit={{
                    name: 'r/worldnews',
                    title: 'World News',
                    subscribers: 31200000,
                    icon_img: '',
                    description: 'A place for major news from around the world, excluding US-internal news.'
                  }} 
                />
                <SubredditCard 
                  subreddit={{
                    name: 'r/lifeprotips',
                    title: 'Life Pro Tips',
                    subscribers: 22400000,
                    icon_img: '',
                    description: 'Tips that improve your life in one way or another.'
                  }} 
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SubredditCard 
                subreddit={{
                  name: 'r/funny',
                  title: 'Funny',
                  subscribers: 46800000,
                  icon_img: '',
                  description: 'Reddit\'s largest humour depository.'
                }} 
              />
              <SubredditCard 
                subreddit={{
                  name: 'r/gaming',
                  title: 'Gaming',
                  subscribers: 37500000,
                  icon_img: '',
                  description: 'A place for discussions, news, memes, and anything related to games.'
                }} 
              />
              <SubredditCard 
                subreddit={{
                  name: 'r/movies',
                  title: 'Movies',
                  subscribers: 30700000,
                  icon_img: '',
                  description: 'News and discussions about major motion pictures.'
                }} 
              />
            </div>
          </TabsContent>

          <TabsContent value="suggested" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SubredditCard 
                subreddit={{
                  name: 'r/programming',
                  title: 'Programming',
                  subscribers: 8400000,
                  icon_img: '',
                  description: 'Computer programming discussions and news.'
                }} 
              />
              <SubredditCard 
                subreddit={{
                  name: 'r/science',
                  title: 'Science',
                  subscribers: 28900000,
                  icon_img: '',
                  description: 'The latest scientific advancements and discussions.'
                }} 
              />
              <SubredditCard 
                subreddit={{
                  name: 'r/books',
                  title: 'Books',
                  subscribers: 21300000,
                  icon_img: '',
                  description: 'Book recommendations, discussions, and more.'
                }} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface SubredditCardProps {
  subreddit: {
    name: string;
    title: string;
    subscribers: number;
    icon_img?: string;
    description?: string;
  };
}

const SubredditCard = ({ subreddit }: SubredditCardProps) => {
  const {
    name,
    title,
    subscribers,
    icon_img,
    description
  } = subreddit;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-reddit-orange text-white flex items-center justify-center font-bold mr-3">
            {name.substring(2, 3).toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{formatSubscribers(subscribers)} members</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 pb-3">
        <p className="line-clamp-3">{description || `This is the ${title} subreddit.`}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={`/r/${name.substring(2)}`} className="w-full">
          <Button variant="outline" className="w-full hover:bg-reddit-orange hover:text-white">
            Visit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

function formatSubscribers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default Explore;
