import * as express from 'express';
import { Client } from "jira.js";

const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')

router.get('/', async (req, res) => {
  const client = new Client({
    host: "https://jbrunton.atlassian.net",
    authentication: {
      basic: {
        username: process.env.JIRA_USER,
        apiToken: process.env.JIRA_TOKEN
      }
    }
  });

  const issues = await client.issueSearch.searchForIssuesUsingJqlPost({
    jql: 'project=LIST'
  })

  res.json({
    issues: issues
  })
})

module.exports = {
  routerPath: '/search',
  router: router
}
