import * as express from "express";

export type RouterDefinition = {
  routerPath: string;
  router: express.Router;
  environments?: string[];
};
