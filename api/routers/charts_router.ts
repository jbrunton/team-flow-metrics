import * as express from 'express';
import { Between, IsNull, Not } from 'typeorm';
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
  
  const fromDate = moment(req.query.fromDate).toDate();
  const toDate = moment(req.query.toDate).toDate();
  const issues = await getRepository(Issue)
    .find({
      completed: Between(fromDate, toDate),
      issueType: Not("Epic"),
      started: Not(IsNull())
    })
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
    },
    height: 500
  };
  const cols = [
    {
      label: "completed_time",
      type: "date"
    },
    {
      label: "cycle_time",
      type: "number"
    },
    {
      "label": "95th percentile",
      "type": "number"
    },
    {
      "label": "85th percentile",
      "type": "number"
    },
    {
      "label": "70th percentile",
      "type": "number"
    },
    {
      "label": "50th percentile",
      "type": "number"
    }
  ];
  const rows = issues
    .map(issue => {
      return {
        c: [
          { v: formatDate(issue.started) },
          { v: issue.cycleTime },
          { v: null },
          { v: null },
          { v: null },
          { v: null }
        ]
      };
    })
  
  const percentiles = {
    50: jStat.percentile(issues.map(issue => issue.cycleTime), 0.5),
    70: jStat.percentile(issues.map(issue => issue.cycleTime), 0.7),
    85: jStat.percentile(issues.map(issue => issue.cycleTime), 0.85),
    95: jStat.percentile(issues.map(issue => issue.cycleTime), 0.95)
  };

  rows.push({
    c: [
      { v: formatDate(fromDate) },
      { v: null },
      { v: percentiles[95] },
      { v: percentiles[85] },
      { v: percentiles[70] },
      { v: percentiles[50] },
    ]
  })
  rows.push({
    c: [
      { v: formatDate(toDate) },
      { v: null },
      { v: percentiles[95] },
      { v: percentiles[85] },
      { v: percentiles[70] },
      { v: percentiles[50] },
    ]
  })

  res.json({
    meta: {
      issueCount: rows.length,
      percentiles: percentiles
    },
    chartOpts: chartOpts,
    chartData: {
      cols: cols,
      rows: rows
    }
  })
})

module.exports = {
  routerPath: '/charts',
  router: router
}
