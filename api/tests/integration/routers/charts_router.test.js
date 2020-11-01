import "reflect-metadata";
const request = require('supertest')
const { createApp } = require('../../../app')
const { Issue } = require('../../../models/entities/issue')

const { getConnection, getRepository } = require('typeorm')

describe('charts_router', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  })

  afterAll(async () => {
    await getConnection().close();
  })

  beforeEach(async () => {
    const connection = getConnection();
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  })

  describe('/scatterplot', () => {
    it('should return cycle time data', async () => {
      const issue1 = await getRepository(Issue).save({
        key: 'DEMO-101',
        title: 'Demo Issue 101',
        started: new Date(2020, 1, 1, 0, 0),
        completed: new Date(2020, 1, 2, 0, 0),
        cycleTime: 1
      });
      const issue2 = await getRepository(Issue).save({
        key: 'DEMO-102',
        title: 'Demo Issue 102',
        started: new Date(2020, 1, 3, 0, 0),
        completed: new Date(2020, 1, 5, 0, 0),
        cycleTime: 2
      });

      const res = await request(app)
        .get('/charts/scatterplot')
      
      expect(res.statusCode).toEqual(200)
      expect(res.body.chartData).toEqual({
        cols: [
          {
            label: "completed_time",
            type: "date"
          },
          {
            label: "cycle_time",
            type: "number"
          }
        ],
        rows: [
          {
            c: [
              { v: "Date(2020, 1, 1, 0, 0)" },
              { v: 1 }
            ]
          },
          {
            c: [
              { v: "Date(2020, 1, 3, 0, 0)" },
              { v: 2 }
            ]
          },
        ]
      })
    })
  })
})

