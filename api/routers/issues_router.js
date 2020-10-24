const express = require('express')
const router = express.Router()
const {createConnection} = require('typeorm')
const {Issue} = require('../models/entities/Issue')

router.get('/', async (req, res) => {
  const connection = await createConnection()
  const issueRepository = connection.getRepository(Issue)
  const issues = await issueRepository.find()
  res.json({
    issues: issues
  })
  await connection.close()

  // res.json({
  //   issues: [
  //     { key: 'DEMO-101', title: 'Demo Issue 101' },
  //     { key: 'DEMO-102', title: 'Demo Issue 102' }
  //   ]
  // })
})

module.exports = {
  routerPath: '/issues',
  router: router
}
