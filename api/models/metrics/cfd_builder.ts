import { Issue } from "../entities/issue";
const moment = require("moment");

export type CfdRow = {
  date: Date;
  total: number;
  toDo: number;
  inProgress: number;
  done: number;
};

type CfdTransition = {
  date: Date;
  key: string;
  fromStatusCategory?: string;
  toStatusCategory: string;
}

export class CfdBuilder {
  private issues: Array<Issue> = [];

  addIssues(issues: Issue[]) {
    this.issues = this.issues.concat(issues);
  }

  build(chartFromDate?: Date, chartToDate?: Date): CfdRow[] {
    const transitions = this.transitions();
    if (!transitions.length) {
      return [];
    }
    const firstDate = transitions[0].date;
    const lastDate = transitions[transitions.length - 1].date;
    const fromDate = moment(firstDate).startOf('day').subtract(1, 'day').toDate();
    const toDate = moment(lastDate).startOf('day').add(1, 'day').toDate();
    const firstRow: CfdRow = {
      date: fromDate,
      total: 0,
      toDo: 0,
      inProgress: 0,
      done: 0,
    };
    const rows = transitions.reduce<CfdRow[]>((rows, transition) => {
      let currentRow = rows[rows.length - 1];
      while (!moment(currentRow.date).isSame(transition.date, 'day')) {
        currentRow = {
          date: moment(currentRow.date).add(1, 'day').toDate(),
          total: currentRow.total,
          toDo: currentRow.toDo,
          inProgress: currentRow.inProgress,
          done: currentRow.done,
        };
        rows.push(currentRow);
      }
      if (transition.fromStatusCategory) {
        switch (transition.fromStatusCategory) {
          case "To Do":
            --currentRow.toDo;
            break;
          case "In Progress":
            --currentRow.inProgress;
            break;
          case "Done":
            --currentRow.done;
            break;
        }
      }
      switch (transition.toStatusCategory) {
        case "To Do":
          ++currentRow.toDo;
          ++currentRow.total;
          break;
        case "In Progress":
          ++currentRow.inProgress;
          break;
        case "Done":
          ++currentRow.done;
          break;
      }
      return rows;
    }, [firstRow]);
    const lastRow = rows[rows.length - 1];
    rows.push({
      date: toDate,
      total: lastRow.total,
      toDo: lastRow.toDo,
      inProgress: lastRow.inProgress,
      done: lastRow.done,
    });
    if (chartFromDate && chartToDate) {
      return rows.filter(row => {
        return moment(chartFromDate).isBefore(row.date) && moment(row.date).isBefore(chartToDate);
      });  
    }
    return rows;
  }

  transitions(): CfdTransition[] {
    return this.issues
      .map(issue => {
        const transitions: CfdTransition[] = [{ date: issue.created, key: issue.key, toStatusCategory: "To Do"}];
        if (issue.started) {
          transitions.push({
            date: issue.started,
            key: issue.key,
            fromStatusCategory: "To Do",
            toStatusCategory: "In Progress"
          })
        }
        if (issue.completed) {
          transitions.push({
            date: issue.completed,
            key: issue.key,
            fromStatusCategory: issue.started ? "In Progress" : "To Do",
            toStatusCategory: "Done"
          })
        }
        return transitions;
      })
      .flat()
      .sort((t1, t2) => moment(t1.date).diff(moment(t2.date)));
  }
}
