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
                <td>
                  <StatusTag
                    :status="issue.status"
                    :statusCategory="issue.statusCategory"
                  ></StatusTag>
                </td>
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
                  <router-link
                    v-if="issue.epicKey"
                    :to="{
                      name: 'IssueDetails',
                      params: { key: issue.epicKey }
                    }"
                  >
                    {{ issue.epicKey }}
                  </router-link>
                  {{ this.parent ? `- ${this.parent.title}` : "" }}
                </td>
              </tr>
            </table>
          </div>
        </nav>

        <nav v-if="children" class="panel">
          <p class="panel-heading">
            Issues In Epic
          </p>
          <div class="panel-block">
            <table class="table" style="width: 100%;">
              <tr>
                <th colspan="2">Issue</th>
                <th>Status</th>
              </tr>
              <tr v-for="child in children" :key="child.id">
                <td>
                  <router-link
                    :to="{ name: 'IssueDetails', params: { key: child.key } }"
                  >
                    {{ child.key }}
                  </router-link>
                </td>
                <td>{{ child.title }}</td>
                <td>
                  <StatusTag
                    :status="child.status"
                    :statusCategory="child.statusCategory"
                  ></StatusTag>
                </td>
              </tr>
            </table>
          </div>
        </nav>
      </div>
      <div class="column">
        <nav class="panel" v-if="issue && issue.issueType === 'Epic'">
          <p class="panel-heading">
            Reports
          </p>
          <div class="panel-block">
            <router-link
              :to="{ name: 'EpicReport', params: { key: issue.key } }"
            >
              Epic Report
            </router-link>
          </div>
        </nav>
        <nav class="panel">
          <p class="panel-heading">
            Status History
          </p>
          <div class="panel-block is-flex-direction-column">
            <table v-if="issue" class="table" style="width: 100%;">
              <tr>
                <th style="width: 35%;">Started</th>
                <td>{{ issue.started }}</td>
              </tr>
              <tr>
                <th style="width: 35%;">Completed</th>
                <td>{{ issue.completed }}</td>
              </tr>
              <tr>
                <th style="width: 35%;">Cycle Time</th>
                <td>
                  {{
                    issue.cycleTime !== null ? issue.cycleTime.toFixed(2) : "-"
                  }}
                </td>
              </tr>
            </table>

            <h2 class="subtitle">Transitions</h2>
            <table v-if="issue" class="table" style="width: 100%;">
              <tr
                v-for="(transition, index) in issue.transitions"
                :key="`transition-${index}`"
              >
                <td>{{ formatTime(transition.date) }}</td>
                <td :class="categoryClass(transition.fromStatus.category)">
                  {{ transition.fromStatus.name }}
                </td>
                <td style="text-align: center;">→</td>
                <td :class="categoryClass(transition.toStatus.category)">
                  {{ transition.toStatus.name }}
                </td>
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
import StatusTag from "@/components/StatusTag.vue";
import { fetchIssueChildren, fetchIssueDetails } from "@/api/http";
import { formatTime } from "../helpers/date_helper";

export default Vue.extend({
  name: "IssueDetails",
  props: {
    issueKey: String
  },
  components: {
    StatusTag
  },
  data() {
    return {
      issue: null,
      parent: null,
      children: null
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const issue = await fetchIssueDetails(this.issueKey);
      this.issue = issue;

      if (this.issue.epicKey) {
        const parent = await fetchIssueDetails(this.issue.epicKey);
        this.parent = parent;
      }

      if (this.issue.issueType === "Epic") {
        const children = await fetchIssueChildren(this.issueKey);
        this.children = children;
      }
    },
    categoryClass(category: string): string {
      const statusTypes = {
        "To Do": "is-to-do",
        "In Progress": "is-in-progress",
        Done: "is-done"
      };
      return `${statusTypes[category]}-bg`;
    },
    formatTime
  },
  computed: {
    title() {
      if (!this.issue) {
        return this.issueKey;
      }
      return `${this.issueKey} – ${this.issue.title}`;
    }
  }
});
</script>
