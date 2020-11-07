<template>
  <div class="issues">
    <h1>Scatterplot</h1>

    <div class="columns">
      <div class="column is-one-quarter">
        <b-field label="Date Range">
          <b-datepicker
            placeholder="Click to select..."
            v-model="dates"
            :date-formatter="dateFormatter"
            range
          >
          </b-datepicker>
        </b-field>
      </div>
    </div>

    <div id="chart_div"></div>
  </div>
</template>

<script lang="ts">
/* global google */

import Vue from "vue";
import axios from "axios";
import { getDefaultDateRange, formatDateRange } from "../helpers/date_helper";

export default Vue.extend({
  name: "Issues",
  data() {
    return {
      chartOps: {},
      chartData: [],
      dates: []
    };
  },
  mounted() {
    this.initCharts();
    window.onresize = this.drawChart;
  },

  methods: {
    initCharts() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(() => {
        this.dates = getDefaultDateRange();
      });
    },

    fetchData() {
      const fromDate = this.dates[0];
      const toDate = this.dates[1];

      axios
        .get(
          `/api/charts/scatterplot?fromDate=${fromDate.toString()}&toDate=${toDate.toString()}`
        )
        .then(response => {
          this.chartData = response.data.chartData;
          this.chartOpts = response.data.chartOpts;
          this.drawChart();
        });
    },

    drawChart() {
      const container = document.getElementById("chart_div");
      container.style.height = `${container.offsetWidth * 0.6}px`;
      const data = new google.visualization.DataTable(this.chartData);
      const chart = new google.visualization.ComboChart(container);
      chart.draw(data, this.chartOpts);
    },

    dateFormatter(dates) {
      return formatDateRange(this.locale, dates);
    }
  },

  watch: {
    dates() {
      this.fetchData();
    }
  }
});
</script>
