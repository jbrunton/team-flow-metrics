<template>
  <div class="issues">
    <h1>Scatterplot</h1>

    <div class="columns">
      <div class="column is-4">
        <DatePicker v-model="dates" />
      </div>
      <div class="column is-2">
        <HierarchyLevelPicker v-model="selectedLevel" />
      </div>
    </div>

    <ExcludeOutliers v-model="excludeOutliers" />

    <div id="chart_div"></div>

    <IssueDetails
      v-if="selectedIssueKey"
      :issueKey="selectedIssueKey"
      :key="selectedIssueKey"
    ></IssueDetails>
  </div>
</template>

<style lang="scss" scoped>
.menu-label,
.menu-list {
  white-space: nowrap;
}
</style>

<script lang="ts">
/* global google */

import Vue from "vue";
import axios from "axios";
import { buildUrl, formatDateParam } from "@/helpers/url_helper";
import { getDefaultChartParams, saveChartParams } from "@/helpers/chart_helper";
import IssueDetails from "@/components/IssueDetails.vue";
import DatePicker from "@/components/DatePicker.vue";
import HierarchyLevelPicker from "@/components/HierarchyLevelPicker.vue";
import ExcludeOutliers from "@/components/ExcludeOutliers.vue";

export default Vue.extend({
  name: "Issues",

  components: {
    IssueDetails,
    DatePicker,
    HierarchyLevelPicker,
    ExcludeOutliers
  },

  data() {
    const chartParams = getDefaultChartParams(this.$route.query);
    return {
      ...chartParams,
      chartOps: {},
      chartData: [],
      initialized: false,
      chart: null,
      excludeOutliers: false,
      selectedIssueKey: null
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
      const chart = new google.visualization.ComboChart(container);
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

    issueSelected() {
      const selection = this.chart.gchart.getSelection()[0];
      // completed issues column
      if (selection.column == 1) {
        const key = this.chart.data.getValue(selection.row, 2);
        this.selectedIssueKey = key;
      }
    }
  },

  watch: {
    params: {
      immediate: true,
      handler(params) {
        history.pushState({}, null, buildUrl(this.$route.path, params));
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
        excludeOutliers: String(this.excludeOutliers)
      };
    },

    url() {
      return buildUrl("/api/charts/scatterplot", this.params);
    }
  }
});
</script>
