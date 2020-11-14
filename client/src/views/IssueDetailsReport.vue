<template>
  <IssueDetails :issueKey="this.$route.params.key"></IssueDetails>
</template>

<script lang="ts">
import Vue from "vue";
import IssueDetails from "@/components/IssueDetails.vue";

export default Vue.extend({
  name: "IssueDetailsReport",
  components: {
    IssueDetails
  }
});
</script>
