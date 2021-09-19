<template>
  <b-field label="Resolution">
    <b-taginput
      v-model="input"
      :data="resolutions"
      placeholder="All"
      :allow-new="false"
      :open-on-focus="true">
    </b-taginput>
  </b-field>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

export default Vue.extend({
  props: ["value"],
  data() {
    return {
      resolutions: [],
      input: this.value
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const response = await axios.get("/api/meta/resolutions");
      this.resolutions = response.data.resolutions;
      console.log({ resolutions: this.resolutions })
    }
  },
  watch: {
    value() {
      this.input = this.value;
    },
    input() {
      this.$emit("input", this.input);
    }
  }
});
</script>
