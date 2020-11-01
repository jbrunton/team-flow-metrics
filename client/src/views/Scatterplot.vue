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
      chartData: []
    };
  },
  mounted() {
    //"/api/charts/scatterplot"
    axios.get("/api/charts/scatterplot").then(response => {
      console.log(response.data);
      this.chartData = response.data.chartData;
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

      const options = {
        title: "Cycle Times",
        //hAxis: { title: "Age", minValue: 0, maxValue: 15 },
        //vAxis: { title: "Weight", minValue: 0, maxValue: 15 },
        legend: "none"
      };

      const chart = new google.visualization.ScatterChart(
        document.getElementById("chart_div")
      );

      chart.draw(data, options);
    }
  }
});
</script>
