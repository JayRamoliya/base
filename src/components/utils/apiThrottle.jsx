class ApiThrottler {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minDelay = 1000; // Minimum 1 second between requests
  }

  async throttledRequest(apiCall) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ apiCall, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { apiCall, resolve, reject } = this.requestQueue.shift();
      
      // Ensure minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(r => setTimeout(r, this.minDelay - timeSinceLastRequest));
      }

      try {
        const result = await apiCall();
        this.lastRequestTime = Date.now();
        resolve(result);
      } catch (error) {
        // Implement exponential backoff for rate limit errors
        if (error.response?.status === 429) {
          const retryAfter = Math.min(5000, 2000 * Math.random()); // Random delay up to 5 seconds
          console.warn(`Rate limited, retrying after ${retryAfter}ms`);
          await new Promise(r => setTimeout(r, retryAfter));
          
          // Retry the request
          try {
            const result = await apiCall();
            this.lastRequestTime = Date.now();
            resolve(result);
          } catch (retryError) {
            reject(retryError);
          }
        } else {
          reject(error);
        }
      }

      // Small delay between all requests
      await new Promise(r => setTimeout(r, 500));
    }

    this.isProcessing = false;
  }
}

export const apiThrottler = new ApiThrottler();