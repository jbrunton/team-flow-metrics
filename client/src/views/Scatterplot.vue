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
      data: []
    };
  },
  mounted() {
    axios.get(`/api/issues`).then(response => {
      this.issues = response.data.issues
        .filter(issue => issue.completed)
        .map(issue => {
          return {
            key: issue.key,
            title: issue.title,
            started: new Date(issue.started),
            completed: new Date(issue.completed),
            cycleTime: issue.cycleTime
          };
        });
      this.loadCharts();
    });
  },

  methods: {
    loadCharts() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(this.drawChart);
    },
    drawChart() {
      const issueData = this.issues.map(issue => [
        issue.completed,
        issue.cycleTime
      ]);
      console.log(issueData);
      console.log(issueData.map(row => row[0].getTime()));
      const data = new google.visualization.DataTable();
      data.addColumn("date", "Completed");
      data.addColumn("number", "Cycle Time");
      data.addRows(issueData);
      // const data = google.visualization.arrayToDataTable([
      //   ["Age", "Weight"],
      //   [8, 12],
      //   [4, 5.5],
      //   [11, 14],
      //   [4, 5],
      //   [3, 3.5],
      //   [6.5, 7]
      // ]);

      const options = {
        title: "Age vs. Weight comparison",
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
