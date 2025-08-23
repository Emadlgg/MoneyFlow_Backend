// MoneyFlow_Backend/tests/integration/basic-api.test.js
const request = require('supertest');
const app = require('../../app');

describe('Basic API Integration', () => {
  test('should respond to health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
  });
  
  test('should handle 404 for unknown routes', async () => {
    await request(app)
      .get('/api/nonexistent')
      .expect(404);
  });

  test('should return JSON content type', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  test('should handle POST requests', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    // Ruta existe, aunque falle la autenticación
    expect(response.status).not.toBe(404);
  });
});