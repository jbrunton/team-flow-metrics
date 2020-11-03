import * as express from 'express';
import { Between, Not } from 'typeorm';
const moment = require('moment');
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
  
  const fromDate = moment(req.query.fromDate);
  const toDate = moment(req.query.toDate);
  let issues = await getRepository(Issue).find({
    completed: Between(fromDate, toDate),
    issueType: Not("Epic")
  })
  const chartOpts = {
    seriesType: "scatter",
    interpolateNulls: true,
    series: {
      1: {
        type: "steppedArea",
        color: "#f44336",
        areaOpacity: 0
      },
      2: {
        type: "steppedArea",
        color: "#f44336",
        areaOpacity: 0,
        lineDashStyle: [
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
    }
  ];
  const rows = issues
    .filter(issue => issue.started && issue.completed)
    .map(issue => {
      return {
        c: [
          { v: formatDate(issue.started) },
          { v: issue.cycleTime }
        ]
      };
    })
  res.json({
    meta: {
      issueCount: rows.length
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
