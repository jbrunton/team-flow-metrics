import * as express from 'express';
import { Between, IsNull, LessThan, MoreThan, MoreThanOrEqual, Not } from 'typeorm';
import { HierarchyLevel } from '../models/entities/hierarchy_level';
import { CfdBuilder } from '../models/metrics/cfd_builder';
import { DataTableBuilder } from '../models/metrics/data_table_builder';
const moment = require('moment');
import { Moment } from "moment";
const { jStat } = require('jstat');
const router = express.Router()
const { getRepository } = require('typeorm')
import { Issue } from '../models/entities/issue';
import { takeWhile } from "lodash";
import { dateRange, nextIntervalDate, StepInterval } from '../helpers/date_helper';
const { formatDate } = require('../helpers/charts_helper');

router.get('/scatterplot', async (req, res) => {
  if (!req.query.fromDate) {
    res.status(400).json({
      error: "Required fromDate query param"
    })
  }
  if (!req.query.toDate) {
    res.status(400).json({
      error: "Required toDate query param"
    })
  }
  if (!req.query.hierarchyLevel) {
    res.status(400).json({
      error: "Required hierarchyLevel query param"
    })
  }

  const fromDate = moment(req.query.fromDate).toDate();
  const toDate = moment(req.query.toDate).toDate();
  const hierarchyLevel = req.query.hierarchyLevel;
  let issues = await getRepository(Issue)
    .find({
      completed: Between(fromDate, toDate),
      issueType: hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
      started: Not(IsNull())
    });

  if (req.query.excludeOutliers === "true") {
    const cycleTimes = issues.map(issue => issue.cycleTime);
    const [q25, _, q75] = jStat.quartiles(cycleTimes);
    const iqr = q75 - q25;
    const cutoff = iqr * 1.5;
    const outlierFilter = (issue) => {
      return q25 - cutoff <= issue.cycleTime && issue.cycleTime <= q75 + cutoff;
    }
    issues = issues.filter(outlierFilter);
  }

  const chartOpts = {
    seriesType: "scatter",
    interpolateNulls: true,
    series: {
      "1": {
        "type": "steppedArea",
        "color": "#f44336",
        "areaOpacity": 0
      },
      "2": {
        "type": "steppedArea",
        "color": "#f44336",
        "areaOpacity": 0,
        "lineDashStyle": [
          4,
          4
        ]
      },
      "3": {
        "type": "steppedArea",
        "color": "#ff9800",
        "areaOpacity": 0,
        "lineDashStyle": [
          4,
          4
        ]
      },
      "4": {
        "type": "steppedArea",
        "color": "#03a9f4",
        "areaOpacity": 0,
        "lineDashStyle": [
          4,
          4
        ]
      }
    },
    legend: {
      position: "none"
    },
    chartArea: {
      width: "90%",
      height: "80%",
      top: "5%"
    }
  };
  const builder = new DataTableBuilder();
  builder.setColumns([
    {
      label: "completed_time",
      type: "date"
    },
    {
      label: "cycle_time",
      type: "number"
    },
    {
      label: "key",
      type: "string",
      role: "annotationText"
    }
  ])

  builder.addRows(issues.map(issue => [
    formatDate(issue.completed),
    issue.cycleTime,
    issue.key
  ]))

  builder.addPercentiles(1, [50, 70, 85, 95], formatDate(fromDate), formatDate(toDate));

  res.json({
    meta: {
      issueCount: builder.rows.length
    },
    chartOpts: chartOpts,
    chartData: builder.build()
  })
})

router.get("/cfd", async (req, res) => {
  let issues: Issue[];
  let fromDate: Date
  let toDate: Date
  if (req.query.epicKey) {
    const epicKey = req.query.epicKey;
    const epic = await getRepository(Issue).findOne({ key: epicKey });
    if (!epic) {
      res.status(401).json({
        error: `Could not find epic with key ${epicKey}`
      })
    }
    issues = await getRepository(Issue).find({
      parentId: epic.id
    });  
  } else if (req.query.fromDate && req.query.toDate) {
    fromDate = moment.utc(req.query.fromDate).toDate();
    toDate = moment.utc(req.query.toDate).toDate();
    const hierarchyLevel = req.query.hierarchyLevel;
    const excludeStoppedIssues = req.query.excludeStoppedIssues === "true";

    const completedIssues = await getRepository(Issue)
      .find({
        completed: MoreThan(fromDate),
        issueType: hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
        started: LessThan(toDate)
      });
    const inProgressIssues = await getRepository(Issue)
      .find({
        completed: IsNull(),
        issueType: hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
        started: LessThan(toDate)
      });
    issues = completedIssues
      .concat(inProgressIssues)
      .filter(issue => !excludeStoppedIssues || issue.statusCategory !== "To Do");
  } else {
    if (!req.query.epicKey && !req.query.fromDate && !req.query.toDate) {
      return res.status(400).json({
        error: "Required epicKey or fromDate and toDate query params"
      })
    }  
  }

  const cfdBuilder = new CfdBuilder();
  cfdBuilder.addIssues(issues);
  const rows = cfdBuilder.build(
    fromDate, toDate
  ).map(cfdRow => {
    const row = [formatDate(cfdRow.date), 0, cfdRow.total, cfdRow.done, cfdRow.inProgress];
    if (req.query.epicKey) {
      row.push(cfdRow.toDo);
    }
    return row;
  });
  const builder = new DataTableBuilder();
  const columns = [
    {
      "label": "Date",
      "type": "date"
    },
    {
      "label": "Total",
      "type": "number"
    },
    {
      "label": "Tooltip",
      "type": "number",
      "role": "tooltip"
    },
    {
      "label": "Done",
      "type": "number"
    },
    {
      "label": "In Progress",
      "type": "number"
    },
  ];
  if (req.query.epicKey) {
    columns.push({
      "label": "To Do",
      "type": "number"
    });
  }
  builder.setColumns(columns);
  builder.addRows(rows);
  res.json( {
    "chartOpts": {
      "chartArea": {
        "width": "90%",
        "height": "80%",
        "top": "5%"
      },
      "height": 300,
      "hAxis": {
        "titleTextStyle": {
          "color": "#333"
        }
      },
      "vAxis": req.query.epicKey ? {
        "minValue": 0,
        "textPosition": "none"
      } : { "minValue": 0 },
      "isStacked": true,
      "lineWidth": 1,
      "areaOpacity": 0.4,
      "legend": {
        "position": "top"
      },
      "series": {
        "0": {
          "color": "grey"
        },
        "1": {
          "color": "blue"
        },
        "2": {
          "color": "green"
        },
        "3": {
          "color": "red"
        },
        "4": {
          "color": "orange"
        }
      },
      "crosshair": {
        "trigger": "focus",
        "orientation": "vertical",
        "color": "grey"
      },
      "focusTarget": "category",
      "annotations": {
        "textStyle": {
          "color": "black"
        },
        "domain": {
          "style": "line",
          "stem": {
            "color": "red"
          }
        },
        "datum": {
          "style": "point",
          "stem": {
            "color": "black",
            "length": "12"
          }
        }
      }
    },
    "chartData": builder.build()
  });
})

router.get("/throughput", async (req, res) => {
  if (!req.query.fromDate) {
    res.status(400).json({
      error: "Required fromDate query param"
    })
  }
  if (!req.query.toDate) {
    res.status(400).json({
      error: "Required toDate query param"
    })
  }
  if (!req.query.hierarchyLevel) {
    res.status(400).json({
      error: "Required hierarchyLevel query param"
    })
  }

  const fromDate = moment.utc(req.query.fromDate).toDate();
  const toDate = moment.utc(req.query.toDate).toDate();
  const hierarchyLevel = req.query.hierarchyLevel;
  const stepInterval = StepInterval[req.query.stepInterval as string];
  const dates = dateRange(fromDate, toDate, stepInterval);
  if (moment(dates[dates.length - 1]).isBefore(toDate)) {
    dates.push(nextIntervalDate(dates[dates.length - 1], stepInterval));
  }

  const completedIssues = await getRepository(Issue)
    .find({
      where: {
        completed: Between(fromDate, toDate),
        issueType: hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
        started: Not(IsNull())
      },
      order: {
        completed: "ASC"
      }
    });

  const { rows } = dates.slice(1).reduce(({ issues, currentDate, rows }, nextDate) => {
    const group = takeWhile(issues, issue => moment(issue.completed).isBefore(nextDate));
    const count = group.length;
    const row = [formatDate(currentDate), count, moment(currentDate).format("YYYY-MM-DD")];
    return {
      issues: issues.slice(count),
      currentDate: nextDate,
      rows: rows.concat([row]),
    };
  }, { issues: completedIssues, currentDate: fromDate, rows: [] });

  const builder = new DataTableBuilder();
  builder.setColumns([
    {
      "label": "completed_time",
      "type": "date"
    },
    {
      "label": "Count",
      "type": "number"
    },
    {
      label: "date",
      type: "string",
      role: "annotationText"
    }
  ]);
  builder.addRows(rows);
  
  res.json({
    "chartOpts": {
      "seriesType": "scatter",
      "chartArea": {
        "width": "90%",
        "height": "80%",
        "top": "5%"
      },
      "legend": {
        "position": "top"
      },
      "series": {
        "0": {
          "lineWidth": 1,
          "pointSize": 4,
          "color": "indianred"
        },
        "1": {
          "type": "steppedArea",
          "color": "#f44336",
          "areaOpacity": 0,
          "lineDashStyle": [
            4,
            4
          ]
        },
        "2": {
          "type": "steppedArea",
          "color": "#ff9800",
          "areaOpacity": 0,
          "lineDashStyle": [
            4,
            4
          ]
        },
        "3": {
          "type": "steppedArea",
          "color": "#03a9f4",
          "areaOpacity": 0,
          "lineDashStyle": [
            4,
            4
          ]
        }
      },
      "vAxis": {
        "minValue": 0
      }
    },
    "chartData": builder.build(),
  })
});

router.get("/throughput/closedBetween", async (req, res) => {
  if (!req.query.fromDate) {
    res.status(400).json({
      error: "Required fromDate query param"
    })
  }

  if (!req.query.hierarchyLevel) {
    res.status(400).json({
      error: "Required hierarchyLevel query param"
    })
  }

  const fromDate = moment.utc(req.query.fromDate).toDate();
  const stepInterval = StepInterval[req.query.stepInterval as string];
  const toDate = nextIntervalDate(fromDate, stepInterval);
  const hierarchyLevel = req.query.hierarchyLevel;
  
  const completedIssues = await getRepository(Issue)
    .find({
      where: {
        completed: Between(fromDate, toDate),
        issueType: hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
        started: Not(IsNull())
      },
      order: {
        completed: "ASC"
      }
    });

  res.json({
    count: completedIssues.length,
    issues: completedIssues
  });
});

module.exports = {
  routerPath: '/charts',
  router: router
}
