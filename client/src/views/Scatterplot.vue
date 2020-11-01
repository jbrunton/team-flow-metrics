<template>
  <div class="issues">
    <h1>Scatterplot</h1>

    <div id="chart_div" style="width: 900px; height: 500px;"></div>
  </div>
</template>

<script lang="ts">
/* global google */

import Vue from "vue";

export default Vue.extend({
  name: "Issues",
  data() {
    return {
      data: []
    };
  },
  mounted() {
    // axios.get(`/api/issues`).then(response => {
    //   this.issues = response.data.issues.map(issue => {
    //     return {
    //       key: issue.key,
    //       title: issue.title,
    //       started: this.formatDate(issue.started),
    //       completed: this.formatDate(issue.completed),
    //       cycleTime: this.formatNumber(issue.cycleTime)
    //     };
    //   });
    // });
    this.loadCharts();
  },

  methods: {
    loadCharts() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(this.drawChart);
    },
    drawChart() {
      const data = google.visualization.arrayToDataTable([
        ["Age", "Weight"],
        [8, 12],
        [4, 5.5],
        [11, 14],
        [4, 5],
        [3, 3.5],
        [6.5, 7]
      ]);

      const options = {
        title: "Age vs. Weight comparison",
        hAxis: { title: "Age", minValue: 0, maxValue: 15 },
        vAxis: { title: "Weight", minValue: 0, maxValue: 15 },
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
