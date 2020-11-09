<template>
  <div class="issue">
    <h1 class="title">{{ title }}</h1>

    <div class="columns">
      <div class="column">
        <nav class="panel">
          <p class="panel-heading">
            Summary
          </p>
          <div class="panel-block">
            <table class="table" style="width: 100%;">
              <tr>
                <th style="width: 35%;">Issue Type</th>
                <td>{{ issue.issueType }}</td>
              </tr>
            </table>
          </div>
        </nav>
      </div>
      <div class="column">
        <nav class="panel">
          <p class="panel-heading">
            Transitions
          </p>
          <div class="panel-block">
            <table class="table" style="width: 100%;"></table>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

export default Vue.extend({
  name: "IssueDetails",
  data() {
    return {
      key: this.$route.params.key,
      issue: null
    };
  },
  mounted() {
    axios.get(`/api/issues/${this.key}`).then(response => {
      this.issue = response.data.issue;
    });
  },
  computed: {
    title() {
      if (!this.issue) {
        return this.key;
      }
      return `${this.key} – ${this.issue.title}`;
    }
  }
});
</script>
