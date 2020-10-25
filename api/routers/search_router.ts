import * as express from 'express';
import { JiraClient } from "../datasources/jira/jira_client";

const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')

router.get('/', async (req, res) => {
  const client = new JiraClient();

  const issues = await client.search('project=LIST');

  res.json({
    issues: issues
  })
})

module.exports = {
  routerPath: '/search',
  router: router
}
