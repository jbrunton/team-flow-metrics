<template>
  <div class="issues">
    <h1 class="title">Issues</h1>

    <section class="content columns">
      <b-field label="Search" class="column is-half">
        <b-input v-model="searchQuery"></b-input>
      </b-field>
      <b-field label="Issue Type" class="column">
        <b-dropdown
          v-model="selectedIssueTypes"
          multiple
          aria-role="list"
          class="is-fullwidth"
        >
          <button class="button is-primary" type="button" slot="trigger">
            <span>{{ selectedIssueTypes.join(", ") }}</span>
            <b-icon icon="menu-down"></b-icon>
          </button>

          <b-dropdown-item
            v-for="issueType in issueTypes"
            :value="issueType"
            :key="issueType"
            aria-role="listitem"
          >
            <span>{{ issueType }}</span>
          </b-dropdown-item>
        </b-dropdown>
      </b-field>
      <b-field label="Status" class="column">
        <b-dropdown
          v-model="selectedStatuses"
          multiple
          aria-role="list"
          class="is-fullwidth"
        >
          <button class="button is-primary" type="button" slot="trigger">
            <span>{{ selectedStatuses.join(", ") }}</span>
            <b-icon icon="menu-down"></b-icon>
          </button>

          <b-dropdown-item
            v-for="status in statuses"
            :value="status"
            :key="status"
            aria-role="listitem"
          >
            <span>{{ status }}</span>
          </b-dropdown-item>
        </b-dropdown>
      </b-field>
    </section>

    <IssuesList :issues="results" />
  </div>
</template>

<style lang="scss" scoped>
.tag:not(body) {
  width: 100%;
}
</style>

<script lang="ts">
import Vue from "vue";
import IssuesList from "@/components/IssuesList.vue";
import { Issue } from "metrics-api/models/types";
import { formatDate } from "../helpers/date_helper";
import { formatNumber } from "../helpers/format_helper";
import { fetchIssues } from "../api/http";

export default Vue.extend({
  name: "Issues",
  components: {
    IssuesList
  },
  data() {
    return {
      issues: [],
      searchQuery: "",
      selectedIssueTypes: [],
      selectedStatuses: []
    };
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    results: function() {
      return this.issues.filter(issue => {
        return (
          this.matchQuery(issue) &&
          this.matchIssueType(issue) &&
          this.matchStatus(issue)
        );
      });
    },
    issueTypes: function() {
      return Array.from(new Set(this.issues.map(issue => issue.issueType)));
    },
    statuses: function() {
      return Array.from(new Set(this.issues.map(issue => issue.status)));
    }
  },
  methods: {
    async fetchData() {
      const issues = await fetchIssues();
      this.issues = issues;
    },
    formatDate,
    formatNumber,
    matchQuery(issue: Issue) {
      const query = this.searchQuery.trim();
      if (query === "") {
        return true;
      }
      return issue.key.includes(query) || issue.title.includes(query);
    },
    matchIssueType(issue: Issue) {
      if (!this.selectedIssueTypes.length) {
        return true;
      }
      return this.selectedIssueTypes.includes(issue.issueType);
    },
    matchStatus(issue: Issue) {
      if (!this.selectedStatuses.length) {
        return true;
      }
      return this.selectedStatuses.includes(issue.status);
    }
  }
});
</script>
