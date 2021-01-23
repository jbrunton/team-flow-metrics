import { IssueFactory } from "../../factories/issue_factory";
const request = require("supertest");
const { createApp } = require("../../../app");
const DbFactory = require("../fixtures/db_factory");
const { Issue } = require("../../../models/entities/issue");

const { getConnection, getRepository } = require("typeorm");

describe("meta_router", () => {
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

  describe("/meta/resolutions", () => {
    it("returns a list of unique resolutions", async () => {
      await getRepository(Issue).save(
        IssueFactory.build({ resolution: "Done" })
      );
      await getRepository(Issue).save(
        IssueFactory.build({ resolution: "Done" })
      );
      await getRepository(Issue).save(
        IssueFactory.build({ resolution: "Won't Fix" })
      );
  
      const res = await request(app).get("/meta/resolutions");
  
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        count: 2,
        resolutions: ["Done", "Won't Fix"],
      });
    });
  });
});
