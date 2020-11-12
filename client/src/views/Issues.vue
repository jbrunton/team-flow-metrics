<template>
  <div class="issues">
    <h1>Issues</h1>

    <b-table :data="issues" :narrowed="true" :striped="true">
      <b-table-column width="120px" field="key" label="Key" v-slot="props">
        <router-link
          :to="{ name: 'IssueDetails', params: { key: props.row.key } }"
        >
          {{ props.row.key }}
        </router-link>
        <a :href="props.row.externalUrl" target="_blank">
          <b-icon icon="open-in-new" size="is-small"></b-icon>
        </a>
      </b-table-column>
      <b-table-column field="title" label="Title" v-slot="props">
        {{ props.row.title }}
      </b-table-column>
      <b-table-column field="issueType" label="Type" v-slot="props">
        {{ props.row.issueType }}
      </b-table-column>
      <b-table-column field="status" label="Status" v-slot="props">
        <StatusTag
          :status="props.row.status"
          :statusCategory="props.row.statusCategory"
        ></StatusTag>
      </b-table-column>
      <b-table-column field="childCount" label="Children" v-slot="props">
        {{ props.row.childCount }}
      </b-table-column>
      <b-table-column
        width="200px"
        field="started"
        label="Started"
        v-slot="props"
      >
        {{ props.row.started }}
      </b-table-column>
      <b-table-column
        width="200px"
        field="completed"
        label="Completed"
        v-slot="props"
      >
        {{ props.row.completed }}
      </b-table-column>
      <b-table-column
        width="120px"
        field="cycleTime"
        label="Cycle Time"
        v-slot="props"
      >
        {{ props.row.cycleTime }}
      </b-table-column>
    </b-table>
  </div>
</template>

<style scoped>
.tag:not(body) {
  width: 100%;
}
</style>

<script lang="ts">
import Vue from "vue";
import StatusTag from "@/components/StatusTag.vue";
import axios from "axios";
import moment from "moment";
import { formatTimeString } from "../helpers/date_helper";

export default Vue.extend({
  name: "Issues",
  components: {
    StatusTag
  },
  data() {
    return {
      issues: [],
      columns: [
        { field: "key", label: "Key" },
        { field: "title", label: "Title" },
        { field: "issueType", label: "Issue Type" },
        { field: "started", label: "Started" },
        { field: "completed", label: "Completed" },
        { field: "cycleTime", label: "Cycle Time" }
      ]
    };
  },
  mounted() {
    const statusTypes = {
      "To Do": "is-to-do",
      "In Progress": "is-in-progress",
      Done: "is-done"
    };
    axios.get(`/api/issues`).then(response => {
      this.issues = response.data.issues.map(issue => {
        return {
          key: issue.key,
          title: issue.title,
          issueType: issue.issueType,
          externalUrl: issue.externalUrl,
          status: issue.status,
          statusCategory: issue.statusCategory,
          statusType: statusTypes[issue.statusCategory],
          childCount: issue.childCount,
          started: formatTimeString(issue.started),
          completed: formatTimeString(issue.completed),
          cycleTime: this.formatNumber(issue.cycleTime)
        };
      });
    });
  },
  methods: {
    moment: moment,
    formatNumber(number) {
      if (!number) {
        return "-";
      }
      return number.toFixed(2);
    }
  }
});
</script>
