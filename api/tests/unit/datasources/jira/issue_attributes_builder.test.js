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
});
