const { IssueAttributesBuilder } = require('../../../../datasources/jira/issue_attributes_builder');
const { getRepository } = require('typeorm');
const { Field } = require('../../../../models/entities/field');

describe('IssueAttributesBuilder', () => {

  it('parses basic fields', () => {
    const json = {
      key: 'DEMO-101',
      fields: {
        summary: "Demo Issue 101",
        issuetype: {
          name: 'Story'
        },
        status: {
          name: "Backlog",
          statusCategory: {
            name: "To Do"
          }
        }
      },
      changelog: {
        histories: []
      }
    };

    const issue = new IssueAttributesBuilder([]).build(json);

    expect(issue.key).toEqual('DEMO-101');
    expect(issue.title).toEqual('Demo Issue 101');
    expect(issue.issueType).toEqual('Story');
    expect(issue.status).toEqual('Backlog');
    expect(issue.statusCategory).toEqual('To Do');
    expect(issue.externalUrl).toEqual('https://jira.example.com/browse/DEMO-101');
  })

  describe("#parentKey", () => {
    it("sets the parent epic key", () => {
      const epicLinkField = new Field();
      epicLinkField.externalId = "customfield_10001";
      epicLinkField.name = "Epic Link";
      const fields = [epicLinkField];
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101",
          issuetype: {
            name: 'Story'
          },
          status: {
            name: "Backlog",
            statusCategory: {
              name: "To Do"
            }
          },
          customfield_10001: "DEMO-102"
        },
        changelog: {
          histories: []
        }
      };
  
      const issue = new IssueAttributesBuilder(fields).build(json);
  
      expect(issue.parentKey).toEqual('DEMO-102');
    });
  })

  describe('#started', () => {
    it('is null if not started', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101",
          issuetype: {
            name: 'Story'
          },
          status: {
            name: "Backlog",
            statusCategory: {
              name: "To Do"
            }
          }
        },
        changelog: {
          histories: []
        }
      };
  
      const issue = new IssueAttributesBuilder([]).build(json);
  
      expect(issue.started).toBeNull();
    })

    it('is the date of the first in progress status change', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101",
          issuetype: {
            name: 'Story'
          },
          status: {
            name: "Backlog",
            statusCategory: {
              name: "To Do"
            }
          }
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
  
      const issue = new IssueAttributesBuilder([]).build(json);
  
      expect(issue.started).toEqual(new Date("2020-01-02T09:00:00.000Z"))
    })

    it('ignores events without status changes', () => {
      // Note: this test includes two events in order to test the sort function
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101",
          issuetype: {
            name: 'Story'
          },
          status: {
            name: "Backlog",
            statusCategory: {
              name: "To Do"
            }
          }
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
  
      const issue = new IssueAttributesBuilder([]).build(json);
  
      expect(issue.started).toBeNull();
    })
  })

  describe('#completed', () => {
    it('is null if not completed', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101",
          issuetype: {
            name: 'Story'
          },
          status: {
            name: "Backlog",
            statusCategory: {
              name: "To Do"
            }
          }
        },
        changelog: {
          histories: []
        }
      };
  
      const issue = new IssueAttributesBuilder([]).build(json);
  
      expect(issue.completed).toBeNull();
    })

    it('is the date of the last in progress status change', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101",
          issuetype: {
            name: 'Story'
          },
          status: {
            name: "Backlog",
            statusCategory: {
              name: "To Do"
            }
          }
        },
        changelog: {
          histories: [
            {
              created: "2020-01-02T10:00:00.000+0100",
              items: [
                {
                  "field": "status",
                  "fromString": "In Progress",
                  "toString": "Done"
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
            },
            {
              created: "2020-01-01T10:00:00.000+0100",
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
  
      const issue = new IssueAttributesBuilder([]).build(json);
  
      expect(issue.completed).toEqual(new Date("2020-01-03T09:00:00.000Z"))
    })

    it('is null if the issue was reopened', () => {
      const json = {
        key: 'DEMO-101',
        fields: {
          summary: "Demo Issue 101",
          issuetype: {
            name: 'Story'
          },
          status: {
            name: "Backlog",
            statusCategory: {
              name: "To Do"
            }
          }
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
  
      const issue = new IssueAttributesBuilder([]).build(json);
  
      expect(issue.completed).toBeNull()
    })
  })
});
