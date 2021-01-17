<template>
  <div class="columns">
    <div class="column is-8">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">Flow Metrics</p>
        </header>
        <div class="card-content">
          <div class="content">
            <p>
              <router-link :to="{ name: 'Scatterplot' }"
                >Scatterplot</router-link
              >
              &middot; Inspect issue cycle times and percentiles
            </p>
            <div class="buttons">
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'Scatterplot', query: scatterplotParams.stories }"
                >Issue Cycle Times</b-button
              >
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'Scatterplot', query: scatterplotParams.epics }"
                >Epic Cycle Times</b-button
              >
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="content">
            <p>
              <router-link :to="{ name: 'Throughput' }">Throughput</router-link>
              &middot; Run charts for throughput
            </p>
            <div class="buttons">
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'Throughput', query: throughputParams.stories }"
                >Issues by Month</b-button
              >
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'Throughput', query: throughputParams.epics }"
                >Epics by Month</b-button
              >
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="content">
            <p>
              <router-link :to="{ name: 'CFD' }">CFD</router-link>
              &middot; Cumulative Flow Diagrams
            </p>
            <div class="buttons">
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'CFD', query: cfdParams.stories }"
                >Issues CFD</b-button
              >
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'CFD', query: cfdParams.epics }"
                >Epics CFD</b-button
              >
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <header class="card-header">
          <p class="card-header-title">Portfolio Management</p>
        </header>
        <div class="card-content">
          <div class="content">
            <p>
              <router-link :to="{ name: 'Forecast' }">Forecast</router-link>
              &middot; Forecast delivery dates and costs
            </p>
            <div class="buttons">
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'Forecast', query: forecastParams.stories }"
                >Forecast Stories</b-button
              >
              <b-button
                size="is-small"
                tag="router-link"
                :to="{ name: 'Forecast', query: forecastParams.epics }"
                >Forecast Epics</b-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-content:not(:last-child) {
  border-bottom: solid 1pt #eee;
}

.card:not(:last-child) {
  margin-bottom: 24px;
}
</style>

<script lang="ts">
import {
  getRelativeDayRange,
  getRelativeMonthRange
} from "@/helpers/date_helper";
import { formatDateParam } from "@/helpers/url_helper";
import Vue from "vue";

export default Vue.extend({
  name: "Home",
  data() {
    const last30Days = getRelativeDayRange(30);
    const last90Days = getRelativeDayRange(90);
    const last6Months = getRelativeMonthRange(6);
    const scatterplotParams = {
      stories: {
        hierarchyLevel: "Story",
        fromDate: formatDateParam(last30Days.fromDate),
        toDate: formatDateParam(last30Days.toDate)
      },
      epics: {
        hierarchyLevel: "Epic",
        fromDate: formatDateParam(last90Days.fromDate),
        toDate: formatDateParam(last90Days.toDate)
      }
    };
    const throughputParams = {
      stories: {
        hierarchyLevel: "Story",
        fromDate: formatDateParam(last6Months.fromDate),
        toDate: formatDateParam(last6Months.toDate),
        stepInterval: "Monthly"
      },
      epics: {
        hierarchyLevel: "Epic",
        fromDate: formatDateParam(last6Months.fromDate),
        toDate: formatDateParam(last6Months.toDate),
        stepInterval: "Monthly"
      }
    };
    const cfdParams = {
      stories: {
        hierarchyLevel: "Story",
        fromDate: formatDateParam(last30Days.fromDate),
        toDate: formatDateParam(last30Days.toDate)
      },
      epics: {
        hierarchyLevel: "Epic",
        fromDate: formatDateParam(last90Days.fromDate),
        toDate: formatDateParam(last90Days.toDate)
      }
    };
    const forecastParams = {
      stories: {
        hierarchyLevel: "Story",
        fromDate: formatDateParam(last90Days.fromDate),
        toDate: formatDateParam(last90Days.toDate)
      },
      epics: {
        hierarchyLevel: "Epic",
        fromDate: formatDateParam(last90Days.fromDate),
        toDate: formatDateParam(last90Days.toDate)
      }
    };
    return {
      scatterplotParams,
      throughputParams,
      cfdParams,
      forecastParams
    };
  }
});
</script>
