import { Issue } from "../../../../models/entities/issue";
import { IssueFactory } from "../../../factories/issue_factory";
import { IssueCollection } from "../../../../models/scope/issue_collection";

describe("IssueCollection", () => {
  let issues: Array<Issue>;
  let collection: IssueCollection;
  let issue1: Issue, issue2: Issue, issue3: Issue, epic1: Issue;

  beforeEach(() => {
    issue1 = IssueFactory.build({ key: "STORY-101", epicKey: "EPIC-101" });
    issue2 = IssueFactory.build({ key: "STORY-102", epicKey: "EPIC-101" });
    issue3 = IssueFactory.build({ key: "STORY-103" });

    epic1 = IssueFactory.build({ key: "EPIC-101", issueType: "Epic" });

    issues = [epic1, issue1, issue2, issue3];
    collection = new IssueCollection(issues);
  });

  describe("#issues", () => {
    it("returns the issues in the collection", () => {
      expect(collection.issues).toEqual(issues);
    });
  });

  describe("#getChildrenFor", () => {
    it("returns the children for the given epic key", () => {
      expect(collection.getChildrenFor("EPIC-101")).toEqual([issue1, issue2]);
    });

    it("returns undefined if the issue has no children", () => {
      expect(collection.getChildrenFor("STORY-101")).toBeUndefined();
    });
  });

  describe("#getIssue", () => {
    it("returns the issue for the given key", () => {
      expect(collection.getIssue("STORY-101")).toEqual(issue1);
    });

    it("returns undefined if the issue does not exist", () => {
      expect(collection.getIssue("STORY-201")).toBeUndefined();
    });
  });

  describe("#getepicKeys", () => {
    it("returns a list of keys of all parent issues", () => {
      expect(collection.getepicKeys()).toEqual(["EPIC-101"]);
    });

    it("returns an empty list if there are no parent issues", () => {
      const collection = new IssueCollection([issue3]);
      expect(collection.getepicKeys()).toEqual([]);
    });
  });

  describe("#getParents", () => {
    it("returns a list of all parent issues", () => {
      expect(collection.getParents()).toEqual([epic1]);
    });
  });
});
