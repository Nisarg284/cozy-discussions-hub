
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

export const getPersonalizedFeed = async (type = 'best') => {
  try {
    const response = await backendApi.get(`/me/feed/${type}`);
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

export const getSubredditPosts = async (subredditName: string, type = 'hot') => {
  try {
    const response = await backendApi.get(`/subreddit/${subredditName}/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts from r/${subredditName}:`, error);
    throw error;
  }
};

export const searchVideos = async (query: string) => {
  try {
    const response = await backendApi.get('/search', {
      params: {
        query,
        type: 'link',
        sort: 'relevance'
      }
    });
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

export default backendApi;
