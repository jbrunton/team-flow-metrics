<template>
  <b-field label="Date Range">
    <p class="control">
      <b-dropdown aria-role="list">
        <button class="button is-info" slot="trigger">
          <a
            ><b-icon icon="calendar-month-outline"></b-icon>
            <b-icon icon="menu-down"></b-icon
          ></a>
        </button>

        <b-dropdown-item custom>
          <div class="columns">
            <b-menu class="column">
              <b-menu-list label="Absolute" style="whitespace: no-wrap;">
                <b-menu-item
                  v-for="range in calendarMonthRanges"
                  :key="range.description"
                  aria-role="listitem"
                  :label="range.description"
                  @click="selectRange(range)"
                >
                </b-menu-item>
              </b-menu-list>
            </b-menu>
            <b-menu class="column">
              <b-menu-list label="Relative" style="white-space: no-wrap;">
                <b-menu-item
                  v-for="range in relativeDateRanges"
                  :key="range.description"
                  aria-role="listitem"
                  :label="range.description"
                  @click="selectRange(range)"
                >
                </b-menu-item>
              </b-menu-list>
            </b-menu>
          </div>
        </b-dropdown-item>
      </b-dropdown>
    </p>
    <b-datepicker
      placeholder="Click to select..."
      v-model="input"
      :date-formatter="formatDateRange"
      range
      style="width: 100%;"
    >
    </b-datepicker>
  </b-field>
</template>

<style lang="scss" scoped>
.menu-label,
.menu-list {
  white-space: nowrap;
}
</style>

<script lang="ts">
import Vue from "vue";
import {
  getDefaultDateRange,
  formatDateRange,
  getRelativeDateRanges,
  getCalendarMonthRanges,
  DateRange
} from "../helpers/date_helper";

export default Vue.extend({
  props: ["value"],
  data() {
    return {
      relativeDateRanges: getRelativeDateRanges(),
      calendarMonthRanges: getCalendarMonthRanges(),
      formatDateRange,
      input: getDefaultDateRange()
    };
  },
  methods: {
    selectRange(range: DateRange) {
      this.input = [range.fromDate, range.toDate];
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
