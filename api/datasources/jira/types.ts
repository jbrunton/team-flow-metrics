import { SupportOptionRange } from "prettier";

export type JiraIssue = {
  key: string;
  fields: {
    summary: string;
    issuetype: {
      name: string;
    };
    status: JiraStatus;
    created: string;
    resolution: {
      name: string;
    };
  };
  changelog: {
    histories: {
      items: JiraStatusChange[];
      created: string;
    }[];
  };
};

export type JiraSearchResult = {
  issues: JiraIssue[];
  startAt: number;
  total: number;
  maxResults: number;
};

export type JiraField = {
  id: string;
  name: string;
};

export type JiraStatus = {
  id: string;
  name: string;
  statusCategory: {
    name: string;
  };
};

export type JiraStatusChange = {
  field: string;
  from: string;
  fromString: string;
  to: string;
  toString: string;
};
