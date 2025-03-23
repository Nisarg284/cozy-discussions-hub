
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const backendApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important to include cookies for session-based auth
});

export const getMe = async () => {
  try {
    const response = await backendApi.get('/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const getPersonalizedFeed = async (type = 'best', after = null) => {
  try {
    const url = after ? `/me/feed/${type}?after=${after}` : `/me/feed/${type}`;
    const response = await backendApi.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type} feed:`, error);
    throw error;
  }
};

export const getSubscribedSubreddits = async (where = 'subscriber') => {
  try {
    const response = await backendApi.get(`/me/subreddit/${where}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscribed subreddits:', error);
    throw error;
  }
};

export const getSubredditPosts = async (subredditName: string, type = 'hot', after = null) => {
  try {
    const url = after ? `/subreddit/${subredditName}/${type}?after=${after}` : `/subreddit/${subredditName}/${type}`;
    const response = await backendApi.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts from r/${subredditName}:`, error);
    throw error;
  }
};

export const searchVideos = async (query: string, after = null) => {
  try {
    const params: Record<string, string> = {
      query,
      type: 'link',
      sort: 'relevance'
    };
    
    if (after) {
      params.after = after;
    }
    
    const response = await backendApi.get('/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

export const getSubredditInfo = async (subredditName: string, where = 'about') => {
  try {
    const response = await backendApi.get(`/subreddit/${subredditName}/about/${where}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching info for r/${subredditName}:`, error);
    throw error;
  }
};

export const searchSubreddits = async (query: string) => {
  try {
    const response = await backendApi.get('/search/subreddit_info', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching subreddits:', error);
    throw error;
  }
};

export const getFriendSuggestions = async () => {
  try {
    // This would typically be a specialized endpoint
    // For now, we'll use popular subreddits as a proxy for friend suggestions
    const response = await backendApi.get('/me/subreddit/popular');
    return response.data;
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    throw error;
  }
};

export const getUserKarma = async () => {
  try {
    const response = await backendApi.get('/me/karma');
    return response.data;
  } catch (error) {
    console.error('Error fetching user karma:', error);
    throw error;
  }
};

export const getUserTrophies = async () => {
  try {
    const response = await backendApi.get('/me/trophies');
    return response.data;
  } catch (error) {
    console.error('Error fetching user trophies:', error);
    throw error;
  }
};

export default backendApi;
