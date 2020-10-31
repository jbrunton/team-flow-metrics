const { IssueAttributesBuilder } = require('../../../../datasources/jira/issue_attributes_builder');

describe('IssueAttributesBuilder', () => {

  it('parses basic fields', () => {
    const json = {
      key: 'DEMO-101',
      fields: {
        summary: "Demo Issue 101"
      },
      changelog: {
        histories: []
      }
    };

    const issue = new IssueAttributesBuilder().build(json);

    expect(issue.key).toEqual('DEMO-101');
    expect(issue.title).toEqual('Demo Issue 101');
  })

  describe('#started', () => {
    it('is null if not started', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101"
        },
        changelog: {
          histories: []
        }
      };
  
      const issue = new IssueAttributesBuilder().build(json);
  
      expect(issue.started).toBeNull();
    })

    it('is the date of the first in progress status change', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101"
        },
        changelog: {
          histories: [
            {
              created: "2020-01-01T10:00:00.000+0100",
              items: [
                {
                  "field": "Sprint",
                  "fromString": "",
                  "toString": "Sprint 10"
                }
              ]
            },
            {
              created: "2020-01-02T10:00:00.000+0100",
              items: [
                {
                  "field": "status",
                  "fromString": "To Do",
                  "toString": "In Progress"
                }
              ]
            }
          ]
        }
      };
  
      const issue = new IssueAttributesBuilder().build(json);
  
      expect(issue.started).toEqual(new Date("2020-01-02T09:00:00.000Z"))
    })

    it('ignores events without status changes', () => {
      // Note: this test includes two events in order to test the sort function
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101"
        },
        changelog: {
          histories: [
            {
              created: "2020-01-01T10:00:00.000+0100",
              items: [
                {
                  "field": "Sprint",
                  "fromString": "",
                  "toString": "Sprint 10"
                }
              ]
            },
            {
              created: "2020-01-01T10:00:00.000+0100",
              items: [
                {
                  "field": "Sprint",
                  "fromString": "Sprint 10",
                  "toString": "Sprint 11"
                }
              ]
            }
          ]
        }
      };
  
      const issue = new IssueAttributesBuilder().build(json);
  
      expect(issue.started).toBeNull();
    })
  })

  describe('#completed', () => {
    it('is null if not completed', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101"
        },
        changelog: {
          histories: [
            {
              created: "2020-01-01T10:00:00.000+0100",
              items: [
                {
                  "field": "Sprint",
                  "fromString": "",
                  "toString": "Sprint 10"
                }
              ]
            }
          ]
        }
      };
  
      const issue = new IssueAttributesBuilder().build(json);
  
      expect(issue.completed).toBeNull();
    })

    it('is the date of the last in progress status change', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101"
        },
        changelog: {
          histories: [
            {
              created: "2020-01-01T10:00:00.000+0100",
              items: [
                {
                  "field": "status",
                  "fromString": "In Progress",
                  "toString": "Done"
                }
              ]
            },
            {
              created: "2020-01-02T10:00:00.000+0100",
              items: [
                {
                  "field": "status",
                  "fromString": "Done",
                  "toString": "In Progress"
                }
              ]
            },
            {
              created: "2020-01-03T10:00:00.000+0100",
              items: [
                {
                  "field": "status",
                  "fromString": "In Progress",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      };
  
      const issue = new IssueAttributesBuilder().build(json);
  
      expect(issue.completed).toEqual(new Date("2020-01-03T09:00:00.000Z"))
    })

    it('is null if the issue was reopened', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101"
        },
        changelog: {
          histories: [
            {
              created: "2020-01-01T10:00:00.000+0100",
              items: [
                {
                  "field": "status",
                  "fromString": "In Progress",
                  "toString": "Done"
                }
              ]
            },
            {
              created: "2020-01-02T10:00:00.000+0100",
              items: [
                {
                  "field": "status",
                  "fromString": "Done",
                  "toString": "In Progress"
                }
              ]
            }
          ]
        }
      };
  
      const issue = new IssueAttributesBuilder().build(json);
  
      expect(issue.completed).toBeNull()
    })
  })
});
