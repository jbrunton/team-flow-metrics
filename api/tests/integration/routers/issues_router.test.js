import "reflect-metadata";
import { HierarchyLevel } from "../../../models/entities/hierarchy_level";
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

  beforeEach(async () => {
    const connection = getConnection();

    await connection.query("DELETE FROM issues");
    await connection.query("DELETE FROM fields");
    await connection.query("DELETE FROM hierarchy_levels");

    const levels = await connection.getRepository(HierarchyLevel).create([
      { name: "Story", issueType: "Story" },
      { name: "Epic", issueType: "Epic" }
    ])
    await connection.getRepository(HierarchyLevel).save(levels);
  })

  it('should return a list of issues', async () => {
    const levels = await getRepository(HierarchyLevel).find();
    console.log("levels:", levels);
    const issue1 = await getRepository(Issue).save({
      key: 'DEMO-101',
      title: 'Demo Issue 101',
      issueType: 'Story',
      status: "Backlog",
      statusCategory: "To Do",
      hierarchyLevel: "Story",
      externalUrl: 'https://jira.example.com/browse/DEMO-101',
      parentId: null,
      parentKey: null,
      childCount: null,
      started: null,
      completed: null,
      cycleTime: null
    });
    const issue2 = await getRepository(Issue).save({
      key: 'DEMO-102',
      title: 'Demo Issue 102',
      issueType: 'Story',
      status: "Backlog",
      statusCategory: "To Do",
      hierarchyLevel: "Story",
      externalUrl: 'https://jira.example.com/browse/DEMO-102',
      parentId: null,
      parentKey: null,
      childCount: null,
      started: null,
      completed: null,
      cycleTime: null
    });
    
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

