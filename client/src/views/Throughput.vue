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

    <div class="field">
      <b-checkbox v-model="excludeOutliers">
        Exclude outliers
      </b-checkbox>
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
import moment from "moment";
import { getDefaultDateRange, formatDateRange } from "../helpers/date_helper";
import IssuesList from "@/components/IssuesList.vue";
import DatePicker from "@/components/DatePicker.vue";
import HierarchyLevelPicker from "@/components/HierarchyLevelPicker.vue";

export default Vue.extend({
  name: "Issues",

  components: {
    IssuesList,
    DatePicker,
    HierarchyLevelPicker
  },

  data() {
    return {
      chartOps: {},
      chartData: [],
      chart: null,
      selectedLevel: "Story",
      excludeOutliers: false,
      stepIntervals: [
        { name: "Daily", key: "Daily" },
        { name: "Weekly", key: "Weekly" },
        { name: "Bi-Weekly", key: "BiWeekly" },
        { name: "Monthly", key: "Monthly" }
      ],
      selectedInterval: "Daily",
      dates: getDefaultDateRange(),
      selectedDate: null,
      selectedIssues: []
    };
  },

  mounted() {
    this.initCharts();
  },

  methods: {
    initCharts() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(() => {
        if (this.$route.query.fromDate && this.$route.query.toDate) {
          this.dates = [
            moment(this.$route.query.fromDate as string).toDate(),
            moment(this.$route.query.toDate as string).toDate()
          ];
        } else {
          this.dates = getDefaultDateRange();
        }
        new ResizeObserver(this.drawChart).observe(
          document.getElementById("chart_div")
        );
      });
    },

    async fetchData() {
      const fromDate = this.dates[0];
      const toDate = this.dates[1];

      const params = {
        fromDate: fromDate.toString(),
        toDate: toDate.toString(),
        hierarchyLevel: this.selectedLevel,
        excludeOutliers: this.excludeOutliers,
        stepInterval: this.selectedInterval
      };
      const url = `/api/charts/throughput?${new URLSearchParams(
        params
      ).toString()}`;

      const response = await axios.get(url);

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
        //$('#spinner').show().html(render('spinner', { margin: 20 }));
        const date = this.chart.data.getValue(selection.row, 2);
        this.selectedDate = date;
        //alert(date);
        //this.selectedIssueKey = key;
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
    dates() {
      this.fetchData();
      const query = {
        fromDate: moment(this.dates[0]).format("YYYY-MM-DD"),
        toDate: moment(this.dates[1]).format("YYYY-MM-DD")
      };
      if (JSON.stringify(this.$route.query) !== JSON.stringify(query)) {
        this.$router.replace({
          path: this.$route.path,
          query: query
        });
      }
    },
    selectedLevel() {
      this.fetchData();
    },
    excludeOutliers() {
      this.fetchData();
    },
    selectedInterval() {
      this.fetchData();
    },

    async selectedDate() {
      //alert(this.selectedDate);

      const params = {
        fromDate: this.selectedDate,
        stepInterval: this.selectedInterval,
        hierarchyLevel: this.selectedLevel
      };
      const url = `/api/charts/throughput/closedBetween?${new URLSearchParams(
        params
      ).toString()}`;
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
  }
});
</script>
