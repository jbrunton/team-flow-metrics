<template>
  <div class="issues">
    <h1>Issues</h1>

    <table>
      <thead>
        <tr>
          <th>
            Key
          </th>
          <th>
            Title
          </th>
          <th>
            Started
          </th>
          <th>
            Completed
          </th>
          <th>
            Cycle Time
          </th>
        </tr>
      </thead>
      <tr v-for="issue in issues" v-bind:key="issue.key">
        <td>{{ issue.key }}</td>
        <td>{{ issue.title }}</td>
        <td>{{ formatDate(issue.started) }}</td>
        <td>{{ formatDate(issue.completed) }}</td>
        <td>{{ formatNumber(issue.cycleTime) }}</td>
      </tr>
    </table>
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
      issues: []
    };
  },
  mounted() {
    axios.get(`/api/issues`).then(response => {
      this.issues = response.data.issues;
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
