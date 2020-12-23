import "reflect-metadata";
import { HierarchyLevel } from "../../../models/entities/hierarchy_level";
import { IssueFactory } from "../../factories/issue_factory";
const request = require("supertest");
const { createApp } = require("../../../app");
const DbFactory = require("../fixtures/db_factory");
const { Issue } = require("../../../models/entities/issue");

const { getConnection, getRepository } = require("typeorm");

describe("issues_router", () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
    await DbFactory.prepareDatabase();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  beforeEach(async () => {
    await DbFactory.resetDatabase();
  });

  it("should return a list of issues", async () => {
    const issue1 = await getRepository(Issue).save(
      IssueFactory.build({ created: new Date(2020, 0, 1) })
    );
    const issue2 = await getRepository(Issue).save(
      IssueFactory.build({ created: new Date(2020, 0, 1) })
    );

    const res = await request(app).get("/issues");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      count: 2,
      issues: [
        Object.assign({}, issue1, { created: "2020-01-01T00:00:00.000Z" }),
        Object.assign({}, issue2, { created: "2020-01-01T00:00:00.000Z" }),
      ],
    });
  });
});
