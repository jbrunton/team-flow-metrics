import * as express from 'express';
const moment = require('moment');
const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')
const {formatDate} = require('../helpers/charts_helper');

router.get('/scatterplot', async (req, res) => {
  let issues = await getRepository(Issue).find()
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
