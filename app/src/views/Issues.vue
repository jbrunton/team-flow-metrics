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

export default Vue.extend({
  name: "Issues",
  data: () => ({
    issues: [
      { key: 'DEMO-101', title: 'Demo Issue 101' },
      { key: 'DEMO-102', title: 'Demo Issue 102' }
    ]
  })
});
</script>
