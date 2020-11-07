import * as express from 'express';
import { JiraClient } from "../datasources/jira/jira_client";
import { Field } from '../models/entities/field';

const router = express.Router()
const {getRepository} = require('typeorm')
const {Issue} = require('../models/entities/issue')

router.get('/', async (req, res) => {
  const client = new JiraClient();
  const issuesRepo = getRepository(Issue);
  const fieldsRepo = getRepository(Field);

  const fields = await client.getFields();
  const issues = await client.search(fields, 'project=LIST');

  await issuesRepo.clear();
  await fieldsRepo.clear();

  await fieldsRepo.save(fields);
  await issuesRepo.save(issues);

  for (let issue of issues) {
    if (issue.parentKey) {
      const parent = issues.find(candidate => candidate.key == issue.parentKey)
      if (parent) {
        console.log(`Found parent ${parent.key} for issue ${issue.key}`);
        issue.parentId = parent.id;
        parent.childCount = (parent.childCount || 0) + 1;
      } else {
        console.warn(`Could not find parent ${issue.parentKey} for issue ${issue.key}`);
      }
    }
  }
  await issuesRepo.save(issues);

  res.json({
    count: issues.length,
    issues: issues
  })
})

module.exports = {
  routerPath: '/sync',
  router: router
}
