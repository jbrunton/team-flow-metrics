import { DateTime } from "luxon";
import { CfdBuilder } from "../../../metrics/cfd_builder";
import { Issue } from "../../../models/entities/issue";
import { IssueFactory } from "../../factories/issue_factory";

describe("CfdBuilder", () => {
  let issue1: Issue, issue2: Issue;

  beforeEach(() => {
    issue1 = IssueFactory.build({
      status: "Done",
      statusCategory: "Done",
      created: DateTime.local(2020, 1, 1, 10, 30),
      started: DateTime.local(2020, 1, 2, 11, 0),
      completed: DateTime.local(2020, 1, 3, 11, 30),
    });
    issue2 = IssueFactory.build({
      status: "Done",
      statusCategory: "Done",
      created: DateTime.local(2020, 1, 1, 9, 30),
      started: DateTime.local(2020, 1, 1, 10, 0),
      completed: DateTime.local(2020, 1, 4, 11, 30),
    });
  });

  describe("#transitions", () => {
    it("returns transitions for the issues", () => {
      const builder = new CfdBuilder();
      builder.addIssues([issue1]);
      expect(builder.transitions()).toEqual([
        {
          key: issue1.key,
          date: DateTime.local(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do",
        },
        {
          key: issue1.key,
          date: DateTime.local(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress",
        },
        {
          key: issue1.key,
          date: DateTime.local(2020, 1, 3, 11, 30),
          fromStatusCategory: "In Progress",
          toStatusCategory: "Done",
        },
      ]);
    });

    it("returns transitions for started issues", () => {
      const issue = IssueFactory.build({
        status: "In Progress",
        statusCategory: "In Progress",
        created: DateTime.local(2020, 1, 1, 10, 30),
        started: DateTime.local(2020, 1, 2, 11, 0),
      });
      const builder = new CfdBuilder();
      builder.addIssues([issue]);
      expect(builder.transitions()).toEqual([
        {
          key: issue.key,
          date: DateTime.local(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do",
        },
        {
          key: issue.key,
          date: DateTime.local(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress",
        },
      ]);
    });

    it("returns transitions for issues moved straight to done", () => {
      const issue = IssueFactory.build({
        status: "Done",
        statusCategory: "Done",
        created: DateTime.local(2020, 1, 1, 10, 30),
        completed: DateTime.local(2020, 1, 2, 11, 0),
      });
      const builder = new CfdBuilder();
      builder.addIssues([issue]);
      expect(builder.transitions()).toEqual([
        {
          key: issue.key,
          date: DateTime.local(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do",
        },
        {
          key: issue.key,
          date: DateTime.local(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "Done",
        },
      ]);
    });

    it("sorts transitions by date", () => {
      const builder = new CfdBuilder();
      builder.addIssues([issue1, issue2]);
      expect(builder.transitions()).toEqual([
        {
          key: issue2.key,
          date: DateTime.local(2020, 1, 1, 9, 30),
          toStatusCategory: "To Do",
        },
        {
          key: issue2.key,
          date: DateTime.local(2020, 1, 1, 10, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress",
        },
        {
          key: issue1.key,
          date: DateTime.local(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do",
        },
        {
          key: issue1.key,
          date: DateTime.local(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress",
        },
        {
          key: issue1.key,
          date: DateTime.local(2020, 1, 3, 11, 30),
          fromStatusCategory: "In Progress",
          toStatusCategory: "Done",
        },
        {
          key: issue2.key,
          date: DateTime.local(2020, 1, 4, 11, 30),
          fromStatusCategory: "In Progress",
          toStatusCategory: "Done",
        },
      ]);
    });
  });

  describe("#build", () => {
    it("returns an empty list if no issues are added", () => {
      const builder = new CfdBuilder();
      expect(builder.build()).toEqual([]);
    });

    it("builds rows for the CFD when an issue is added", () => {
      const builder = new CfdBuilder();
      builder.addIssues([issue1]);
      expect(builder.build()).toEqual([
        {
          date: DateTime.local(2019, 12, 31),
          total: 0,
          toDo: 0,
          inProgress: 0,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 1),
          total: 1,
          toDo: 1,
          inProgress: 0,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 2),
          total: 1,
          toDo: 0,
          inProgress: 1,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 3),
          total: 1,
          toDo: 0,
          inProgress: 0,
          done: 1,
        },
        {
          date: DateTime.local(2020, 1, 4),
          total: 1,
          toDo: 0,
          inProgress: 0,
          done: 1,
        },
      ]);
    });

    it("adds rows for each date", () => {
      issue1.completed = DateTime.local(2020, 1, 5, 10, 0);
      const builder = new CfdBuilder();
      builder.addIssues([issue1]);
      expect(builder.build()).toEqual([
        {
          date: DateTime.local(2019, 12, 31),
          total: 0,
          toDo: 0,
          inProgress: 0,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 1),
          total: 1,
          toDo: 1,
          inProgress: 0,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 2),
          total: 1,
          toDo: 0,
          inProgress: 1,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 3),
          total: 1,
          toDo: 0,
          inProgress: 1,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 4),
          total: 1,
          toDo: 0,
          inProgress: 1,
          done: 0,
        },
        {
          date: DateTime.local(2020, 1, 5),
          total: 1,
          toDo: 0,
          inProgress: 0,
          done: 1,
        },
        {
          date: DateTime.local(2020, 1, 6),
          total: 1,
          toDo: 0,
          inProgress: 0,
          done: 1,
        },
      ]);
    });
  });
});
