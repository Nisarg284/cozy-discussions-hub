import { useAuth } from "@/context/AuthContext";

export const REDDIT_CLIENT_ID = "GmoAXMWDLSWvCevwNKB7hQ";

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  created: number;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  selftext: string;
  is_self: boolean;
  thumbnail: string;
  upvote_ratio: number;
  is_video: boolean;
  liked: boolean | null;
  media?: any;
  preview?: any;
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  created: number;
  score: number;
  permalink: string;
  replies?: RedditComment[];
  depth: number;
  liked: boolean | null;
}

export interface Subreddit {
  name: string;
  display_name: string;
  subscribers: number;
  icon_img: string;
  description?: string;
  user_is_subscriber?: boolean;
  public_description?: string;
}

interface RedditApiResponse {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: any;
    }>;
    after: string | null;
    before: string | null;
  };
}

export const getAuthUrl = (): string => {
  const redirectUri = "http://localhost:8080/redirect";
  console.log("Using redirect URI:", redirectUri);
  
  const params = new URLSearchParams({
    client_id: REDDIT_CLIENT_ID,
    response_type: "code",
    state: Math.random().toString(36).substring(2, 15),
    redirect_uri: redirectUri,
    duration: "permanent",
    scope: "identity read vote submit subscribe history",
  });

  return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
};

export const useRedditApi = () => {
  const { accessToken, refreshAccessToken, isAuthenticated } = useAuth();

  const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    let token = accessToken;

    if (!token) {
      token = await refreshAccessToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
    }

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        return fetch(url, {
          ...options,
          headers,
        });
      }
    }

    return response;
  };

  const getPosts = async (
    subreddit: string = "",
    sort: "hot" | "new" | "top" | "rising" = "hot",
    after?: string,
    limit: number = 25
  ): Promise<{ posts: RedditPost[]; after: string | null }> => {
    const baseUrl = isAuthenticated ? "https://oauth.reddit.com" : "https://www.reddit.com";
    const path = subreddit ? `/r/${subreddit}/${sort}.json` : `/${sort}.json`;
    
    const params = new URLSearchParams();
    if (after) params.set("after", after);
    params.set("limit", limit.toString());
    params.set("raw_json", "1");
    
    const url = `${baseUrl}${path}?${params.toString()}`;
    
    try {
      const response = isAuthenticated 
        ? await fetchWithAuth(url)
        : await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }
      
      const data: RedditApiResponse = await response.json();
      
      const posts = data.data.children.map(child => {
        const post = child.data;
        return {
          id: post.id,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          created: post.created_utc,
          score: post.score,
          num_comments: post.num_comments,
          url: post.url,
          permalink: post.permalink,
          selftext: post.selftext,
          is_self: post.is_self,
          thumbnail: post.thumbnail,
          upvote_ratio: post.upvote_ratio,
          is_video: post.is_video,
          liked: post.likes,
          media: post.media,
          preview: post.preview,
        };
      });
      
      return {
        posts,
        after: data.data.after,
      };
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  };

  const getPersonalizedFeed = async (
    sort: "best" | "hot" | "new" | "top" | "rising" = "best",
    after?: string,
    limit: number = 25
  ): Promise<{ posts: RedditPost[]; after: string | null }> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required for personalized feed");
    }
    
    const params = new URLSearchParams();
    if (after) params.set("after", after);
    params.set("limit", limit.toString());
    params.set("raw_json", "1");
    
    const url = `https://oauth.reddit.com/${sort}?${params.toString()}`;
    
    try {
      const response = await fetchWithAuth(url);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }
      
      const data: RedditApiResponse = await response.json();
      
      const posts = data.data.children.map(child => {
        const post = child.data;
        return {
          id: post.id,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          created: post.created_utc,
          score: post.score,
          num_comments: post.num_comments,
          url: post.url,
          permalink: post.permalink,
          selftext: post.selftext,
          is_self: post.is_self,
          thumbnail: post.thumbnail,
          upvote_ratio: post.upvote_ratio,
          is_video: post.is_video,
          liked: post.likes,
          media: post.media,
          preview: post.preview,
        };
      });
      
      return {
        posts,
        after: data.data.after,
      };
    } catch (error) {
      console.error("Failed to fetch personalized feed:", error);
      throw error;
    }
  };

  const getSubscribedSubreddits = async (
    limit: number = 25,
    after?: string
  ): Promise<{ subreddits: Subreddit[]; after: string | null }> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required to get subscribed subreddits");
    }
    
    const params = new URLSearchParams();
    if (after) params.set("after", after);
    params.set("limit", limit.toString());
    
    const url = `https://oauth.reddit.com/subreddits/mine/subscriber?${params.toString()}`;
    
    try {
      const response = await fetchWithAuth(url);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }
      
      const data: RedditApiResponse = await response.json();
      
      const subreddits = data.data.children.map(child => {
        const subreddit = child.data;
        return {
          name: subreddit.name,
          display_name: subreddit.display_name,
          subscribers: subreddit.subscribers,
          icon_img: subreddit.icon_img || '',
          user_is_subscriber: true,
          description: subreddit.public_description,
        };
      });
      
      return {
        subreddits,
        after: data.data.after,
      };
    } catch (error) {
      console.error("Failed to fetch subscribed subreddits:", error);
      throw error;
    }
  };

  const getComments = async (
    postId: string,
    subreddit: string
  ): Promise<RedditComment[]> => {
    const baseUrl = isAuthenticated ? "https://oauth.reddit.com" : "https://www.reddit.com";
    const url = `${baseUrl}/r/${subreddit}/comments/${postId}.json?raw_json=1`;
    
    try {
      const response = isAuthenticated 
        ? await fetchWithAuth(url)
        : await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data[1] || !data[1].data || !data[1].data.children) {
        return [];
      }
      
      return parseComments(data[1].data.children);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      throw error;
    }
  };
  
  const parseComments = (children: any[], depth = 0): RedditComment[] => {
    return children
      .filter(child => child.kind === 't1')
      .map(child => {
        const comment = child.data;
        let replies: RedditComment[] = [];
        
        if (comment.replies && 
            comment.replies.data && 
            comment.replies.data.children) {
          replies = parseComments(comment.replies.data.children, depth + 1);
        }
        
        return {
          id: comment.id,
          author: comment.author,
          body: comment.body,
          created: comment.created_utc,
          score: comment.score,
          permalink: comment.permalink,
          replies,
          depth,
          liked: comment.likes,
        };
      });
  };

  const vote = async (id: string, direction: 1 | 0 | -1): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required to vote");
    }

    try {
      const response = await fetchWithAuth("https://oauth.reddit.com/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          id: `t3_${id}`,
          dir: direction.toString(),
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Vote failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Vote failed:", error);
      throw error;
    }
  };

  const getSubreddits = async (
    query?: string
  ): Promise<Subreddit[]> => {
    const baseUrl = isAuthenticated ? "https://oauth.reddit.com" : "https://www.reddit.com";
    
    const url = query 
      ? `${baseUrl}/subreddits/search.json?q=${encodeURIComponent(query)}&limit=10&raw_json=1`
      : `${baseUrl}/subreddits/popular.json?limit=10&raw_json=1`;
    
    try {
      const response = isAuthenticated 
        ? await fetchWithAuth(url)
        : await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }
      
      const data: RedditApiResponse = await response.json();
      
      return data.data.children.map(child => {
        const subreddit = child.data;
        return {
          name: subreddit.name,
          display_name: subreddit.display_name,
          subscribers: subreddit.subscribers,
          icon_img: subreddit.icon_img || '',
          description: subreddit.description || subreddit.public_description || '',
          user_is_subscriber: subreddit.user_is_subscriber || false,
          public_description: subreddit.public_description || '',
        };
      });
    } catch (error) {
      console.error("Failed to fetch subreddits:", error);
      throw error;
    }
  };

  const subscribeToSubreddit = async (
    subredditName: string,
    action: 'sub' | 'unsub'
  ): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required to subscribe");
    }

    try {
      const response = await fetchWithAuth("https://oauth.reddit.com/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          sr_name: subredditName,
          action,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Subscription update failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Subscription update failed:", error);
      throw error;
    }
  };

  const searchVideos = async (
    query: string,
    after?: string,
    limit: number = 25
  ): Promise<{ posts: RedditPost[]; after: string | null }> => {
    const baseUrl = isAuthenticated ? "https://oauth.reddit.com" : "https://www.reddit.com";
    
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("type", "link");
    params.set("is_video", "true");
    if (after) params.set("after", after);
    params.set("limit", limit.toString());
    params.set("raw_json", "1");
    
    const url = `${baseUrl}/search.json?${params.toString()}`;
    
    try {
      const response = isAuthenticated 
        ? await fetchWithAuth(url)
        : await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }
      
      const data: RedditApiResponse = await response.json();
      
      const posts = data.data.children
        .filter(child => child.data.is_video)
        .map(child => {
          const post = child.data;
          return {
            id: post.id,
            title: post.title,
            author: post.author,
            subreddit: post.subreddit,
            created: post.created_utc,
            score: post.score,
            num_comments: post.num_comments,
            url: post.url,
            permalink: post.permalink,
            selftext: post.selftext,
            is_self: post.is_self,
            thumbnail: post.thumbnail,
            upvote_ratio: post.upvote_ratio,
            is_video: post.is_video,
            liked: post.likes,
            media: post.media,
            preview: post.preview,
          };
        });
      
      return {
        posts,
        after: data.data.after,
      };
    } catch (error) {
      console.error("Failed to search videos:", error);
      throw error;
    }
  };

  return {
    getPosts,
    getPersonalizedFeed,
    getComments,
    vote,
    getSubreddits,
    getSubscribedSubreddits,
    subscribeToSubreddit,
    searchVideos
  };
};
