import { DateTime } from "luxon";
import { IssueFactory } from "../../factories/issue_factory";
import { times } from "lodash";
import { ScatterplotBuilder } from "../../../metrics/scatterplot_builder";
import { DataTableBuilder } from "../../../metrics/data_table_builder";

describe("ScatterplotBuilder", () => {
  let builder: ScatterplotBuilder;
  const params = {
    fromDate: DateTime.local(2020, 1, 1),
    toDate: DateTime.local(2020, 2, 1),
    hierarchyLevel: "Story",
    excludeOutliers: false,
  };

  beforeEach(() => {
    builder = new ScatterplotBuilder();
  });

  describe("#buildDataTable", () => {
    it("defines columns", () => {
      const dataTable = builder.buildDataTable([], params);
      expect(dataTable.cols).toEqual([
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
      ]);
    });

    it("adds cycletimes", () => {
      const issues = times(2).map((index) => {
        return IssueFactory.build({
          key: `ISSUE-${index + 1}`,
          completed: DateTime.local(2020, 1, 1 + index),
          cycleTime: index + 1,
        });
      });
      const dataTable = builder.buildDataTable(issues, params);
      expect(dataTable.rows).toEqual([
        ["Date(2020, 0, 1, 0, 0)", 1, "ISSUE-1"],
        ["Date(2020, 0, 2, 0, 0)", 2, "ISSUE-2"],
      ]);
    });

    it("adds the median if there are at least 3 issues", () => {
      const issues = times(3).map((index) => {
        return IssueFactory.build({
          key: `ISSUE-${index + 1}`,
          completed: DateTime.local(2020, 1, 1 + index),
          cycleTime: index + 1,
        });
      });

      const dataTable = builder.buildDataTable(issues, params);

      expect(dataTable.cols).toEqual([
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
      ]);
      expect(dataTable.rows).toEqual([
        ["Date(2020, 0, 1, 0, 0)", null, null, 2],
        ["Date(2020, 1, 1, 0, 0)", null, null, 2],
        ["Date(2020, 0, 1, 0, 0)", 1, "ISSUE-1", null],
        ["Date(2020, 0, 2, 0, 0)", 2, "ISSUE-2", null],
        ["Date(2020, 0, 3, 0, 0)", 3, "ISSUE-3", null],
      ]);
    });

    it("adds 70th, 85th, 95th percentiles if there are at least 10 issues", () => {
      const issues = times(11).map((index) => {
        return IssueFactory.build({
          key: `ISSUE-${index + 1}`,
          completed: DateTime.local(2020, 1, 1 + index),
          cycleTime: index + 1,
        });
      });

      const dataTable = builder.buildDataTable(issues, params);

      expect(dataTable.cols).toEqual([
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
          label: "95th Percentile",
          type: "number",
        },
        {
          label: "85th Percentile",
          type: "number",
        },
        {
          label: "70th Percentile",
          type: "number",
        },
        {
          label: "50th Percentile",
          type: "number",
        },
      ]);
      expect(dataTable.rows).toEqual([
        ["Date(2020, 0, 1, 0, 0)", null, null, 10, 9.5, 8, 6],
        ["Date(2020, 1, 1, 0, 0)", null, null, 10, 9.5, 8, 6],
        ["Date(2020, 0, 1, 0, 0)", 1, "ISSUE-1", null, null, null, null],
        ["Date(2020, 0, 2, 0, 0)", 2, "ISSUE-2", null, null, null, null],
        ["Date(2020, 0, 3, 0, 0)", 3, "ISSUE-3", null, null, null, null],
        ["Date(2020, 0, 4, 0, 0)", 4, "ISSUE-4", null, null, null, null],
        ["Date(2020, 0, 5, 0, 0)", 5, "ISSUE-5", null, null, null, null],
        ["Date(2020, 0, 6, 0, 0)", 6, "ISSUE-6", null, null, null, null],
        ["Date(2020, 0, 7, 0, 0)", 7, "ISSUE-7", null, null, null, null],
        ["Date(2020, 0, 8, 0, 0)", 8, "ISSUE-8", null, null, null, null],
        ["Date(2020, 0, 9, 0, 0)", 9, "ISSUE-9", null, null, null, null],
        ["Date(2020, 0, 10, 0, 0)", 10, "ISSUE-10", null, null, null, null],
        ["Date(2020, 0, 11, 0, 0)", 11, "ISSUE-11", null, null, null, null],
      ]);
    });
  });

  it("builds the json response", () => {
    const issues = times(3).map((index) => {
      return IssueFactory.build({
        key: `ISSUE-${index + 1}`,
        completed: DateTime.local(2020, 1, 1 + index),
        cycleTime: index + 1,
      });
    });

    const dataTable = builder.buildDataTable(issues, params);
    const response = builder.buildResponse(dataTable, issues);

    expect(response).toEqual({
      meta: {
        issuesCount: 3,
      },
      chartOpts: {
        seriesType: "scatter",
        interpolateNulls: true,
        series: {
          "1": {
            type: "steppedArea",
            color: "#03a9f4",
            areaOpacity: 0,
            lineDashStyle: [4, 4],
          },
        },
        legend: {
          position: "none",
        },
        chartArea: {
          width: "90%",
          height: "80%",
          top: "5%",
        },
      },
      chartData: {
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
              { v: "Date(2020, 1, 1, 0, 0)" },
              { v: null },
              { v: null },
              { v: 2 },
            ],
          },
          {
            c: [
              { v: "Date(2020, 0, 1, 0, 0)" },
              { v: 1 },
              { v: "ISSUE-1" },
              { v: null },
            ],
          },
          {
            c: [
              { v: "Date(2020, 0, 2, 0, 0)" },
              { v: 2 },
              { v: "ISSUE-2" },
              { v: null },
            ],
          },
          {
            c: [
              { v: "Date(2020, 0, 3, 0, 0)" },
              { v: 3 },
              { v: "ISSUE-3" },
              { v: null },
            ],
          },
        ],
      },
    });
  });
});
