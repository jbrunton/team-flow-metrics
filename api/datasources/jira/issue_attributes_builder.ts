export class IssueAttributesBuilder {
  build(json: JSON): { key: string, title: string } {
    return {
      key: json["key"],
      title: json["fields"]["summary"]
    };
  }
}
