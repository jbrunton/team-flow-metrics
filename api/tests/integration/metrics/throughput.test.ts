import DbFactory from "../fixtures/db_factory";
import { queryData } from "../../../metrics/throughput";
import { DateTime } from "luxon";
import { getConnection, createConnection, getRepository } from "typeorm";
import { Issue } from "../../../models/entities/issue";
import { IssueFactory } from "../../factories/issue_factory";

describe("queryData", () => {
  let params;

  beforeAll(async () => {
    await createConnection();
    await DbFactory.prepareDatabase();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  beforeEach(async () => {
    await DbFactory.resetDatabase();
    params = {
      fromDate: DateTime.local(2020, 2, 1),
      toDate: DateTime.local(2020, 3, 1),
      hierarchyLevel: "Story",
      excludeOutliers: false,
    };
  });

  it("returns the issues in the date range", async () => {
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
});
