import * as express from 'express';
const moment = require('moment');
const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')

function formatDate(date: Date): string {
  return `Date${moment(date).format("(YYYY, M, D, h, m)")}`;
}

router.get('/scatterplot', async (req, res) => {
  let issues = await getRepository(Issue).find()
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
