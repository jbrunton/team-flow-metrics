import { Issue } from "../entities/issue";

export class IssueCollection {
  readonly issues: Array<Issue>;
  private index: { [key: string]: Issue } = {};
  private children: { [parentKey: string]: Array<Issue> } = {};

  constructor(issues: Array<Issue>) {
    this.issues = issues;
    for (let issue of issues) {
      this.index[issue.key] = issue;
    }
    for (let issue of issues) {
      const parentKey = issue.parentKey
      if (parentKey) {
        if (!this.children[parentKey]) {
          this.children[parentKey] = [];
        }

        this.children[parentKey].push(issue);
      }
    }
  }

  getChildrenFor(parentKey: string): Array<Issue> {
    return this.children[parentKey];
  }

  getIssue(key: string): Issue {
    return this.index[key];
  }

  getParentKeys(): Array<string> {
    return Object.keys(this.children);
  }

  getParents(): Array<Issue> {
    return this.getParentKeys()
      .map(parentKey => this.index[parentKey])
      .filter(parent => parent);
  }
}
