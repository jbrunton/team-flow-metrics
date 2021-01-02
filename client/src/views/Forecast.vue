<template>
  <div class="issues">
    <h1>Forecast</h1>

    <div class="columns">
      <div class="column is-half">
        <DatePicker v-model="dates" />
      </div>
      <div class="column is-one-quarter">
        <HierarchyLevelPicker v-model="selectedLevel" />
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-quarter">
        <b-field label="Start Date">
          <b-datepicker
            placeholder="Click to select..."
            v-model="startDate"
            :date-formatter="formatDate"
          >
          </b-datepicker>
        </b-field>
      </div>
      <div class="column is-one-quarter">
        <b-field label="Seed">
          <b-input v-model="seed" :lazy="true" expanded></b-input>
          <p class="control">
            <b-button
              v-on:click="refreshSeed"
              class="button"
              icon-right="refresh"
            ></b-button>
          </p>
        </b-field>
      </div>
    </div>

    <div id="chart_div"></div>
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
import { formatDateRange, formatDate } from "@/helpers/date_helper";
import { buildUrl, formatDateParam } from "@/helpers/url_helper";
import DatePicker from "@/components/DatePicker.vue";
import HierarchyLevelPicker from "@/components/HierarchyLevelPicker.vue";
import { getDefaultChartParams } from "@/helpers/chart_helper";
import { DateTime } from "luxon";

export default Vue.extend({
  name: "Issues",

  components: {
    DatePicker,
    HierarchyLevelPicker
  },

  data() {
    const chartParams = getDefaultChartParams(this.$route.query);
    return {
      ...chartParams,
      startDate: DateTime.local()
        .startOf("day")
        .toJSDate(),
      seed: this.newSeed(),
      chartOps: {},
      chartData: [],
      chart: null
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(this.afterInitialize);
    },

    afterInitialize() {
      this.initialized = true;
      this.fetchData();
      new ResizeObserver(this.drawChart).observe(
        document.getElementById("chart_div")
      );
    },

    async fetchData() {
      const response = await axios.get(this.url);
      this.chartData = response.data.chartData;
      this.chartOpts = response.data.chartOpts;
      this.drawChart();
    },

    refreshSeed() {
      this.seed = this.newSeed();
    },

    newSeed(): number {
      return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
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
        this.dateSelected
      );
      this.chart = {
        gchart: chart,
        data: data
      };
    },

    dateFormatter(dates) {
      return formatDateRange(dates);
    },

    formatDate,

    parseDate(input?: string): DateTime {
      if (!input) {
        return null;
      }
      return DateTime.fromISO(input);
    }
  },

  watch: {
    params: {
      immediate: true,
      handler(params) {
        history.pushState({}, null, buildUrl(this.$route.path, params));
      }
    },

    url: {
      immediate: true,
      handler() {
        if (this.initialized) {
          this.fetchData();
        }
      }
    }
  },

  computed: {
    params() {
      return {
        fromDate: formatDateParam(this.dates[0]),
        toDate: formatDateParam(this.dates[1]),
        hierarchyLevel: String(this.selectedLevel),
        startDate: formatDateParam(DateTime.fromJSDate(this.startDate)),
        backlogSize: 50,
        seed: this.seed
      };
    },

    url() {
      return buildUrl("/api/simulation/when", this.params);
    }
  }
});
</script>
