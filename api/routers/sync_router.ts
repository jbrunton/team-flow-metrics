import * as express from 'express';
import { JiraClient } from "../datasources/jira/jira_client";
import { Field } from '../models/entities/field';
import { Issue } from '../models/entities/issue';
import { IssueCollection } from '../models/scope/issue_collection';

const router = express.Router()
const {getRepository} = require('typeorm')

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

  const issueCollection = new IssueCollection(issues);

  for (let parentKey of issueCollection.getParentKeys()) {
    const parent = issueCollection.getIssue(parentKey);
    const children = issueCollection.getChildrenFor(parentKey);
    if (parent) {
      parent.childCount = children.length;
      for (let child of children) {
        child.parentId = parent.id;
      }
    } else {
      const childKeys = children.map(issue => issue.key)
      console.warn(`Could not find parent ${parentKey} for issues [${childKeys.join(", ")}]`);
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
