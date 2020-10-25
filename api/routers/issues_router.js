const express = require('express')
const router = express.Router()
const {getRepository, getMetadataArgsStorage} = require('typeorm')
const {Issue} = require('../models/entities/issue')


router.get('/', async (req, res) => {
  let issues = await getRepository(Issue).find()

  if (issues.length == 0) {
    await getRepository(Issue).save({ key: 'DEMO-101', title: 'Demo Issue 101' });
    await getRepository(Issue).save({ key: 'DEMO-102', title: 'Demo Issue 102' });
    issues = await getRepository(Issue).find()
  }

  res.json({
    issues: issues
  })
})

module.exports = {
  routerPath: '/issues',
  router: router
}
