import axios from "axios";
import {
  Issue,
  SerializedIssue,
  TransitionsTransformer
} from "metrics-api/models/types";
import { pick } from "lodash";
import { parseDate } from "@/helpers/date_helper";

const parseIssue = (json: SerializedIssue): Issue => {
  return Object.assign(
    pick(json, [
      "id",
      "key",
      "title",
      "issueType",
      "status",
      "statusCategory",
      "resolution",
      "hierarchyLevel",
      "externalUrl",
      "epicKey",
      "epicId",
      "childCount",
      "percentDone",
      "cycleTime"
    ]),
    {
      created: parseDate(json.created),
      started: parseDate(json.started),
      completed: parseDate(json.completed),
      lastTransition: parseDate(json.lastTransition),
      transitions: TransitionsTransformer.from(json.transitions)
    }
  );
};

export const fetchIssues = async (): Promise<Issue[]> => {
  const response = await axios.get(`/api/issues`);
  return response.data.issues.map(parseIssue);
};

export const fetchIssueDetails = async (key: string): Promise<Issue> => {
  const response = await axios.get(`/api/issues/${key}`);
  return parseIssue(response.data.issue);
};

export const fetchIssueChildren = async (key: string): Promise<Issue[]> => {
  const response = await axios.get(`/api/issues/${key}/children`);
  return response.data.issues.map(parseIssue);
};
