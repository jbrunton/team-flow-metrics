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
  const issue = await getRepository(Issue).findOne({ key: req.params.key });
  res.json({
    issue: issue
  });
})

router.get('/:key/children', async (req, res) => {
  const parent = await getRepository(Issue).findOne({ key: req.params.key });
  const children = await getRepository(Issue).find({
    epicId: parent.id
  });
  res.json({
    count: children.length,
    issues: children
  });
})

module.exports = {
  routerPath: '/issues',
  router: router
}
