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
              <b-menu-list label="Relative" style="whitespace: no-wrap;">
                <b-dropdown-item
                  v-for="range in relativeDayRanges"
                  :key="range.description"
                  aria-role="menuitem"
                  @click="selectRange(range)"
                >
                  {{ range.description }}
                </b-dropdown-item>
              </b-menu-list>
            </b-menu>
            <b-menu class="column">
              <b-menu-list
                label="Calendar Months"
                style="white-space: no-wrap;"
              >
                <b-dropdown-item
                  v-for="range in relativeMonthRanges"
                  :key="range.description"
                  aria-role="menuitem"
                  @click="selectRange(range)"
                >
                  {{ range.description }}
                </b-dropdown-item>
              </b-menu-list>
            </b-menu>
            <b-menu class="column">
              <b-menu-list label="Calendar Weeks" style="white-space: no-wrap;">
                <b-dropdown-item
                  v-for="range in relativeWeekRanges"
                  :key="range.description"
                  aria-role="menuitem"
                  @click="selectRange(range)"
                >
                  {{ range.description }}
                </b-dropdown-item>
              </b-menu-list>
            </b-menu>
          </div>
        </b-dropdown-item>
      </b-dropdown>
    </p>
    <b-datepicker
      placeholder="Click to select..."
      v-model="fromDate"
      :date-formatter="formatDate"
    >
    </b-datepicker>
    <p class="control">
      <span class="button is-static">
        <b-icon icon="arrow-right"></b-icon>
      </span>
    </p>
    <b-datepicker
      placeholder="Click to select..."
      v-model="toDate"
      :date-formatter="formatDate"
    >
    </b-datepicker>
  </b-field>
</template>

<style lang="scss" scoped>
.menu-label,
.menu-list {
  white-space: nowrap;
}
.datepicker {
  width: 100%;
}
</style>

<script lang="ts">
import Vue from "vue";
import { DateTime } from "luxon";
import {
  formatDate,
  getRelativeDayRanges,
  getRelativeWeekRanges,
  getRelativeMonthRanges,
  getRelativeYearRanges,
  DateRange
} from "../helpers/date_helper";

export default Vue.extend({
  props: ["value"],
  data() {
    const [fromDate, toDate] = this.value;
    return {
      relativeDayRanges: getRelativeDayRanges(),
      relativeWeekRanges: getRelativeWeekRanges(),
      relativeMonthRanges: getRelativeMonthRanges(),
      relativeYearRanges: getRelativeYearRanges(),
      fromDate: fromDate.toJSDate(),
      toDate: toDate.toJSDate()
    };
  },
  methods: {
    selectRange(range: DateRange) {
      this.fromDate = range.fromDate.toJSDate();
      this.toDate = range.toDate.toJSDate();
    },
    formatDate
  },
  computed: {
    input() {
      return [
        DateTime.fromJSDate(this.fromDate),
        DateTime.fromJSDate(this.toDate)
      ];
    }
  },
  watch: {
    value(value) {
      this.fromDate = value[0].toJSDate();
      this.toDate = value[1].toJSDate();
    },
    input(newValue: [DateTime, DateTime], prevValue: [DateTime, DateTime]) {
      if (
        !newValue[0].equals(prevValue[0]) ||
        !newValue[1].equals(prevValue[1])
      ) {
        this.$emit("input", this.input);
      }
    }
  }
});
</script>
