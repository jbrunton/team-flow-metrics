import * as express from "express";
import { Field } from "../models/entities/field";
import { HierarchyLevel } from "../models/entities/hierarchy_level";
import { Status } from "../models/entities/status";
import { RouterDefinition } from "./router_definition";
import { getRepository } from "typeorm";
import { Issue } from "../models/entities/issue";
import { compact, map } from "lodash";

const router = express.Router();

router.get("/fields", async (req, res) => {
  const fields = await getRepository(Field).find();
  res.json({
    count: fields.length,
    fields: fields,
  });
});

router.get("/statuses", async (req, res) => {
  const statuses = await getRepository(Status).find();
  res.json({
    count: statuses.length,
    fields: statuses,
  });
});

router.get("/hierarchy-levels", async (req, res) => {
  const levels = await getRepository(HierarchyLevel).find();
  res.json({
    count: levels.length,
    levels,
  });
});

router.get("/resolutions", async (req, res) => {
  const resolutions = await getRepository(Issue)
    .createQueryBuilder()
    .select("resolution")
    .distinct(true)
    .orderBy("resolution")
    .getRawMany();
  res.json({
    count: resolutions.length,
    resolutions: compact(map(resolutions, "resolution")),
  });
});

module.exports = {
  routerPath: "/meta",
  router: router,
} as RouterDefinition;
