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
        <td>{{ issue.started ? moment(issue.started).toString() : null }}</td>
        <td>{{ issue.completed ? moment(issue.completed).toString() : null }}</td>
        <td>{{ issue.cycleTime ? issue.cycleTime.toFixed(2) : null }}</td>
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
    moment: moment
  }
});
</script>
