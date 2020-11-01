import * as express from 'express';
const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')


router.get('/', async (req, res) => {
  let issues = await getRepository(Issue).find()
  res.json({
    count: issues.length,
    issues: issues
  })
})

module.exports = {
  routerPath: '/issues',
  router: router
}
