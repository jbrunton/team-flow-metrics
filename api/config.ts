import * as fs from "fs";

export type MetricsConfig = {
  jira: {
    host: string;
    credentials: {
      username: string;
      token: string;
    };
    query: string;
  };
};

const configPath = "./metrics.config.js";
if (!fs.existsSync(configPath)) {
  throw `Error: could not find configuration file ${configPath}`;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(configPath) as MetricsConfig;
export default config;
