<template>
  <div class="field">
    <b-checkbox v-model="input">
      Exclude outliers
    </b-checkbox>
    <a href="#" class="b-tooltips" @click="active = !active">
      <b-tooltip position="is-right" type="is-light" :active="active" always>
        <b-icon icon="help-circle"></b-icon>
        <template v-slot:content>
          <span>
            Outliers are identified using the Tukey Fence method. See
            <a
              href="https://github.com/jbrunton/team-flow-metrics/wiki/Outliers"
              >the wiki</a
            >
            for more on the uses and flaws of this method
          </span>
          <a href="#">
            <b-icon
              icon="close"
              @click="active = false"
              size="is-small"
            ></b-icon>
          </a>
        </template>
      </b-tooltip>
    </a>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: ["value"],
  data() {
    return {
      input: this.value,
      active: false
    };
  },
  watch: {
    value(value) {
      this.input = value;
    },
    input(input) {
      this.$emit("input", input);
    }
  }
});
</script>
