import { DateTime } from "luxon";
import { IssueFactory } from "../../factories/issue_factory";
import { times } from "lodash";
import {
  buildResponse,
  buildDataTable,
  parseParams,
} from "../../../metrics/cfd";
import { ValidationError } from "../../../metrics/chart_params";

const issueCfdParams = {
  fromDate: DateTime.local(2020, 1, 1),
  toDate: DateTime.local(2020, 1, 8),
  hierarchyLevel: "Story",
  excludeStoppedIssues: false,
};

const epicCfdParams = {
  epicKey: "EPIC-101",
};

describe("#parseParams", () => {
  it("parses IssueCfdParams", () => {
    const params = parseParams({
      fromDate: "2020-01-01",
      toDate: "2020-02-01",
      hierarchyLevel: "Story",
      excludeStoppedIssues: "true",
    });
    expect(params).toEqual({
      fromDate: DateTime.utc(2020, 1, 1),
      toDate: DateTime.utc(2020, 2, 1),
      hierarchyLevel: "Story",
      excludeStoppedIssues: true,
    });
  });

  it("defaults excludeStoppedIssues to false", () => {
    const params = parseParams({
      fromDate: "2020-01-01",
      toDate: "2020-02-01",
      hierarchyLevel: "Story",
    });
    expect(params).toEqual({
      fromDate: DateTime.utc(2020, 1, 1),
      toDate: DateTime.utc(2020, 2, 1),
      hierarchyLevel: "Story",
      excludeStoppedIssues: false,
    });
  });

  it("parses EpicCfdParams", () => {
    const params = parseParams({
      epicKey: "EPIC-101",
    });
    expect(params).toEqual({
      epicKey: "EPIC-101",
    });
  });

  it("validates the params", () => {
    try {
      parseParams({});
      fail("Expected exception");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.validationErrors).toEqual([
        "Required epicKey or fromDate and toDate query params",
      ]);
    }
  });
});

describe("#buildDataTable", () => {
  describe("for IssueCfdParams", () => {
    it("defines columns", () => {
      const dataTable = buildDataTable([], issueCfdParams);
      expect(dataTable.cols).toEqual([
        {
          label: "Date",
          type: "date",
        },
        {
          label: "Total",
          type: "number",
        },
        {
          label: "Tooltip",
          type: "number",
          role: "tooltip",
        },
        {
          label: "Done",
          type: "number",
        },
        {
          label: "In Progress",
          type: "number",
        },
      ]);
    });

    it("builds the CFD", () => {
      const issues = times(2).map((index) => {
        return IssueFactory.build({
          key: `ISSUE-${index + 1}`,
          created: DateTime.local(2020, 1, 2 + index),
          started: DateTime.local(2020, 1, 3 + index),
          completed: DateTime.local(2020, 1, 5 + index),
          cycleTime: 2,
        });
      });
      const dataTable = buildDataTable(issues, issueCfdParams);
      expect(dataTable.rows).toEqual([
        ["Date(2020, 0, 2, 0, 0)", 0, 1, 0, 0],
        ["Date(2020, 0, 3, 0, 0)", 0, 2, 0, 1],
        ["Date(2020, 0, 4, 0, 0)", 0, 2, 0, 2],
        ["Date(2020, 0, 5, 0, 0)", 0, 2, 1, 1],
        ["Date(2020, 0, 6, 0, 0)", 0, 2, 2, 0],
        ["Date(2020, 0, 7, 0, 0)", 0, 2, 2, 0],
      ]);
    });
  });

  describe("for EpicCfdParams", () => {
    it("defines columns", () => {
      const dataTable = buildDataTable([], epicCfdParams);
      expect(dataTable.cols).toEqual([
        {
          label: "Date",
          type: "date",
        },
        {
          label: "Total",
          type: "number",
        },
        {
          label: "Tooltip",
          type: "number",
          role: "tooltip",
        },
        {
          label: "Done",
          type: "number",
        },
        {
          label: "In Progress",
          type: "number",
        },
        {
          label: "To Do",
          type: "number",
        },
      ]);
    });

    it("builds the CFD", () => {
      const issues = times(2).map((index) => {
        return IssueFactory.build({
          key: `ISSUE-${index + 1}`,
          created: DateTime.local(2020, 1, 2 + index),
          started: DateTime.local(2020, 1, 3 + index),
          completed: DateTime.local(2020, 1, 5 + index),
          cycleTime: 2,
        });
      });
      const dataTable = buildDataTable(issues, epicCfdParams);
      expect(dataTable.rows).toEqual([
        ["Date(2020, 0, 1, 0, 0)", 0, 0, 0, 0, 0],
        ["Date(2020, 0, 2, 0, 0)", 0, 1, 0, 0, 1],
        ["Date(2020, 0, 3, 0, 0)", 0, 2, 0, 1, 1],
        ["Date(2020, 0, 4, 0, 0)", 0, 2, 0, 2, 0],
        ["Date(2020, 0, 5, 0, 0)", 0, 2, 1, 1, 0],
        ["Date(2020, 0, 6, 0, 0)", 0, 2, 2, 0, 0],
        ["Date(2020, 0, 7, 0, 0)", 0, 2, 2, 0, 0],
      ]);
    });
  });
});

it("builds the json response", () => {
  const issues = times(2).map((index) => {
    return IssueFactory.build({
      key: `ISSUE-${index + 1}`,
      created: DateTime.local(2020, 1, 2 + index),
      started: DateTime.local(2020, 1, 3 + index),
      completed: DateTime.local(2020, 1, 5 + index),
      cycleTime: 2,
    });
  });

  const dataTable = buildDataTable(issues, issueCfdParams);
  const response = buildResponse(dataTable, issues, issueCfdParams);

  expect(response).toEqual({
    meta: {
      issuesCount: 2,
    },
    chartOpts: {
      chartArea: {
        width: "90%",
        height: "80%",
        top: "5%",
      },
      height: 300,
      hAxis: {
        titleTextStyle: {
          color: "#333",
        },
      },
      vAxis: { minValue: 0 },
      isStacked: true,
      lineWidth: 1,
      areaOpacity: 0.4,
      legend: {
        position: "top",
      },
      series: {
        "0": {
          color: "grey",
        },
        "1": {
          color: "blue",
        },
        "2": {
          color: "green",
        },
        "3": {
          color: "red",
        },
        "4": {
          color: "orange",
        },
      },
      crosshair: {
        trigger: "focus",
        orientation: "vertical",
        color: "grey",
      },
      focusTarget: "category",
      annotations: {
        textStyle: {
          color: "black",
        },
        domain: {
          style: "line",
          stem: {
            color: "red",
          },
        },
        datum: {
          style: "point",
          stem: {
            color: "black",
            length: "12",
          },
        },
      },
    },
    chartData: {
      cols: [
        {
          label: "Date",
          type: "date",
        },
        {
          label: "Total",
          type: "number",
        },
        {
          label: "Tooltip",
          type: "number",
          role: "tooltip",
        },
        {
          label: "Done",
          type: "number",
        },
        {
          label: "In Progress",
          type: "number",
        },
      ],
      rows: [
        {
          c: [
            { v: "Date(2020, 0, 2, 0, 0)" },
            { v: 0 },
            { v: 1 },
            { v: 0 },
            { v: 0 },
          ],
        },
        {
          c: [
            { v: "Date(2020, 0, 3, 0, 0)" },
            { v: 0 },
            { v: 2 },
            { v: 0 },
            { v: 1 },
          ],
        },
        {
          c: [
            { v: "Date(2020, 0, 4, 0, 0)" },
            { v: 0 },
            { v: 2 },
            { v: 0 },
            { v: 2 },
          ],
        },
        {
          c: [
            { v: "Date(2020, 0, 5, 0, 0)" },
            { v: 0 },
            { v: 2 },
            { v: 1 },
            { v: 1 },
          ],
        },
        {
          c: [
            { v: "Date(2020, 0, 6, 0, 0)" },
            { v: 0 },
            { v: 2 },
            { v: 2 },
            { v: 0 },
          ],
        },
        {
          c: [
            { v: "Date(2020, 0, 7, 0, 0)" },
            { v: 0 },
            { v: 2 },
            { v: 2 },
            { v: 0 },
          ],
        },
      ],
    },
  });
});
