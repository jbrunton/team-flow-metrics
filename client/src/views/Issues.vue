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

    <b-table
      class="is-compact-table"
      :data="results"
      :narrowed="true"
      :striped="true"
      :paginated="true"
    >
      <b-table-column
        width="120px"
        field="key"
        label="Key"
        v-slot="props"
        sortable
      >
        <router-link
          :to="{ name: 'IssueDetails', params: { key: props.row.key } }"
        >
          {{ props.row.key }}
        </router-link>
        <a :href="props.row.externalUrl" target="_blank">
          <b-icon icon="open-in-new" size="is-small"></b-icon>
        </a>
      </b-table-column>
      <b-table-column field="title" label="Title" v-slot="props" sortable>
        {{ props.row.title }}
      </b-table-column>
      <b-table-column field="issueType" label="Type" v-slot="props" sortable>
        {{ props.row.issueType }}
      </b-table-column>
      <b-table-column
        width="120px"
        field="status"
        label="Status"
        v-slot="props"
        sortable
      >
        <StatusTag
          :status="props.row.status"
          :statusCategory="props.row.statusCategory"
        ></StatusTag>
      </b-table-column>
      <b-table-column field="childCount" label="Issues" v-slot="props" sortable>
        {{ props.row.childCount }}
      </b-table-column>
      <b-table-column
        field="percentDone"
        label="Progress"
        width="100px"
        v-slot="props"
        sortable
        cell-class="col-v-align"
      >
        <router-link
          :to="{ name: 'IssueDetails', params: { key: props.row.key } }"
        >
          <b-progress
            type="is-done"
            v-if="props.row.percentDone !== null"
            :value="props.row.percentDone"
            show-value
            format="percent"
          ></b-progress>
        </router-link>
      </b-table-column>
      <b-table-column
        width="120px"
        field="created"
        label="Created"
        v-slot="props"
        sortable
      >
        {{ formatDate(props.row.created) }}
      </b-table-column>
      <b-table-column
        width="120px"
        field="started"
        label="Started"
        v-slot="props"
        sortable
      >
        {{ formatDate(props.row.started) }}
      </b-table-column>
      <b-table-column
        width="120px"
        field="completed"
        label="Completed"
        v-slot="props"
        sortable
      >
        {{ formatDate(props.row.completed) }}
      </b-table-column>
      <b-table-column
        width="120px"
        field="cycleTime"
        label="Cycle Time"
        v-slot="props"
        sortable
      >
        {{ formatNumber(props.row.cycleTime) }}
      </b-table-column>
    </b-table>
  </div>
</template>

<style lang="scss" scoped>
.tag:not(body) {
  width: 100%;
}
</style>

<script lang="ts">
import Vue from "vue";
import StatusTag from "@/components/StatusTag.vue";
import axios from "axios";
import moment from "moment";
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
    StatusTag
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
    moment: moment,
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
