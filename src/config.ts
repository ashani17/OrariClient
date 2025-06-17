interface Config {
  apiUrl: string;
  isDevelopment: boolean;
  requestTimeout: number;
  maxRetries: number;
}

const isDevelopment = process.env.NODE_ENV === 'development';

const config: Config = {
  apiUrl: isDevelopment 
    ? 'http://localhost:5267/api'
    : 'https://production-url/api',
  isDevelopment,
  requestTimeout: 10000, // 10 seconds
  maxRetries: 3
};

export default config; 