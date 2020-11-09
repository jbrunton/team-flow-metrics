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
            <table v-if="issue" class="table" style="width: 100%;">
              <tr>
                <th style="width: 35%;">Issue Type</th>
                <td>{{ issue.issueType }}</td>
              </tr>
              <tr>
                <th style="width: 35%;">Status</th>
                <td>{{ issue.status }}</td>
              </tr>
              <tr>
                <th style="width: 35%;">Resolution</th>
                <td>{{ issue.resolution }}</td>
              </tr>
              <tr>
                <th style="width: 35%;">Created</th>
                <td>{{ issue.created }}</td>
              </tr>
              <tr>
                <th style="width: 35%;">Parent</th>
                <td>
                  <a v-if="issue.parentKey">{{ issue.parentKey }}</a>
                  {{ this.parent ? `- ${this.parent.title}` : "" }}
                </td>
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
            <table v-if="issue" class="table" style="width: 100%;">
              <tr
                v-for="transition in issue.transitions"
                :key="transition.date"
              >
                <td>{{ transition.date }}</td>
                <td>{{ transition.fromStatus.name }}</td>
                <td>→</td>
                <td>{{ transition.toStatus.name }}</td>
              </tr>
            </table>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
table tr:last-child {
  td,
  th {
    border: none;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

export default Vue.extend({
  name: "IssueDetails",
  data() {
    return {
      key: this.$route.params.key,
      issue: null,
      parent: null
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const issueResponse = await axios.get(`/api/issues/${this.key}`);
      this.issue = issueResponse.data.issue;

      if (this.issue.parentKey) {
        const parentResponse = await axios.get(
          `/api/issues/${this.issue.parentKey}`
        );
        this.parent = parentResponse.data.issue;
      }
    }
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
