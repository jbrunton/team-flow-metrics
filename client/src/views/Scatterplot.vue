<template>
  <div class="issues">
    <h1>Scatterplot</h1>

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
      chartData: []
    };
  },
  mounted() {
    axios.get("/api/charts/scatterplot").then(response => {
      console.log(response.data);
      this.chartData = response.data.chartData;
      this.chartOpts = response.data.chartOpts;
      this.loadCharts();
    });
  },

  methods: {
    loadCharts() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(this.drawChart);
    },
    drawChart() {
      const data = new google.visualization.DataTable(this.chartData);
      const chart = new google.visualization.ScatterChart(
        document.getElementById("chart_div")
      );
      chart.draw(data, this.chartOpts);
    }
  }
});
</script>
