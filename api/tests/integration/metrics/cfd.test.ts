import DbFactory from "../fixtures/db_factory";
import { EpicCfdParams, IssueCfdParams, queryData } from "../../../metrics/cfd";
import { DateTime } from "luxon";
import { getConnection, createConnection, getRepository } from "typeorm";
import { Issue } from "../../../models/entities/issue";
import { IssueFactory } from "../../factories/issue_factory";
import { ValidationError } from "../../../metrics/chart_params";
import { times } from "lodash";

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
      includeStoppedIssues: false,
      includeToDoIssues: false,
      includeBacklog: false,
      includeDoneIssues: false,
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

      const data = await queryData(params);

      expect(data).toEqual({
        issues: [expectedIssue],
        backlogSize: 0,
        doneCount: 0,
      });
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

      const data = await queryData({
        ...params,
        hierarchyLevel: "Epic",
      });

      expect(data).toEqual({
        issues: [expectedEpic],
        backlogSize: 0,
        doneCount: 0,
      });
    });

    describe("includeStoppedIssues", () => {
      let stoppedIssue: Issue;
      let doneIssue: Issue;

      beforeEach(async () => {
        doneIssue = await getRepository(Issue).save(
          IssueFactory.build({
            started: DateTime.local(2020, 2, 1, 0, 0),
            completed: DateTime.local(2020, 2, 2, 0, 0),
            statusCategory: "Done",
          })
        );
        stoppedIssue = await getRepository(Issue).save(
          IssueFactory.build({
            started: DateTime.local(2020, 2, 1, 0, 0),
            statusCategory: "To Do",
            created: DateTime.local(2020, 1, 1, 0, 0),
          })
        );
      });

      it("includes stopped issues when true", async () => {
        const data = await queryData({ ...params, includeStoppedIssues: true });
        expect(data).toEqual({
          issues: [doneIssue, stoppedIssue],
          backlogSize: 0,
          doneCount: 0,
        });
      });

      it("excludes stopped issues when false", async () => {
        const data = await queryData({
          ...params,
          includeStoppedIssues: false,
        });
        expect(data).toEqual({
          issues: [doneIssue],
          backlogSize: 0,
          doneCount: 0,
        });
      });
    });

    describe("includeToDoIssues", () => {
      let toDoIssue: Issue;
      let doneIssue: Issue;

      beforeEach(async () => {
        doneIssue = await getRepository(Issue).save(
          IssueFactory.build({
            started: DateTime.local(2020, 2, 1, 0, 0),
            completed: DateTime.local(2020, 2, 2, 0, 0),
            statusCategory: "Done",
          })
        );
        toDoIssue = await getRepository(Issue).save(
          IssueFactory.build({
            statusCategory: "To Do",
            created: DateTime.local(2020, 2, 1, 0, 0),
          })
        );
      });

      it("includes To Do issues when true", async () => {
        const data = await queryData({ ...params, includeToDoIssues: true });
        expect(data).toEqual({
          issues: [doneIssue, toDoIssue],
          backlogSize: 0,
          doneCount: 0,
        });
      });

      it("excludes To Do issues when false", async () => {
        const data = await queryData({ ...params, includeToDoIssues: false });
        expect(data).toEqual({
          issues: [doneIssue],
          backlogSize: 0,
          doneCount: 0,
        });
      });
    });

    describe("includeBacklog", () => {
      const backlogCount = 2;
      let expectedIssue: Issue;

      beforeEach(async () => {
        const backlogIssues = times(backlogCount).map(() =>
          IssueFactory.build({
            statusCategory: "To Do",
            created: DateTime.local(2020, 1, 1, 0, 0),
          })
        );
        await getRepository(Issue).save(backlogIssues);
        expectedIssue = await getRepository(Issue).save(
          IssueFactory.build({
            started: DateTime.local(2020, 2, 2, 0, 0),
            completed: DateTime.local(2020, 2, 3, 0, 0),
          })
        );
      });

      it("counts backlog issues when true", async () => {
        const data = await queryData({
          ...params,
          includeToDoIssues: true,
          includeBacklog: true,
        });
        expect(data).toEqual({
          issues: [expectedIssue],
          backlogSize: backlogCount,
          doneCount: 0,
        });
      });

      it("returns backlogCount = 0 when false", async () => {
        const data = await queryData({
          ...params,
          includeToDoIssues: true,
          includeBacklog: false,
        });
        expect(data).toEqual({
          issues: [expectedIssue],
          backlogSize: 0,
          doneCount: 0,
        });
      });
    });

    describe("includeDoneIssues", () => {
      const doneCount = 3;
      let expectedIssue: Issue;

      beforeEach(async () => {
        const doneIssues = times(doneCount).map(() =>
          IssueFactory.build({
            statusCategory: "Done",
            completed: DateTime.local(2020, 1, 1, 0, 0),
          })
        );
        await getRepository(Issue).save(doneIssues);
        expectedIssue = await getRepository(Issue).save(
          IssueFactory.build({
            started: DateTime.local(2020, 2, 2, 0, 0),
            completed: DateTime.local(2020, 2, 3, 0, 0),
          })
        );
      });

      it("counts done issues when true", async () => {
        const data = await queryData({ ...params, includeDoneIssues: true });
        expect(data).toEqual({
          issues: [expectedIssue],
          backlogSize: 0,
          doneCount,
        });
      });

      it("returns doneCount = 0 when false", async () => {
        const data = await queryData({ ...params, includeDoneIssues: false });
        expect(data).toEqual({
          issues: [expectedIssue],
          backlogSize: 0,
          doneCount: 0,
        });
      });
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

      expect(issues).toEqual({
        issues: [expectedIssue],
        backlogSize: 0,
        doneCount: 0,
      });
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
