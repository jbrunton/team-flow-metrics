import * as express from 'express';
import { Between, IsNull, Not } from 'typeorm';
import { HierarchyLevel } from '../models/entities/hierarchy_level';
import { DataTableBuilder } from '../models/metrics/data_table_builder';
const moment = require('moment');
const { jStat } = require('jstat');
const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')
const {formatDate} = require('../helpers/charts_helper');

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
    }
  ])
  
  builder.addRows(issues.map(issue => [
    formatDate(issue.started),
    issue.cycleTime
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

module.exports = {
  routerPath: '/charts',
  router: router
}
