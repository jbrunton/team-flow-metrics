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
      <div class="column is-one-quarter">
        <b-field label="Hierarchy Level">
          <b-select aria-role="list" v-model="selectedLevel">
            <option
              v-for="level in hierarchyLevels"
              :value="level.name"
              :key="level.name"
            >
              {{ level.name }}
            </option>
          </b-select>
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
import moment from "moment";
import { getDefaultDateRange, formatDateRange } from "../helpers/date_helper";

export default Vue.extend({
  name: "Issues",

  data() {
    return {
      chartOps: {},
      chartData: [],
      hierarchyLevels: [],
      selectedLevel: null,
      dates: []
    };
  },

  mounted() {
    this.initForm().then(this.initCharts);
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

    async initForm() {
      const response = await axios.get("/api/meta/hierarchy-levels");
      this.hierarchyLevels = response.data.levels;
      this.selectedLevel = this.hierarchyLevels[0].name;
    },

    async fetchData() {
      const fromDate = this.dates[0];
      const toDate = this.dates[1];

      const response = await axios.get(
        `/api/charts/scatterplot?fromDate=${fromDate.toString()}&toDate=${toDate.toString()}&hierarchyLevel=${
          this.selectedLevel
        }`
      );

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
    },

    dateFormatter(dates) {
      return formatDateRange(this.locale, dates);
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
    }
  }
});
</script>
