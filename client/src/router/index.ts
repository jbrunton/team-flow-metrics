import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/issues",
    name: "Issues",
    component: () =>
      import(/* webpackChunkName: "issues" */ "../views/Issues.vue")
  },
  {
    path: "/issues/:key",
    name: "IssueDetails",
    component: () =>
      import(
        /* webpackChunkName: "issuedetailsreport" */ "../views/IssueDetailsReport.vue"
      )
  },
  {
    path: "/epics/:key",
    name: "EpicReport",
    component: () =>
      import(/* webpackChunkName: "epicreport" */ "../views/EpicReport.vue")
  },
  {
    path: "/scatterplot",
    name: "Scatterplot",
    component: () =>
      import(/* webpackChunkName: "scatterplot" */ "../views/Scatterplot.vue")
  },
  {
    path: "/cfd",
    name: "CFD",
    component: () => import(/* webpackChunkName: "cfd" */ "../views/CFD.vue")
  },
  {
    path: "/throughput",
    name: "Throughput",
    component: () =>
      import(/* webpackChunkName: "throughput" */ "../views/Throughput.vue")
  },
  {
    path: "/forecast",
    name: "Forecast",
    component: () =>
      import(/* webpackChunkName: "forecast" */ "../views/Forecast.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
