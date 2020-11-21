<template>
  <div class="issue">
    <h1 class="title">
      <router-link :to="{ name: 'IssueDetails', params: { key: key } }">
        {{ key }}
      </router-link>
      <span v-if="epic">– {{ epic.title }}</span>
    </h1>

    <div class="columns">
      <div class="column is-half">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="title">{{ stats["Total"] }}</p>
              <p class="subtitle">Total</p>
            </div>
          </div>
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="title has-text-in-progress">
                {{ stats["In Progress"] }}
              </p>
              <p class="subtitle">In Progress</p>
            </div>
          </div>
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="title has-text-done">{{ stats["Done"] }}</p>
              <p class="subtitle">Done</p>
            </div>
          </div>
        </div>

        <b-progress
          type="is-done"
          v-if="epic"
          :value="epic.percentDone"
          show-value
          format="percent"
        ></b-progress>

        <div class="tile is-ancestor" v-if="epic">
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="subtitle">Started</p>
              <p>{{ formatDate(epic.started) }}</p>
            </div>
          </div>
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="subtitle">Completed</p>
              <p>{{ formatDate(epic.completed) }}</p>
            </div>
          </div>
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="subtitle">Cycle Time</p>
              <p>{{ formatNumber(epic.cycleTime) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="chart_div" class="column is-half"></div>
    </div>

    <nav v-if="children" class="panel">
      <p class="panel-heading">
        Issues In Epic
      </p>
      <div class="panel-block">
        <b-table
          :data="children"
          :narrowed="true"
          :striped="true"
          style="width:100%;"
        >
          <b-table-column
            width="120px"
            field="key"
            label="Key"
            v-slot="props"
            sortable
          >
            <router-link
              :to="{ name: 'IssueDetails', params: { key: props.row.key } }"
            >
              {{ props.row.key }}
            </router-link>
            <a :href="props.row.externalUrl" target="_blank">
              <b-icon icon="open-in-new" size="is-small"></b-icon>
            </a>
          </b-table-column>
          <b-table-column field="title" label="Title" v-slot="props" sortable>
            {{ props.row.title }}
          </b-table-column>
          <b-table-column
            field="issueType"
            label="Type"
            v-slot="props"
            sortable
          >
            {{ props.row.issueType }}
          </b-table-column>
          <b-table-column field="status" label="Status" v-slot="props" sortable>
            <StatusTag
              :status="props.row.status"
              :statusCategory="props.row.statusCategory"
            ></StatusTag>
          </b-table-column>
          <b-table-column
            width="150px"
            field="created"
            label="Created"
            v-slot="props"
            sortable
          >
            {{ formatDate(props.row.created) }}
          </b-table-column>
          <b-table-column
            width="150px"
            field="started"
            label="Started"
            v-slot="props"
            sortable
          >
            {{ formatDate(props.row.started) }}
          </b-table-column>
          <b-table-column
            width="150px"
            field="completed"
            label="Completed"
            v-slot="props"
            sortable
          >
            {{ formatDate(props.row.completed) }}
          </b-table-column>
        </b-table>
      </div>
    </nav>
  </div>
</template>
<script lang="ts">
/* global google */

import Vue from "vue";
import axios from "axios";
import StatusTag from "@/components/StatusTag.vue";
import { formatDate } from "../helpers/date_helper";
import { formatNumber } from "../helpers/format_helper";

export default Vue.extend({
  name: "EpicReport",
  components: {
    StatusTag
  },

  data() {
    return {
      key: this.$route.params.key,
      epic: null,
      children: [],
      stats: {
        "To Do": null,
        "In Progress": null,
        Done: null
      }
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    initCharts() {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(() => {
        // new ResizeObserver(this.drawChart).observe(
        //   document.getElementById("chart_div")
        // );
        this.fetchCfdData();
      });
    },
    async fetchCfdData() {
      const url = `/api/charts/cfd?epicKey=${this.epic.key}`;

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

      //container.style.height = `${container.offsetWidth * 0.6}px`;
      const data = new google.visualization.DataTable(this.chartData);
      const chart = new google.visualization.AreaChart(container);
      chart.draw(data, this.chartOpts);
      this.chart = {
        gchart: chart,
        data: data
      };
    },
    parseDate(input?: string): Date {
      if (!input) {
        return null;
      }
      return new Date(input);
    },
    formatDate,
    formatNumber,
    async fetchData() {
      const issueResponse = await axios.get(`/api/issues/${this.key}`);
      this.epic = issueResponse.data.issue;

      this.initCharts();

      const childrenResponse = await axios.get(
        `/api/issues/${this.epic.key}/children`
      );
      this.children = this.issues = childrenResponse.data.issues.map(issue => {
        return {
          key: issue.key,
          title: issue.title,
          issueType: issue.issueType,
          externalUrl: issue.externalUrl,
          status: issue.status,
          statusCategory: issue.statusCategory,
          childCount: issue.childCount,
          created: this.parseDate(issue.created),
          started: this.parseDate(issue.started),
          completed: this.parseDate(issue.completed),
          cycleTime: issue.cycleTime
        };
      });

      this.stats["Total"] = this.children.length;
      this.stats["In Progress"] = this.children.filter(
        issue => issue.statusCategory === "In Progress"
      ).length;
      this.stats["Done"] = this.children.filter(
        issue => issue.statusCategory === "Done"
      ).length;
    }
  }
});
</script>
