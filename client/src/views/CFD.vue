<template>
  <div class="issues">
    <h1>Cumulative Flow Diagram</h1>

    <div class="columns">
      <div class="column is-4">
        <DatePicker v-model="dates" />
      </div>
      <div class="column is-2">
        <HierarchyLevelPicker v-model="selectedLevel" />
      </div>
    </div>

    <div class="field">
      <b-checkbox v-model="includeToDoIssues">
        Show To Do count
      </b-checkbox>
      <b-checkbox v-model="includeBacklog" :disabled="!includeToDoIssues">
        Include backlog
      </b-checkbox>
      <b-checkbox v-model="includeDoneIssues">
        Include all completed issues
      </b-checkbox>
      <b-checkbox v-model="includeStoppedIssues">
        Include stopped issues
      </b-checkbox>
    </div>

    <div id="chart_div"></div>
  </div>
</template>

<style lang="scss" scoped>
.menu-label,
.menu-list {
  white-space: nowrap;
}
.b-checkbox.checkbox {
  margin-right: 24px !important;
}
</style>

<script lang="ts">
/* global google */

import Vue from "vue";
import axios from "axios";
import { formatDateRange } from "../helpers/date_helper";
import DatePicker from "@/components/DatePicker.vue";
import HierarchyLevelPicker from "@/components/HierarchyLevelPicker.vue";
import { buildUrl, formatDateParam } from "@/helpers/url_helper";
import { getDefaultChartParams, saveChartParams } from "@/helpers/chart_helper";

export default Vue.extend({
  name: "CFD",

  components: {
    DatePicker,
    HierarchyLevelPicker
  },

  data() {
    const chartParams = getDefaultChartParams(this.$route.query);
    return {
      ...chartParams,
      chartOps: {},
      chartData: [],
      chart: null,
      includeStoppedIssues: this.$route.query.includeStoppedIssues === "true",
      includeToDoIssues: this.$route.query.includeToDoIssues === "true",
      includeBacklog: this.$route.query.includeBacklog === "true",
      includeDoneIssues: this.$route.query.includeDoneIssues === "true"
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(this.afterInitialize);
    },

    afterInitialize() {
      this.initialized = true;
      this.fetchData();
      new ResizeObserver(this.drawChart).observe(
        document.getElementById("chart_div")
      );
    },

    async fetchData() {
      const response = await axios.get(this.url);
      this.chartData = response.data.chartData;
      this.chartOpts = response.data.chartOpts;
      this.drawChart();
    },

    drawChart() {
      const container = document.getElementById("chart_div");
      if (!container) {
        // switched pages, ignore
        return;
      }

      container.style.height = `${container.offsetWidth * 0.6}px`;
      const data = new google.visualization.DataTable(this.chartData);
      const chart = new google.visualization.AreaChart(container);
      chart.draw(data, this.chartOpts);
      google.visualization.events.addListener(
        chart,
        "select",
        this.issueSelected
      );
      this.chart = {
        gchart: chart,
        data: data
      };
    },

    dateFormatter(dates) {
      return formatDateRange(dates);
    }
  },

  watch: {
    params: {
      immediate: true,
      handler(params) {
        history.replaceState({}, null, buildUrl(this.$route.path, params));
        saveChartParams({
          selectedLevel: this.selectedLevel,
          dates: [this.dates[0], this.dates[1]]
        });
      }
    },

    url: {
      immediate: true,
      handler() {
        if (this.initialized) {
          this.fetchData();
        }
      }
    }
  },

  computed: {
    params() {
      return {
        fromDate: formatDateParam(this.dates[0]),
        toDate: formatDateParam(this.dates[1]),
        hierarchyLevel: String(this.selectedLevel),
        includeStoppedIssues: String(this.includeStoppedIssues),
        includeToDoIssues: String(this.includeToDoIssues),
        includeBacklog: String(this.includeBacklog),
        includeDoneIssues: String(this.includeDoneIssues)
      };
    },

    url() {
      return buildUrl("/api/charts/cfd", this.params);
    }
  }
});
</script>
