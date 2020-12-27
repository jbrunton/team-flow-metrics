import DbFactory from "../fixtures/db_factory";
import {
  ScatterplotBuilder,
  ScatterplotParams,
} from "../../../metrics/scatterplot_builder";
import { DateTime } from "luxon";
import { getConnection, createConnection, getRepository } from "typeorm";
import { Issue } from "../../../models/entities/issue";
import { IssueFactory } from "../../factories/issue_factory";
import { times } from "lodash";

describe("ScatterplotBuilder", () => {
  let builder;
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
    builder = new ScatterplotBuilder();
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

    const issues = await builder.queryData(params);

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

    const issues = await builder.queryData({
      ...params,
      hierarchyLevel: "Epic",
    });

    expect(issues).toEqual([expectedEpic]);
  });

  it("filters outliers", async () => {
    const expectedIssues = await getRepository(Issue).save(
      times(5, () => {
        return IssueFactory.build({
          started: DateTime.local(2020, 2, 1, 0, 0),
          completed: DateTime.local(2020, 2, 2, 0, 0),
          cycleTime: 1,
        });
      })
    );
    await getRepository(Issue).save(
      IssueFactory.build({
        started: DateTime.local(2020, 2, 1, 0, 0),
        completed: DateTime.local(2020, 2, 2, 0, 0),
        cycleTime: 100,
      })
    );

    const issues = await builder.queryData({
      ...params,
      excludeOutliers: true,
    });

    expect(issues).toEqual(expectedIssues);
  });
});
