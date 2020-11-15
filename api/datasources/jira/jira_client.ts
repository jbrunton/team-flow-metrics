import { Client } from "jira.js";
import { Issue } from "../../models/entities/issue";
import { Field } from "../../models/entities/field";
import { getConnection } from "typeorm";
import { IssueAttributesBuilder } from "./issue_attributes_builder";
import { HierarchyLevel } from "../../models/entities/hierarchy_level";
import { Status } from "../../models/entities/status";

export class JiraClient {
  _client: Client

  constructor() {
    console.log(`Creating client for host ${process.env.JIRA_HOST}, user ${process.env.JIRA_USER}`);
    this._client = new Client({
      host: process.env.JIRA_HOST,
      authentication: {
        basic: {
          username: process.env.JIRA_USER,
          apiToken: process.env.JIRA_TOKEN
        }
      }
    })
  }

  async search(fields: Array<Field>, statuses: Array<Status>, hierarchyLevels: Array<HierarchyLevel>, jql: string): Promise<Array<Issue>> {
    console.log(`starting search: ${jql}`)
    console.time(`search: ${jql}`)
    const connection = getConnection();
    const repo = connection.getRepository(Issue);

    const results = [];
    console.log('fetching page 1');
    let result = await this._client.issueSearch.searchForIssuesUsingJqlPost({ jql, expand: ['changelog'] })
    results.push(result);

    const pages = Math.ceil(result.total / result.maxResults);

    while (result.startAt + result.maxResults < result.total) {
      const page = result.startAt / result.maxResults + 2;
      console.log(`fetching page ${page} of ${pages}`);
      result = await this._client.issueSearch.searchForIssuesUsingJqlPost({ jql, expand: ['changelog'], startAt: result.startAt + result.maxResults })
      results.push(result);
    }

    const issues = [];
    const builder = new IssueAttributesBuilder(fields, statuses, hierarchyLevels);

    results.forEach(result => {
      result.issues.forEach(issue => {
        issues.push(repo.create(builder.build(issue)))
      });
    })

    console.timeEnd(`search: ${jql}`)
    return issues;
  }

  async getFields(): Promise<Array<Field>> {
    console.log("Fetching Jira fields");
    const connection = getConnection();
    const repo = connection.getRepository(Field);
    const fields = await this._client.issueFields.getFields();
    return fields.map(field => repo.create({
      externalId: field["id"],
      name: field["name"]
    }));
  }

  async getStatuses(): Promise<Array<Status>> {
    console.log("Fetching Jira statuses");
    const connection = getConnection();
    const repo = connection.getRepository(Status);
    const statuses = await this._client.workflowStatuses.getAllStatuses();
    return statuses.map(status => repo.create({
      name: status["name"],
      category: status["statusCategory"]["name"],
      externalId: status["id"]
    }));
  }
}
