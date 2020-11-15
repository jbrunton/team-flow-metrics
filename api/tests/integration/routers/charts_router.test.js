import "reflect-metadata";
import { HierarchyLevel } from "../../../models/entities/hierarchy_level";
const request = require('supertest')
const { createApp } = require('../../../app')
const { Issue } = require('../../../models/entities/issue')
const DbFactory = require('../fixtures/db_factory');
import { IssueFactory } from "../../factories/issue_factory";

const { getConnection, getRepository } = require('typeorm')

describe('charts_router', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
    await DbFactory.prepareDatabase();
  })

  afterAll(async () => {
    await getConnection().close();
  })

  beforeEach(async () => {
    await DbFactory.resetDatabase();
  })

  describe('/scatterplot', () => {
    it('should return cycle time data', async () => {
      const issue1 = await getRepository(Issue).save(IssueFactory.build({
        status: "Done",
        statusCategory: "Done",
        started: new Date(2020, 1, 1, 0, 0),
        completed: new Date(2020, 1, 2, 0, 0),
        cycleTime: 1
      }));
      const issue2 = await getRepository(Issue).save(IssueFactory.build({
        status: "Done",
        statusCategory: "Done",
        started: new Date(2020, 1, 3, 0, 0),
        completed: new Date(2020, 1, 5, 0, 0),
        cycleTime: 2
      }));

      const res = await request(app)
        .get('/charts/scatterplot?fromDate=2020-01-01&toDate=2020-03-01&hierarchyLevel=Story')
      
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
          },
          {
            label: "key",
            type: "string",
            role: "annotationText"
          },
          {
            label: "95th Percentile",
            type: "number"
          },
          {
            label: "85th Percentile",
            type: "number"
          },
          {
            label: "70th Percentile",
            type: "number"
          },
          {
            label: "50th Percentile",
            type: "number"
          }
        ],
        rows: [
          {
            c: [
              { v: "Date(2020, 1, 2, 0, 0)" },
              { v: 1 },
              { v: issue1.key },
              { v: null },
              { v: null },
              { v: null },
              { v: null }
            ]
          },
          {
            c: [
              { v: "Date(2020, 1, 5, 0, 0)" },
              { v: 2 },
              { v: issue2.key },
              { v: null },
              { v: null },
              { v: null },
              { v: null }
            ],
          },
          {
            c: [
              { v: "Date(2020, 0, 1, 0, 0)" },
              { v: null },
              { v: null },
              { v: 1 },
              { v: 1 },
              { v: 1 },
              { v: 1 }
            ],
          },
          {
            c: [
              { v: "Date(2020, 2, 1, 0, 0)" },
              { v: null },
              { v: null },
              { v: 1 },
              { v: 1 },
              { v: 1 },
              { v: 1 }
            ]
          },
        ]
      })
    })

    it('filters out epics', async () => {
      const issue1 = await getRepository(Issue).save(IssueFactory.build({
        issueType: 'Story',
        status: "Done",
        statusCategory: "Done",
        hierarchyLevel: "Story",
        started: new Date(2020, 1, 1, 0, 0),
        completed: new Date(2020, 1, 2, 0, 0),
        cycleTime: 1
      }));
      await getRepository(Issue).save(IssueFactory.build({
        issueType: 'Epic',
        status: "Done",
        statusCategory: "Done",
        hierarchyLevel: "Epic",
        started: new Date(2020, 1, 3, 0, 0),
        completed: new Date(2020, 1, 5, 0, 0),
        cycleTime: 2
      }));

      const res = await request(app)
        .get('/charts/scatterplot?fromDate=2020-01-01&toDate=2020-03-01&hierarchyLevel=Story')
      
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
          },
          {
            label: "key",
            type: "string",
            role: "annotationText"
          },

        ],
        rows: [
          {
            c: [
              { v: "Date(2020, 1, 2, 0, 0)" },
              { v: 1 },
              { v: issue1.key }
            ]
          }
        ]
      })
    })
  })
})

