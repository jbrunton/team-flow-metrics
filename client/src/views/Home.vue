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

    <div class="column is-4">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">Sync</p>
        </header>
        <div class="card-content">
          <div class="content">
            <div class="block">
              <span v-text="latestDescription" />
            </div>
            <div class="block">
              <b-button :disabled="syncInProgress" type="is-light" @click="sync"
                >Sync with Jira</b-button
              >
            </div>
            <div class="block" v-if="syncInProgress">
              <span v-text="syncMessage" />
            </div>
            <div class="block" v-if="syncInProgress">
              <b-progress
                v-if="syncProgress"
                type="is-info"
                :value="syncProgress"
                show-value
              ></b-progress>
              <b-progress v-else type="is-info"></b-progress>
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
import axios from "axios";
import Vue from "vue";

export default Vue.extend({
  name: "Home",
  methods: {
    async sync() {
      this.syncInProgress = true;
      await axios.post("/api/sync");
    },

    async fetchLatest() {
      const response = await axios.get("/api/sync/latest");
      this.latest = response.data;
    },

    connect() {
      const ws = new WebSocket("ws://localhost:3001/api/ws");
      ws.onmessage = message => {
        const data = JSON.parse(message.data);
        if (data.event !== "sync-info") return;

        this.syncInProgress = data.inProgress;
        if (data.inProgress) {
          this.syncMessage = data.message;
          this.syncProgress = data.progress;
        } else {
          this.syncMessage = null;
          this.syncProgress = null;
          this.fetchLatest();
        }
      };

      ws.onclose = e => {
        console.log(
          "Socket connection closed. Reconnecting in 5 seconds...",
          e.reason
        );
        setTimeout(() => this.connect(), 5000);
      };
    }
  },
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
      forecastParams,
      syncInProgress: false,
      syncMessage: null,
      syncProgress: null,
      latest: null
    };
  },
  created() {
    this.connect();
    this.fetchLatest();
  },
  computed: {
    latestDescription() {
      return this.latest
        ? `Last sync: ${new Date(this.latest.created).toLocaleString()}`
        : "Never";
    }
  }
});
</script>
