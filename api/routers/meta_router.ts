import * as express from "express";
import { Field } from "../models/entities/field";
import { HierarchyLevel } from "../models/entities/hierarchy_level";
import { Status } from "../models/entities/status";
const router = express.Router();
const { getRepository } = require("typeorm");

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
    levels: levels,
  });
});

module.exports = {
  routerPath: "/meta",
  router: router,
};
