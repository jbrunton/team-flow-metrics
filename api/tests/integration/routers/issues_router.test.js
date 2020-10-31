import "reflect-metadata";
const request = require('supertest')
const { createApp } = require('../../../app')
const { Issue } = require('../../../models/entities/issue')

const { getConnection, getRepository } = require('typeorm')

describe('issues_router', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  })

  afterAll(async () => {
    await getConnection().close();
  })

  beforeEach(() => {
    const connection = getConnection();
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  })

  it('should return a list of issues', async () => {
    const issue1 = await getRepository(Issue).save({ key: 'DEMO-101', title: 'Demo Issue 101', started: null, completed: null, cycleTime: null });
    const issue2 = await getRepository(Issue).save({ key: 'DEMO-102', title: 'Demo Issue 102', started: null, completed: null, cycleTime: null });
    
    const res = await request(app)
      .get('/issues')
    
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({
        count: 2,
        issues: [
          issue1,
          issue2
        ]
      })
  })
})

