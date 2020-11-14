<template>
  <div class="issues">
    <h1>Scatterplot</h1>

    <div class="columns">
      <div class="column is-half">
        <b-field label="Date Range">
          <p class="control">
            <b-dropdown :triggers="['hover']" aria-role="list">
              <button class="button is-info" slot="trigger">
                <a
                  ><b-icon icon="calendar-month-outline"></b-icon>
                  <b-icon icon="menu-down"></b-icon
                ></a>
              </button>

              <b-dropdown-item custom aria-role="menuitem">
                <span class="menu-label">Jump To</span>
              </b-dropdown-item>
              <b-dropdown-item
                v-for="range in dateRanges"
                :key="range.description"
                aria-role="listitem"
                @click="selectRange(range)"
              >
                {{ range.description }}
              </b-dropdown-item>
            </b-dropdown>
          </p>
          <b-datepicker
            placeholder="Click to select..."
            v-model="dates"
            :date-formatter="dateFormatter"
            range
            style="width: 100%;"
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
import {
  getDefaultDateRange,
  formatDateRange,
  getDefaultDateRanges,
  DateRange
} from "../helpers/date_helper";

export default Vue.extend({
  name: "Issues",

  data() {
    return {
      chartOps: {},
      chartData: [],
      hierarchyLevels: [],
      selectedLevel: null,
      dateRanges: [],
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
      this.dateRanges = getDefaultDateRanges();
      const response = await axios.get("/api/meta/hierarchy-levels");
      this.hierarchyLevels = response.data.levels;
      this.selectedLevel = this.hierarchyLevels[0].name;
    },

    selectRange(range: DateRange) {
      this.dates = [range.fromDate, range.toDate];
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
      return formatDateRange(dates);
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
