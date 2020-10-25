import { Client } from "jira.js";
import { Issue } from "../../models/entities/issue";
import { getConnection } from "typeorm";

export class JiraClient {
  _client: Client

  constructor() {
    this._client = new Client({
      host: "https://jbrunton.atlassian.net",
      authentication: {
        basic: {
          username: process.env.JIRA_USER,
          apiToken: process.env.JIRA_TOKEN
        }
      }
    })
  }

  async search(jql: string): Promise<Array<Issue>> {
    const connection = getConnection();
    const repo = connection.getRepository(Issue);
    const jiraIssues = await this._client.issueSearch.searchForIssuesUsingJqlPost({ jql: jql })
    return jiraIssues.issues.map(issue => repo.create({ key: issue.key, title: issue.fields.summary }))
    //return jiraIssues;
    //return [repo.create({ key: 'DEMO-101', title: 'Demo 101' })];
  }
}
