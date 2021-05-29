import * as fs from "fs";
import { Repository } from "typeorm";
import { Field } from "./models/entities/field";
import { Issue } from "./models/entities/issue";
import { Status } from "./models/entities/status";
import { IssueCollection } from "./models/scope/issue_collection";

export type Callbacks<T, Collection = T[]> = {
  beforeSave?: (records: Collection, repo: Repository<T>) => void;
};

export type IssueCallbacks = Callbacks<Issue, IssueCollection>;

export type MetricsConfig = {
  jira: {
    host: string;
    credentials: {
      username: string;
      token: string;
    };
    query: string;
  };
  sync: {
    statuses?: Callbacks<Status>;
    fields?: Callbacks<Field>;
    issues?: IssueCallbacks;
  };
};

const configPath = "./metrics.config.js";
if (!fs.existsSync(configPath)) {
  throw `Error: could not find configuration file ${configPath}`;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(configPath) as MetricsConfig;
export default config;
