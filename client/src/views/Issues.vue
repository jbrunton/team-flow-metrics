<template>
  <div class="issues">
    <h1>Issues</h1>

    <table>
      <tr v-for="issue in issues" v-bind:key="issue.key">
        <td>{{ issue.key }}</td>
        <td>{{ issue.title }}</td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from 'axios';
import { API_URL } from '../config';

export default Vue.extend({
  name: "Issues",
  data () {
    return {
      issues: []
    }
  },
  mounted () {
    axios.get(`${API_URL}/issues`).then(response => {
      console.log(response)
    })
  }
})
</script>
