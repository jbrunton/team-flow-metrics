<template>
  <div class="issues">
    <h1>Scatterplot</h1>

    <div class="columns">
      <div class="column is-one-quarter">
        <b-field label="Date Range">
            <b-datepicker
                placeholder="Click to select..."
                v-model="dates"
                range>
            </b-datepicker>
        </b-field>
      </div>
    </div>

    <div id="chart_div" style="width: 900px; height: 500px;"></div>
  </div>
</template>

<script lang="ts">
/* global google */

import Vue from "vue";
import axios from "axios";

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
    this.loadCharts();
  },

  methods: {
    initChart() {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const toDate = new Date(today);
      toDate.setDate(toDate.getDate() + 1);
      const fromDate = new Date(toDate);
      fromDate.setDate(toDate.getDate() - 90);
      this.dates = [fromDate, toDate];
    },
    fetchData() {
      const fromDate = this.dates[0];
      const toDate = this.dates[1];

      axios.get(`/api/charts/scatterplot?fromDate=${fromDate.toString()}&toDate=${toDate.toString()}`).then(response => {
        this.chartData = response.data.chartData;
        this.chartOpts = response.data.chartOpts;
        this.drawChart();
      });
    },
    loadCharts() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(this.initChart);
    },
    drawChart() {
      const data = new google.visualization.DataTable(this.chartData);
      const chart = new google.visualization.ScatterChart(
        document.getElementById("chart_div")
      );
      chart.draw(data, this.chartOpts);
    }
  },

  watch: {
    dates (dates) {
      this.fetchData();
    }
  }
});
</script>
