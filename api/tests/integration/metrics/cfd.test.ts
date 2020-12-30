import DbFactory from "../fixtures/db_factory";
import { EpicCfdParams, IssueCfdParams, queryData } from "../../../metrics/cfd";
import { DateTime } from "luxon";
import { getConnection, createConnection, getRepository } from "typeorm";
import { Issue } from "../../../models/entities/issue";
import { IssueFactory } from "../../factories/issue_factory";
import { ValidationError } from "../../../metrics/chart_params";

describe("queryData", () => {
  beforeAll(async () => {
    await createConnection();
    await DbFactory.prepareDatabase();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  beforeEach(async () => {
    await DbFactory.resetDatabase();
  });

  describe("when given IssueCfdParams", () => {
    const params: IssueCfdParams = {
      fromDate: DateTime.local(2020, 2, 1),
      toDate: DateTime.local(2020, 3, 1),
      hierarchyLevel: "Story",
      excludeStoppedIssues: false,
    };

    it("returns issues completed in the given date range", async () => {
      await getRepository(Issue).save(
        IssueFactory.build({
          started: DateTime.local(2020, 1, 1, 0, 0),
          completed: DateTime.local(2020, 1, 2, 0, 0),
        })
      );
      const expectedIssue = await getRepository(Issue).save(
        IssueFactory.build({
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
        })
      );
      await getRepository(Issue).save(
        IssueFactory.build({
          started: DateTime.local(2020, 3, 1, 0, 0),
          completed: DateTime.local(2020, 3, 2, 0, 0),
        })
      );

      const issues = await queryData(params);

      expect(issues).toEqual([expectedIssue]);
    });

    it("filters issues by hierarchy level", async () => {
      await getRepository(Issue).save(
        IssueFactory.build({
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
        })
      );
      const expectedEpic = await getRepository(Issue).save(
        IssueFactory.build({
          issueType: "Epic",
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
        })
      );

      const issues = await queryData({
        ...params,
        hierarchyLevel: "Epic",
      });

      expect(issues).toEqual([expectedEpic]);
    });

    it("filters stopped issues", async () => {
      const expectedIssue = await getRepository(Issue).save(
        IssueFactory.build({
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
          statusCategory: "Done",
        })
      );
      await getRepository(Issue).save(
        IssueFactory.build({
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
          statusCategory: "To Do",
        })
      );

      const issues = await queryData({ ...params, excludeStoppedIssues: true });

      expect(issues).toEqual([expectedIssue]);
    });
  });

  describe("when given EpicCfdParams", () => {
    const params: EpicCfdParams = {
      epicKey: "EPIC-101",
    };

    it("returns issues completed in the given date range", async () => {
      const epic = await getRepository(Issue).save(
        IssueFactory.build({
          key: "EPIC-101",
        })
      );
      await getRepository(Issue).save(
        IssueFactory.build({
          started: DateTime.local(2020, 1, 1, 0, 0),
          completed: DateTime.local(2020, 1, 2, 0, 0),
        })
      );
      const expectedIssue = await getRepository(Issue).save(
        IssueFactory.build({
          epicId: epic.id,
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
        })
      );

      const issues = await queryData(params);

      expect(issues).toEqual([expectedIssue]);
    });

    it("throws an error if the epic cannot be found", async () => {
      try {
        await queryData(params);
        fail("Expected exception");
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect(e.validationErrors).toEqual([
          "Could not find epic with key EPIC-101",
        ]);
      }
    });
  });
});
