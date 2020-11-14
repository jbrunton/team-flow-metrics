<template>
  <div class="issue">
    <h1 class="title">
      <router-link :to="{ name: 'IssueDetails', params: { key: key } }">
        {{ key }}
      </router-link>
      <span v-if="epic">– {{ epic.title }}</span>
    </h1>

    <div class="columns">
      <div class="column is-half">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="title">{{ stats["Total"] }}</p>
              <p class="subtitle">Total</p>
            </div>
          </div>
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="title has-text-in-progress">
                {{ stats["In Progress"] }}
              </p>
              <p class="subtitle">In Progress</p>
            </div>
          </div>
          <div class="tile is-parent">
            <div class="tile is-child notification">
              <p class="title has-text-done">{{ stats["Done"] }}</p>
              <p class="subtitle">Done</p>
            </div>
          </div>
        </div>
        <b-progress
          type="is-done"
          :value="stats.percentDone"
          show-value
          format="percent"
        ></b-progress>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import axios from "axios";

export default Vue.extend({
  name: "EpicReport",
  data() {
    return {
      key: this.$route.params.key,
      epic: null,
      children: [],
      stats: {
        "To Do": null,
        "In Progress": null,
        Done: null,
        percentDone: null
      }
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      const issueResponse = await axios.get(`/api/issues/${this.key}`);
      this.epic = issueResponse.data.issue;

      const childrenResponse = await axios.get(
        `/api/issues/${this.epic.key}/children`
      );
      this.children = childrenResponse.data.issues;

      this.stats["Total"] = this.children.length;
      this.stats["In Progress"] = this.children.filter(
        issue => issue.statusCategory === "In Progress"
      ).length;
      this.stats["Done"] = this.children.filter(
        issue => issue.statusCategory === "Done"
      ).length;
      this.stats.percentDone = Math.round(
        (this.stats["Done"] / this.children.length) * 100
      );
    }
  }
});
</script>
