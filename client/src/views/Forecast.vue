<template>
  <div class="issues">
    <h1>Throughput</h1>

    <div class="columns">
      <div class="column is-half">
        <DatePicker v-model="dates" />
      </div>
      <div class="column is-one-quarter">
        <HierarchyLevelPicker v-model="selectedLevel" />
      </div>
    </div>

    <div id="chart_div"></div>
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
import { formatDateRange } from "@/helpers/date_helper";
import { buildUrl, formatDateParam } from "@/helpers/url_helper";
import IssuesList from "@/components/IssuesList.vue";
import DatePicker from "@/components/DatePicker.vue";
import HierarchyLevelPicker from "@/components/HierarchyLevelPicker.vue";
import { getDefaultChartParams } from "@/helpers/chart_helper";
import { DateTime } from "luxon";

export default Vue.extend({
  name: "Issues",

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
      chart: null
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
        this.dateSelected
      );
      this.chart = {
        gchart: chart,
        data: data
      };
    },

    dateFormatter(dates) {
      return formatDateRange(dates);
    },

    parseDate(input?: string): DateTime {
      if (!input) {
        return null;
      }
      return DateTime.fromISO(input);
    }
  },

  watch: {
    params: {
      immediate: true,
      handler(params) {
        history.pushState({}, null, buildUrl(this.$route.path, params));
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
        backlogSize: 50
      };
    },

    url() {
      return buildUrl("/api/simulation/when", this.params);
    }
  }
});
</script>
