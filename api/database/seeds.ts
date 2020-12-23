import "reflect-metadata";
import { createConnection } from "typeorm";
import { Issue } from "../models/entities/issue";

createConnection()
  .then(async (connection) => {
    const issue = new Issue();
    issue.key = "DEMO-101";
    issue.title = "Demo Issue 101";
    await connection.manager.save(issue);
  })
  .catch((error) => console.log(error));
