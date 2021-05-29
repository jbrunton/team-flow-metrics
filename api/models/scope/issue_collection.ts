import { Issue } from "../entities/issue";

export class IssueCollection {
  readonly issues: Array<Issue>;
  private index: { [key: string]: Issue } = {};
  private children: { [epicKey: string]: Array<Issue> } = {};

  constructor(issues: Array<Issue>) {
    this.issues = issues;
    for (const issue of issues) {
      this.index[issue.key] = issue;
    }
    for (const issue of issues) {
      const epicKey = issue.epicKey;
      if (epicKey) {
        if (!this.children[epicKey]) {
          this.children[epicKey] = [];
        }

        this.children[epicKey].push(issue);
      }
    }
  }

  getChildrenFor(epicKey: string): Array<Issue> {
    return this.children[epicKey];
  }

  getIssue(key: string): Issue {
    return this.index[key];
  }

  getEpicKeys(): Array<string> {
    return Object.keys(this.children);
  }

  getParents(): Array<Issue> {
    return this.getEpicKeys()
      .map((epicKey) => this.index[epicKey])
      .filter((parent) => parent);
  }
}
