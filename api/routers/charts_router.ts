import * as express from 'express';
import { Between, IsNull, Not } from 'typeorm';
import { HierarchyLevel } from '../models/entities/hierarchy_level';
import { DataTableBuilder } from '../models/metrics/data_table_builder';
const moment = require('moment');
const { jStat } = require('jstat');
const router = express.Router()
const { getRepository } = require('typeorm')
const { Issue } = require('../models/entities/issue')
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
  if (!req.query.epicKey) {
    res.status(400).json({
      error: "Required epicKey query param"
    })
  }
  const epicKey = req.query.epicKey;
  const epic = await getRepository(Issue).findOne({ key: epicKey });
  if (!epic) {
    res.status(401).json({
      error: `Could not find epic with key ${epicKey}`
    })
  }
  const issues = await getRepository(Issue).find({
    parentId: epic.id
  });
  const total = issues.length;
  const rows = issues
    .map(issue => {
      const transitions: { date: Date, fromCategory?: string, toCategory: string }[] = [{ date: issue.created, toCategory: "To Do"}];
      if (issue.started) {
        transitions.push({
          date: issue.started,
          fromCategory: "To Do",
          toCategory: "In Progress"
        })
      }
      if (issue.completed) {
        transitions.push({
          date: issue.completed,
          fromCategory: issue.started ? "In Progress" : "To Do",
          toCategory: "Done"
        })
      }
      return transitions;
    })
    .flat()
    .sort((t1, t2) => moment(t1.date).diff(moment(t2.date)))
    .reduce((rows, transition) => {
      const prev = rows.length ? rows[rows.length - 1] : [0, 0, 0, 0, 0, total];
      const date = formatDate(transition.date);
      const change = [date, 0, prev[2], prev[3], prev[4], prev[5]];
      if (transition.fromCategory) {
        switch (transition.fromCategory) {
          case "To Do":
            --change[5];
            break;
          case "In Progress":
            --change[4];
            break;
          case "Done":
            --change[3];
            break;
        }
      }
      switch (transition.toCategory) {
        case "To Do":
          ++change[5];
          break;
        case "In Progress":
          ++change[4];
          break;
        case "Done":
          ++change[3];
          break;
      }
      return rows.concat([change]);
    }, []);
  console.log("transitions:", rows);
  const builder = new DataTableBuilder();
  builder.setColumns([
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
    {
      "label": "To Do",
      "type": "number"
    }
  ]);
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
      "vAxis": {
        "minValue": 0,
        "textPosition": "none"
      },
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

module.exports = {
  routerPath: '/charts',
  router: router
}
