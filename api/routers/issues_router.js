const express = require('express')
const router = express.Router()
const {getRepository, getMetadataArgsStorage} = require('typeorm')
const {Issue} = require('../models/entities/issue')


router.get('/', async (req, res) => {
  // console.log('metadata:', getMetadataArgsStorage()); //<- All the entities are here
  // console.log("getRepository('Issue'):", getRepository('Issue')); //<- This works
  // console.log("getRepository(Issue):", getRepository(Issue)); //<- But this will raise the error

  const issues = await getRepository(Issue).find()
  res.json({
    issues: issues
  })
})

module.exports = {
  routerPath: '/issues',
  router: router
}
