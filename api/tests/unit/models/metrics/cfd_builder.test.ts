import { CfdBuilder } from "../../../../models/metrics/cfd_builder";
import { IssueFactory } from "../../../factories/issue_factory";

describe("CfdBuilder", () => {
  const issue1 = IssueFactory.build({
    status: "Done",
    statusCategory: "Done",
    created: new Date(2020, 1, 1, 10, 30),
    started: new Date(2020, 1, 2, 11, 0),
    completed: new Date(2020, 1, 3, 11, 30),
  });
  const issue2 = IssueFactory.build({
    status: "Done",
    statusCategory: "Done",
    created: new Date(2020, 1, 0, 9, 30),
    started: new Date(2020, 1, 1, 10, 0),
    completed: new Date(2020, 1, 4, 11, 30),
  });

  describe("#transitions", () => {
    it("returns transitions for the issues", () => {
      const builder = new CfdBuilder();
      builder.addIssues([issue1]);
      expect(builder.transitions()).toEqual([
        {
          date: new Date(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do"
        },
        {
          date: new Date(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress"
        },
        {
          date: new Date(2020, 1, 3, 11, 30),
          fromStatusCategory: "In Progress",
          toStatusCategory: "Done"
        },
      ])
    });

    it("returns transitions for started issues", () => {
      const builder = new CfdBuilder();
      builder.addIssues([IssueFactory.build({
        status: "In Progress",
        statusCategory: "In Progress",
        created: new Date(2020, 1, 1, 10, 30),
        started: new Date(2020, 1, 2, 11, 0),
      })]);
      expect(builder.transitions()).toEqual([
        {
          date: new Date(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do"
        },
        {
          date: new Date(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress"
        },
      ])
    });

    it("returns transitions for issues moved straight to done", () => {
      const builder = new CfdBuilder();
      builder.addIssues([IssueFactory.build({
        status: "Done",
        statusCategory: "Done",
        created: new Date(2020, 1, 1, 10, 30),
        completed: new Date(2020, 1, 2, 11, 0),
      })]);
      expect(builder.transitions()).toEqual([
        {
          date: new Date(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do"
        },
        {
          date: new Date(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "Done"
        },
      ])
    });

    it("sorts transitions by date", () => {
      const builder = new CfdBuilder();
      builder.addIssues([issue1, issue2]);
      expect(builder.transitions()).toEqual([
        {
          date: new Date(2020, 1, 0, 9, 30),
          toStatusCategory: "To Do"
        },
        {
          date: new Date(2020, 1, 1, 10, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress"
        },
        {
          date: new Date(2020, 1, 1, 10, 30),
          toStatusCategory: "To Do"
        },
        {
          date: new Date(2020, 1, 2, 11, 0),
          fromStatusCategory: "To Do",
          toStatusCategory: "In Progress"
        },
        {
          date: new Date(2020, 1, 3, 11, 30),
          fromStatusCategory: "In Progress",
          toStatusCategory: "Done"
        },
        {
          date: new Date(2020, 1, 4, 11, 30),
          fromStatusCategory: "In Progress",
          toStatusCategory: "Done"
        },
      ])
    });
  })

  describe("#build", () => {
    it("returns an empty list if no issues are added", () => {
      const builder = new CfdBuilder();
      expect(builder.build()).toEqual([]);
    })

    xit("builds rows for the CFD when an issue is added", () => {
      const builder = new CfdBuilder();
      builder.addIssues([issue1]);
      expect(builder.build()).toEqual([
        {
          date: new Date(2020, 1, 1),
          total: 0,
          toDo: 0,
          inProgress: 0,
          done: 0,
        },
        {
          date: new Date(2020, 1, 1, 10, 30),
          total: 1,
          toDo: 1,
          inProgress: 0,
          done: 0,
        },
        {
          date: new Date(2020, 1, 2, 0, 0),
          total: 1,
          toDo: 1,
          inProgress: 0,
          done: 0,
        },
        {
          date: new Date(2020, 1, 2, 11, 0),
          total: 1,
          toDo: 0,
          inProgress: 1,
          done: 0,
        },
        {
          date: new Date(2020, 1, 3, 0, 0),
          total: 1,
          toDo: 0,
          inProgress: 1,
          done: 0,
        },
        {
          date: new Date(2020, 1, 3, 11, 30),
          total: 1,
          toDo: 0,
          inProgress: 0,
          done: 1,
        },
        {
          date: new Date(2020, 1, 4, 0, 0),
          total: 1,
          toDo: 0,
          inProgress: 0,
          done: 1,
        },
      ])
    })
  })

});
