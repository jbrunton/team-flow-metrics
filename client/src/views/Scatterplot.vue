<template>
  <div class="issues">
    <h1>Scatterplot</h1>

    <div class="columns">
      <div class="column is-half">
        <b-field label="Date Range">
          <p class="control">
            <b-dropdown aria-role="list">
              <button class="button is-info" slot="trigger">
                <a
                  ><b-icon icon="calendar-month-outline"></b-icon>
                  <b-icon icon="menu-down"></b-icon
                ></a>
              </button>

              <b-dropdown-item custom>
                <div class="columns">
                  <b-menu class="column">
                    <b-menu-list label="Absolute" style="whitespace: no-wrap;">
                      <b-menu-item
                        v-for="range in calendarMonthRanges"
                        :key="range.description"
                        aria-role="listitem"
                        :label="range.description"
                        @click="selectRange(range)"
                      >
                      </b-menu-item>
                    </b-menu-list>
                  </b-menu>
                  <b-menu class="column">
                    <b-menu-list label="Relative" style="white-space: no-wrap;">
                      <b-menu-item
                        v-for="range in relativeDateRanges"
                        :key="range.description"
                        aria-role="listitem"
                        :label="range.description"
                        @click="selectRange(range)"
                      >
                      </b-menu-item>
                    </b-menu-list>
                  </b-menu>
                </div>
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
import {
  getDefaultDateRange,
  formatDateRange,
  getRelativeDateRanges,
  getCalendarMonthRanges,
  DateRange
} from "../helpers/date_helper";
import IssueDetails from "@/components/IssueDetails.vue";

export default Vue.extend({
  name: "Issues",

  components: {
    IssueDetails
  },

  data() {
    return {
      chartOps: {},
      chartData: [],
      chart: null,
      hierarchyLevels: [],
      selectedLevel: null,
      relativeDateRanges: [],
      calendarMonthRange: [],
      excludeOutliers: false,
      dates: [],
      selectedIssueKey: null
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
      this.relativeDateRanges = getRelativeDateRanges();
      this.calendarMonthRanges = getCalendarMonthRanges();
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

      const params = {
        fromDate: fromDate.toString(),
        toDate: toDate.toString(),
        hierarchyLevel: this.selectedLevel,
        excludeOutliers: this.excludeOutliers
      };
      const url = `/api/charts/scatterplot?fromDate=${new URLSearchParams(
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
        this.issueSelected
      );
      this.chart = {
        gchart: chart,
        data: data
      };
    },

    dateFormatter(dates) {
      return formatDateRange(dates);
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
    }
  }
});
</script>
