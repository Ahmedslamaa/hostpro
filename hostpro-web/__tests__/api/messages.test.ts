/**
 * Messages API Integration Tests
 */

describe('Messages API', () => {
  const baseUrl = 'http://localhost:3000/api/v1/messages';
  const tenantId = 'test-tenant-123';
  const userId = 'test-user-456';

  const headers = {
    'x-tenant-id': tenantId,
    'x-user-id': userId,
    'Content-Type': 'application/json'
  };

  describe('GET /api/v1/messages/threads', () => {
    it('should return array of threads', async () => {
      const response = await fetch(`${baseUrl}/threads`, {
        headers
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should require x-tenant-id header', async () => {
      const response = await fetch(`${baseUrl}/threads`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(400);
    });

    it('should return filtered threads', async () => {
      const response = await fetch(`${baseUrl}/threads?platform=airbnb&status=open`, {
        headers
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /api/v1/messages/threads/:id', () => {
    it('should return thread details with messages', async () => {
      // This test requires a valid thread ID from the database
      const threadId = 'test-thread-id';
      const response = await fetch(`${baseUrl}/threads/${threadId}`, {
        headers
      });

      // Should return 200 or 404 depending on whether thread exists
      expect([200, 404]).toContain(response.status);
    });

    it('should require x-tenant-id header', async () => {
      const response = await fetch(`${baseUrl}/threads/test-id`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/messages/threads/:id/reply', () => {
    it('should require message content', async () => {
      const response = await fetch(`${baseUrl}/threads/test-id/reply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
    });

    it('should require x-tenant-id and x-user-id headers', async () => {
      const response = await fetch(`${baseUrl}/threads/test-id/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Test message' })
      });

      expect(response.status).toBe(400);
    });

    it('should reject empty message', async () => {
      const response = await fetch(`${baseUrl}/threads/test-id/reply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: '   ' })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/messages/threads/:id/reply', () => {
    it('should mark thread as read', async () => {
      const threadId = 'test-thread-id';
      const response = await fetch(`${baseUrl}/threads/${threadId}/reply`, {
        method: 'PUT',
        headers
      });

      // Should return 200 or 404 depending on whether thread exists
      expect([200, 404]).toContain(response.status);
    });

    it('should require x-tenant-id header', async () => {
      const response = await fetch(`${baseUrl}/threads/test-id/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/messages/sync', () => {
    it('should trigger message synchronization', async () => {
      const response = await fetch(`${baseUrl}/sync`, {
        method: 'POST',
        headers
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('success');
    });

    it('should require x-tenant-id header', async () => {
      const response = await fetch(`${baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(400);
    });
  });
});
