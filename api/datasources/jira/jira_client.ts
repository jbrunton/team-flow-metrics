import { Version2Client } from "jira.js";
import { asyncify, mapLimit } from "async";
import { Issue } from "../../models/entities/issue";
import { Field } from "../../models/entities/field";
import { getConnection } from "typeorm";
import { IssueAttributesBuilder } from "./issue_attributes_builder";
import { Status } from "../../models/entities/status";
import { JiraSearchResult } from "./types";
import config from "../../config";
import { range, reduce } from "lodash";

export class JiraClient {
  _client: Version2Client;

  constructor() {
    console.log(
      `Creating client for host ${config.jira.host}, user ${config.jira.credentials.username}`
    );
    this._client = new Version2Client({
      host: config.jira.host,
      authentication: {
        basic: {
          email: config.jira.credentials.username,
          apiToken: config.jira.credentials.token,
        },
      },
    });
  }

  async search(
    jql: string,
    builder: IssueAttributesBuilder
  ): Promise<Array<Issue>> {
    const client = this._client;
    console.log(`starting search: ${jql}`);
    console.time(`search: ${jql}`);
    const connection = getConnection();
    const repo = connection.getRepository(Issue);
    const searchParams = {
      jql,
      expand: ["changelog"],
      fields: [
        "key",
        "summary",
        "issuetype",
        "status",
        "resolution",
        "created",
        builder.epicLinkFieldId,
      ],
    };

    console.log("fetching page 1");
    const firstResult = await client.issueSearch.searchForIssuesUsingJqlPost(
      searchParams
    );

    const pageCount = Math.ceil(firstResult.total / firstResult.maxResults);

    const remainingResults = await mapLimit(
      range(1, pageCount),
      5,
      asyncify((pageIndex: number) => {
        console.log(`fetching page ${pageIndex + 1} of ${pageCount}`);
        return client.issueSearch.searchForIssuesUsingJqlPost({
          ...searchParams,
          startAt: pageIndex * firstResult.maxResults,
        });
      })
    );

    const results = [firstResult, ...remainingResults];

    const issues = reduce(
      results,
      (issues: Issue[], result: JiraSearchResult) => {
        return issues.concat(
          result.issues.map((json) => {
            const issue = builder.build(json);
            return repo.create(issue);
          })
        );
      },
      []
    );

    console.timeEnd(`search: ${jql}`);
    console.log(`${issues.length} issues found`);
    return issues;
  }

  async getFields(): Promise<Array<Field>> {
    console.log("Fetching Jira fields");
    const connection = getConnection();
    const repo = connection.getRepository(Field);
    const fields = await this._client.issueFields.getFields();
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
    const statuses = await this._client.workflowStatuses.getStatuses();
    return statuses.map((status) =>
      repo.create({
        name: status.name,
        category: status.statusCategory.name,
        externalId: status.id,
      })
    );
  }
}
