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
import axios from "axios";
import { formatDate } from "../helpers/date_helper";
import { formatNumber } from "../helpers/format_helper";

type Issue = {
  key: string;
  title: string;
  issueType: string;
  externalUrl: string;
  status: string;
  statusCategory: string;
  childCount?: number;
  percentDone?: number;
  created?: Date;
  started?: Date;
  completed?: Date;
  cycleTime?: number;
};

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
    axios.get(`/api/issues`).then(response => {
      this.issues = response.data.issues.map(issue => {
        return {
          key: issue.key,
          title: issue.title,
          issueType: issue.issueType,
          externalUrl: issue.externalUrl,
          status: issue.status,
          statusCategory: issue.statusCategory,
          childCount: issue.childCount,
          percentDone: issue.percentDone,
          created: this.parseDate(issue.created),
          started: this.parseDate(issue.started),
          completed: this.parseDate(issue.completed),
          lastTransition: this.parseDate(issue.lastTransition),
          cycleTime: issue.cycleTime
        };
      });
    });
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
    formatDate,
    formatNumber,
    parseDate(input?: string): Date {
      if (!input) {
        return null;
      }
      return new Date(input);
    },
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
