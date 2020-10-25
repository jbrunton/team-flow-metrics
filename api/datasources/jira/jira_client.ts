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
    console.log(`starting search: ${jql}`)
    console.time(`search: ${jql}`)
    const connection = getConnection();
    const repo = connection.getRepository(Issue);

    const results = [];
    console.log('fetching page 1');
    let result = await this._client.issueSearch.searchForIssuesUsingJqlPost({ jql: jql })
    results.push(result);

    const pages = Math.ceil(result.total / result.maxResults);

    while (result.startAt + result.maxResults < result.total) {
      const page = result.startAt / result.maxResults + 2;
      console.log(`fetching page ${page} of ${pages}`);
      result = await this._client.issueSearch.searchForIssuesUsingJqlPost({ jql, startAt: result.startAt + result.maxResults })
      results.push(result);
    }

    const issues = [];

    results.forEach(result => {
      result.issues.forEach(issue => {
        issues.push(repo.create({ key: issue.key, title: issue.fields.summary }))
      });
    })

    console.timeEnd(`search: ${jql}`)
    return issues;
  }
}
