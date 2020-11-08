<template>
  <div class="issues">
    <h1>Issues</h1>

    <b-table :data="issues">
      <b-table-column field="key" label="Key" v-slot="props">
        {{ props.row.key }}
        <a :href="props.row.externalUrl" target="_blank">
          <b-icon icon="open-in-new" size="is-small"></b-icon>
        </a>
      </b-table-column>
      <b-table-column field="title" label="Title" v-slot="props">
        {{ props.row.title }}
      </b-table-column>
      <b-table-column field="issueType" label="Issue Type" v-slot="props">
        {{ props.row.issueType }}
      </b-table-column>
      <b-table-column field="status" label="Status" v-slot="props">
        <b-tag :type="props.row.statusType">{{ props.row.status }}</b-tag>
      </b-table-column>
      <b-table-column field="childCount" label="Children" v-slot="props">
        {{ props.row.childCount }}
      </b-table-column>
      <b-table-column field="started" label="Started" v-slot="props">
        {{ props.row.started }}
      </b-table-column>
      <b-table-column field="completed" label="Completed" v-slot="props">
        {{ props.row.completed }}
      </b-table-column>
      <b-table-column field="cycleTime" label="Cycle Time" v-slot="props">
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
import axios from "axios";
import moment from "moment";

export default Vue.extend({
  name: "Issues",
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
      "To Do": "",
      "In Progress": "is-success",
      Done: "is-primary"
    };
    axios.get(`/api/issues`).then(response => {
      this.issues = response.data.issues.map(issue => {
        return {
          key: issue.key,
          title: issue.title,
          issueType: issue.issueType,
          externalUrl: issue.externalUrl,
          status: issue.status,
          statusType: statusTypes[issue.status],
          childCount: issue.childCount,
          started: this.formatDate(issue.started),
          completed: this.formatDate(issue.completed),
          cycleTime: this.formatNumber(issue.cycleTime)
        };
      });
    });
  },
  methods: {
    moment: moment,
    formatDate(date) {
      if (!date) {
        return "-";
      }
      return moment(date).format("DD MMM YYYY hh:mm Z");
    },
    formatNumber(number) {
      if (!number) {
        return "-";
      }
      return number.toFixed(2);
    }
  }
});
</script>
