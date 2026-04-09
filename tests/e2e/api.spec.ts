import { test, expect } from '@playwright/test';

test.describe('API AI Integration', () => {
  test('should collect and structure data via Gemma 4', async ({ request }) => {
    test.setTimeout(120000); // AI calls can be slow
    // We use a query that should trigger some results
    const response = await request.get('/api/collect?q=AI policy');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.query).toBe('AI policy');
    expect(data.results.Social).toBeDefined();
    expect(data.results.Social.success).toBe(true);
    
    // Check if the social data is structured as expected from AIService
    const socialData = data.results.Social.data;
    if (socialData.length > 0) {
      // If we have data, verify the structure
      const firstItem = socialData[0];
      expect(firstItem).toHaveProperty('user');
      expect(firstItem).toHaveProperty('text');
      expect(firstItem).toHaveProperty('sentiment');
      // Sentiment should be a number
      expect(typeof firstItem.sentiment).toBe('number');
    }
  });
});
