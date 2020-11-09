import * as express from 'express';
const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')


router.get('/', async (req, res) => {
  const issues = await getRepository(Issue).find()
  res.json({
    count: issues.length,
    issues: issues
  })
})

router.get('/:key', async (req, res) => {
  const issue = await getRepository(Issue).findOne({ key: req.params.key});
  res.json({
    issue: issue
  });
})

module.exports = {
  routerPath: '/issues',
  router: router
}
