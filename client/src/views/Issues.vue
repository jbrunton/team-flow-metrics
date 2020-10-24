<template>
  <div class="issues">
    <h1>Issues</h1>

    <table>
      <tr v-for="issue in issues" v-bind:key="issue.key">
        <td>{{ issue.key }}</td>
        <td>{{ issue.title }}</td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

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
  }
});
</script>
