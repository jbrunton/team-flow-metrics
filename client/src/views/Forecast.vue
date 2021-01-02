<template>
  <div class="issues">
    <h1>Forecast</h1>

    <div class="columns">
      <div class="column is-4">
        <DatePicker v-model="dates" />
      </div>
      <div class="column is-2">
        <HierarchyLevelPicker v-model="selectedLevel" />
      </div>
    </div>
    <div class="columns">
      <div class="column is-2">
        <b-field label="Start Date">
          <b-datepicker
            placeholder="Click to select..."
            v-model="startDate"
            :date-formatter="formatDate"
          >
          </b-datepicker>
        </b-field>
      </div>
      <div class="column is-2">
        <b-field label="Backlog Size">
          <b-input v-model="backlogSize" :lazy="true" expanded></b-input>
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

    <ExcludeOutliers v-model="excludeOutliers" />
    <div class="field">
      <b-checkbox v-model="includeLongTails">
        Show long tails
      </b-checkbox>
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
import ExcludeOutliers from "@/components/ExcludeOutliers.vue";
import { getDefaultChartParams } from "@/helpers/chart_helper";
import { DateTime } from "luxon";

export default Vue.extend({
  name: "Issues",

  components: {
    DatePicker,
    HierarchyLevelPicker,
    ExcludeOutliers
  },

  data() {
    const chartParams = this.parseParams();
    return {
      ...chartParams,
      startDate: DateTime.local()
        .startOf("day")
        .toJSDate(),
      chartOps: {},
      chartData: [],
      excludeOutliers: false,
      includeLongTails: false,
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

    parseParams() {
      const query = this.$route.query;
      const defaultParams = getDefaultChartParams(query);
      return {
        ...defaultParams,
        seed: query.seed || this.newSeed(),
        backlogSize: query.backlogSize || 100
      };
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
        backlogSize: this.backlogSize,
        seed: this.seed,
        excludeOutliers: String(this.excludeOutliers),
        includeLongTails: String(this.includeLongTails)
      };
    },

    url() {
      return buildUrl("/api/simulation/when", this.params);
    }
  }
});
</script>
