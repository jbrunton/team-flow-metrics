<template>
  <div class="Fields">
    <h1>Fields</h1>

    <b-table :data="fields" :columns="columns"> </b-table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import moment from "moment";

export default Vue.extend({
  name: "Fields",
  data() {
    return {
      fields: [],
      columns: [{ field: "id", label: "ID" }]
    };
  },
  mounted() {
    axios.get(`/api/fields`).then(response => {
      this.issues = response.data.issues.map(issue => {
        return {
          key: issue.key,
          title: issue.title,
          issueType: issue.issueType,
          externalUrl: issue.externalUrl,
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
