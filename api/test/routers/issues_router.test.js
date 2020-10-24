const request = require('supertest')
const app = require('../../app')

describe('issues_router', () => {
  it('should return a list of issues', async () => {
    const res = await request(app)
      .get('/issues')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      issues: [
        { key: 'DEMO-101', title: 'Demo Issue 101' },
        { key: 'DEMO-102', title: 'Demo Issue 102' }
      ]
    })
  })
})

