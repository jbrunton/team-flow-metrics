import { DateTime } from "luxon";
import "reflect-metadata";
const request = require("supertest");
const { createApp } = require("../../../app");
const { Issue } = require("../../../models/entities/issue");
const DbFactory = require("../fixtures/db_factory");
import { IssueFactory } from "../../factories/issue_factory";

const { getConnection, getRepository } = require("typeorm");

describe("charts_router", () => {
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

  describe("GET /scatterplot", () => {
    it("should return cycle time data", async () => {
      const issue1 = await getRepository(Issue).save(
        IssueFactory.build({
          status: "Done",
          statusCategory: "Done",
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
          cycleTime: 1,
        })
      );
      const issue2 = await getRepository(Issue).save(
        IssueFactory.build({
          status: "Done",
          statusCategory: "Done",
          started: DateTime.local(2020, 2, 3, 0, 0),
          completed: DateTime.local(2020, 2, 5, 0, 0),
          cycleTime: 2,
        })
      );
      const issue3 = await getRepository(Issue).save(
        IssueFactory.build({
          status: "Done",
          statusCategory: "Done",
          started: DateTime.local(2020, 2, 3, 0, 0),
          completed: DateTime.local(2020, 2, 7, 0, 0),
          cycleTime: 3,
        })
      );

      const res = await request(app).get(
        "/charts/scatterplot?fromDate=2020-01-01&toDate=2020-03-01&hierarchyLevel=Story"
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.chartData).toEqual({
        cols: [
          {
            label: "completed_time",
            type: "date",
          },
          {
            label: "cycle_time",
            type: "number",
          },
          {
            label: "key",
            type: "string",
            role: "annotationText",
          },
          {
            label: "50th Percentile",
            type: "number",
          },
        ],
        rows: [
          {
            c: [
              { v: "Date(2020, 0, 1, 0, 0)" },
              { v: null },
              { v: null },
              { v: 2 },
            ],
          },
          {
            c: [
              { v: "Date(2020, 2, 1, 0, 0)" },
              { v: null },
              { v: null },
              { v: 2 },
            ],
          },
          {
            c: [
              { v: "Date(2020, 1, 2, 0, 0)" },
              { v: 1 },
              { v: issue1.key },
              { v: null },
            ],
          },
          {
            c: [
              { v: "Date(2020, 1, 5, 0, 0)" },
              { v: 2 },
              { v: issue2.key },
              { v: null },
            ],
          },
          {
            c: [
              { v: "Date(2020, 1, 7, 0, 0)" },
              { v: 3 },
              { v: issue3.key },
              { v: null },
            ],
          },
        ],
      });
    });

    it("filters out epics", async () => {
      const issue1 = await getRepository(Issue).save(
        IssueFactory.build({
          issueType: "Story",
          status: "Done",
          statusCategory: "Done",
          hierarchyLevel: "Story",
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
          cycleTime: 1,
        })
      );
      await getRepository(Issue).save(
        IssueFactory.build({
          issueType: "Epic",
          status: "Done",
          statusCategory: "Done",
          hierarchyLevel: "Epic",
          started: DateTime.local(2020, 2, 3, 0, 0),
          completed: DateTime.local(2020, 2, 5, 0, 0),
          cycleTime: 2,
        })
      );

      const res = await request(app).get(
        "/charts/scatterplot?fromDate=2020-01-01&toDate=2020-03-01&hierarchyLevel=Story"
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.chartData).toEqual({
        cols: [
          {
            label: "completed_time",
            type: "date",
          },
          {
            label: "cycle_time",
            type: "number",
          },
          {
            label: "key",
            type: "string",
            role: "annotationText",
          },
        ],
        rows: [
          {
            c: [{ v: "Date(2020, 1, 2, 0, 0)" }, { v: 1 }, { v: issue1.key }],
          },
        ],
      });
    });
  });

  describe("GET /throughput", () => {
    it("returns throughput data", async () => {
      const issue1 = await getRepository(Issue).save(
        IssueFactory.build({
          status: "Done",
          statusCategory: "Done",
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
          cycleTime: 1,
        })
      );
      const issue2 = await getRepository(Issue).save(
        IssueFactory.build({
          status: "Done",
          statusCategory: "Done",
          started: DateTime.local(2020, 2, 3, 0, 0),
          completed: DateTime.local(2020, 2, 5, 0, 0),
          cycleTime: 2,
        })
      );

      const res = await request(app).get(
        "/charts/throughput?fromDate=2020-02-01&toDate=2020-02-06&hierarchyLevel=Story&stepInterval=Daily"
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.chartData).toEqual({
        cols: [
          {
            label: "completed_time",
            type: "date",
          },
          {
            label: "Count",
            type: "number",
          },
          {
            label: "date",
            role: "annotationText",
            type: "string",
          },
        ],
        rows: [
          {
            c: [{ v: "Date(2020, 1, 1, 0, 0)" }, { v: 0 }, { v: "2020-02-01" }],
          },
          {
            c: [{ v: "Date(2020, 1, 2, 0, 0)" }, { v: 1 }, { v: "2020-02-02" }],
          },
          {
            c: [{ v: "Date(2020, 1, 3, 0, 0)" }, { v: 0 }, { v: "2020-02-03" }],
          },
          {
            c: [{ v: "Date(2020, 1, 4, 0, 0)" }, { v: 0 }, { v: "2020-02-04" }],
          },
          {
            c: [{ v: "Date(2020, 1, 5, 0, 0)" }, { v: 1 }, { v: "2020-02-05" }],
          },
        ],
      });
    });
  });
});
