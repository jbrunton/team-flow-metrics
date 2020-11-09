import "reflect-metadata";
import { HierarchyLevel } from "../../../models/entities/hierarchy_level";
import { IssueFactory } from "../../factories/issue_factory";
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
    const issue1 = await getRepository(Issue).save(IssueFactory.build());
    const issue2 = await getRepository(Issue).save(IssueFactory.build());
    
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

