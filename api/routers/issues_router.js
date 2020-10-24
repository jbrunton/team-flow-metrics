const express = require('express')
const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/Issue')

router.get('/', async (req, res) => {
  const issues = await getRepository(Issue).find()
  res.json({
    issues: issues
  })
})

module.exports = {
  routerPath: '/issues',
  router: router
}
