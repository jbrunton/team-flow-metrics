<template>
  <b-tag style="font-weight: bold;" :type="type">{{ status }}</b-tag>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "StatusTag",
  props: {
    msg: String,
    status: String,
    statusCategory: String
  },
  computed: {
    type(): string {
      const statusTypes = {
        "To Do": "is-to-do",
        "In Progress": "is-in-progress",
        Done: "is-done"
      };
      return statusTypes[this.statusCategory];
    }
  }
});
</script>
