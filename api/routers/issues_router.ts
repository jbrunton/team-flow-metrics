import * as express from "express";
import { getRepository } from "typeorm";
import { Issue } from "../models/entities/issue";

const router = express.Router();

router.get("/", async (req, res) => {
  const issues = await getRepository(Issue).find();
  res.json({
    count: issues.length,
    issues: issues,
  });
});

router.get("/:key", async (req, res) => {
  const issue = await getRepository(Issue).findOne({ key: req.params.key });
  res.json({
    issue: issue,
  });
});

router.get("/:key/children", async (req, res) => {
  const parent = await getRepository(Issue).findOne({ key: req.params.key });
  const children = await getRepository(Issue).find({
    epicId: parent.id,
  });
  res.json({
    count: children.length,
    issues: children,
  });
});

module.exports = {
  routerPath: "/issues",
  router: router,
};
