import { Client } from "jira.js";
import { Issue } from "../../models/entities/issue";
import { Field } from "../../models/entities/field";
import { getConnection } from "typeorm";
import { IssueAttributesBuilder } from "./issue_attributes_builder";
import { HierarchyLevel } from "../../models/entities/hierarchy_level";
import { Status } from "../../models/entities/status";
import { JiraField, JiraSearchResult, JiraStatus } from "./types";
import config from "../../config";

export class JiraClient {
  _client: Client;

  constructor() {
    const jiraConfig = config.jira;
    console.log(
      `Creating client for host ${config.jira.host}, user ${config.jira.credentials.username}`
    );
    this._client = new Client({
      host: config.jira.host,
      authentication: {
        basic: {
          username: config.jira.credentials.username,
          apiToken: config.jira.credentials.token,
        },
      },
    });
  }

  async search(
    fields: Array<Field>,
    statuses: Array<Status>,
    hierarchyLevels: Array<HierarchyLevel>,
    jql: string
  ): Promise<Array<Issue>> {
    console.log(`starting search: ${jql}`);
    console.time(`search: ${jql}`);
    const connection = getConnection();
    const repo = connection.getRepository(Issue);

    const results: JiraSearchResult[] = [];
    console.log("fetching page 1");
    let result = (await this._client.issueSearch.searchForIssuesUsingJqlPost({
      jql,
      expand: ["changelog"],
    })) as JiraSearchResult;
    results.push(result);

    const pages = Math.ceil(result.total / result.maxResults);

    while (result.startAt + result.maxResults < result.total) {
      const page = result.startAt / result.maxResults + 2;
      console.log(`fetching page ${page} of ${pages}`);
      result = (await this._client.issueSearch.searchForIssuesUsingJqlPost({
        jql,
        expand: ["changelog"],
        startAt: result.startAt + result.maxResults,
      })) as JiraSearchResult;
      results.push(result);
    }

    const issues: Issue[] = [];
    const builder = new IssueAttributesBuilder(
      fields,
      statuses,
      hierarchyLevels
    );

    results.forEach((result) => {
      result.issues.forEach((issue) => {
        issues.push(repo.create(builder.build(issue)));
      });
    });

    console.timeEnd(`search: ${jql}`);
    return issues;
  }

  async getFields(): Promise<Array<Field>> {
    console.log("Fetching Jira fields");
    const connection = getConnection();
    const repo = connection.getRepository(Field);
    const fields = (await this._client.issueFields.getFields()) as JiraField[];
    return fields.map((field) =>
      repo.create({
        externalId: field.id,
        name: field.name,
      })
    );
  }

  async getStatuses(): Promise<Array<Status>> {
    console.log("Fetching Jira statuses");
    const connection = getConnection();
    const repo = connection.getRepository(Status);
    const statuses = (await this._client.workflowStatuses.getAllStatuses()) as JiraStatus[];
    return statuses.map((status) =>
      repo.create({
        name: status.name,
        category: status.statusCategory.name,
        externalId: status.id,
      })
    );
  }
}
