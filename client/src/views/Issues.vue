<template>
  <div class="issues">
    <h1>Issues</h1>

    <b-table :data="issues" :columns="columns"></b-table>

  </div>
</template>

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
        { field: 'key', label: 'Key' },
        { field: 'title', label: 'Title' },
        { field: 'started', label: 'Started' },
        { field: 'completed', label: 'Completed' },
        { field: 'cycleTime', label: 'Cycle Time' }
      ]
    };
  },
  mounted() {
    axios.get(`/api/issues`).then(response => {
      this.issues = response.data.issues.map(issue => {
        return {
          key: issue.key,
          title: issue.title,
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
