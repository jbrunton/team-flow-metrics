import * as express from 'express';
import { JiraClient } from "../datasources/jira/jira_client";

const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')

router.get('/', async (req, res) => {
  const client = new JiraClient();
  const repo = getRepository(Issue);

  const issues = await client.search('project=LIST');

  await repo.clear();
  await repo.save(issues);

  res.json({
    count: issues.length,
    issues: issues
  })
})

module.exports = {
  routerPath: '/sync',
  router: router
}
