import { Issue } from "../../../../models/entities/issue"
import { IssueCollection } from "../../../../models/scope/issue_collection";

describe("IssueCollection", () => {
  let issues: Array<Issue>
  let collection: IssueCollection
  let issue1, issue2, issue3, epic1: Issue

  beforeEach(() => {
    epic1 = new Issue();
    epic1.key = "EPIC-101";

    issue1 = new Issue();
    issue1.key = "DEMO-101";
    issue1.parentKey = "EPIC-101";
    
    issue2 = new Issue();
    issue2.key = "DEMO-102";
    issue2.parentKey = "EPIC-101";

    issue3 = new Issue();
    issue3.key = "DEMO-103";

    issues = [epic1, issue1, issue2, issue3];
    collection = new IssueCollection(issues);
  })

  describe("#issues", () => {
    it("returns the issues in the collection", () => {
      expect(collection.issues).toEqual(issues);
    })
  })

  describe("#getChildrenFor", () => {
    it("returns the children for the given epic key", () => {
      expect(collection.getChildrenFor("EPIC-101")).toEqual([issue1, issue2])
    })

    it("returns undefined if the issue has no children", () => {
      expect(collection.getChildrenFor("DEMO-101")).toBeUndefined();
    })
  })

  describe("#getIssue", () => {
    it("returns the issue for the given key", () => {
      expect(collection.getIssue("DEMO-101")).toEqual(issue1);
    })

    it("returns undefined if the issue does not exist", () => {
      expect(collection.getIssue("DEMO-201")).toBeUndefined();
    })
  })

  describe("#getParentKeys", () => {
    it("returns a list of keys of all parent issues", () => {
      expect(collection.getParentKeys()).toEqual(["EPIC-101"]);
    })

    it("returns an empty list if there are no parent issues", () => {
      const collection = new IssueCollection([issue3]);
      expect(collection.getParentKeys()).toEqual([]);
    })
  })

  describe("#getParents", () => {
    it("returns a list of all parent issues", () => {
      expect(collection.getParents()).toEqual([epic1]);
    })
  })
})