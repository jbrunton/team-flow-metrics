<template>
  <div class="issues">
    <h1>Scatterplot</h1>

    <div class="columns">
      <div class="column is-half">
        <DatePicker v-model="dates" />
      </div>
      <div class="column is-one-quarter">
        <HierarchyLevelPicker v-model="selectedLevel" />
      </div>
    </div>

    <div class="field">
      <b-checkbox v-model="excludeOutliers">
        Exclude outliers
      </b-checkbox>
    </div>

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
import moment from "moment";
import { getDefaultDateRange } from "@/helpers/date_helper";
import { buildUrl, formatDateParam } from "@/helpers/url_helper";
import IssueDetails from "@/components/IssueDetails.vue";
import DatePicker from "@/components/DatePicker.vue";
import HierarchyLevelPicker from "@/components/HierarchyLevelPicker.vue";

export default Vue.extend({
  name: "Issues",

  components: {
    IssueDetails,
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
      dates: getDefaultDateRange(),
      selectedIssueKey: null
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
        excludeOutliers: this.excludeOutliers
      };
      const url = buildUrl("/api/charts/scatterplot", params);

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
        //$('#spinner').show().html(render('spinner', { margin: 20 }));
        const key = this.chart.data.getValue(selection.row, 2);
        this.selectedIssueKey = key;
      }
    }
  },

  watch: {
    dates() {
      this.fetchData();
      const query = {
        fromDate: formatDateParam(this.dates[0]),
        toDate: formatDateParam(this.dates[1])
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
    }
  }
});
</script>
