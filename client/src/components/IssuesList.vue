<template>
  <b-table :data="issues" :narrowed="true" :striped="true" :paginated="true">
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
      <router-link :to="{ name: 'EpicReport', params: { key: props.row.key } }">
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
      width="150px"
      field="lastTransition"
      label="Last Transition"
      v-slot="props"
      sortable
    >
      {{ formatDate(props.row.lastTransition) }}
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
</template>

<script lang="ts">
import Vue from "vue";
import { formatDate } from "../helpers/date_helper";
import { formatNumber } from "../helpers/format_helper";
import StatusTag from "@/components/StatusTag";

export default Vue.extend({
  name: "IssuesList",
  props: {
    issues: Array
  },
  components: {
    StatusTag
  },
  methods: {
    formatDate,
    formatNumber
  }
});
</script>
