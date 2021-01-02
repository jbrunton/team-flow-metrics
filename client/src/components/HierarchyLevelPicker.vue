<template>
  <b-field label="Hierarchy Level">
    <b-select aria-role="list" v-model="input" expanded>
      <option
        v-for="level in hierarchyLevels"
        :value="level.name"
        :key="level.name"
      >
        {{ level.name }}
      </option>
    </b-select>
  </b-field>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

export default Vue.extend({
  props: ["value"],
  data() {
    return {
      hierarchyLevels: [],
      input: this.value
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const response = await axios.get("/api/meta/hierarchy-levels");
      this.hierarchyLevels = response.data.levels;
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
