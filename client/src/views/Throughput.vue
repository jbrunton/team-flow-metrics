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
      <div class="column is-one-quarter">
        <b-field label="Step Interval">
          <b-select aria-role="list" v-model="selectedInterval">
            <option
              v-for="interval in stepIntervals"
              :value="interval.key"
              :key="interval.key"
            >
              {{ interval.name }}
            </option>
          </b-select>
        </b-field>
      </div>
    </div>

    <div id="chart_div"></div>

    <IssuesList
      v-if="selectedIssues.length"
      :issues="selectedIssues"
    ></IssuesList>
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

export default Vue.extend({
  name: "Issues",

  components: {
    IssuesList,
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
      stepIntervals: [
        { name: "Daily", key: "Daily" },
        { name: "Weekly", key: "Weekly" },
        { name: "Bi-Weekly", key: "BiWeekly" },
        { name: "Monthly", key: "Monthly" }
      ],
      selectedInterval: this.$route.query.stepInterval || "Daily",
      selectedDate: null,
      selectedIssues: []
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

    dateSelected() {
      this.selectedIssues = [];
      const selection = this.chart.gchart.getSelection()[0];
      // completed issues column
      if (selection.column == 1) {
        const date = this.chart.data.getValue(selection.row, 2);
        this.selectedDate = date;
      }
    },

    parseDate(input?: string): Date {
      if (!input) {
        return null;
      }
      return new Date(input);
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
    },

    async selectedDate() {
      const params = {
        fromDate: this.selectedDate,
        stepInterval: this.selectedInterval,
        hierarchyLevel: this.selectedLevel
      };
      const url = buildUrl("/api/charts/throughput/closedBetween", params);
      const response = await axios.get(url);
      this.selectedIssues = response.data.issues.map(issue => {
        return {
          key: issue.key,
          title: issue.title,
          issueType: issue.issueType,
          externalUrl: issue.externalUrl,
          status: issue.status,
          statusCategory: issue.statusCategory,
          childCount: issue.childCount,
          percentDone: issue.percentDone,
          created: this.parseDate(issue.created),
          started: this.parseDate(issue.started),
          completed: this.parseDate(issue.completed),
          lastTransition: this.parseDate(issue.lastTransition),
          cycleTime: issue.cycleTime
        };
      });
    }
  },

  computed: {
    params() {
      return {
        fromDate: formatDateParam(this.dates[0]),
        toDate: formatDateParam(this.dates[1]),
        hierarchyLevel: String(this.selectedLevel),
        stepInterval: this.selectedInterval
      };
    },

    url() {
      return buildUrl("/api/charts/throughput", this.params);
    }
  }
});
</script>
