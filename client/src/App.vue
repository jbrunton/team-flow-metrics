<template>
  <div id="app">
    <div class="container">
      <b-navbar>
        <template slot="brand">
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            Team Flow Metrics
          </b-navbar-item>
        </template>
        <template slot="start">
          <b-navbar-item tag="router-link" :to="{ path: '/issues' }">
            Search Issues
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/forecast' }">
            Forecast
          </b-navbar-item>
          <b-navbar-dropdown label="Charts" :hoverable="true">
            <b-navbar-item tag="router-link" :to="{ path: '/scatterplot' }">
              Scatterplot
            </b-navbar-item>
            <b-navbar-item tag="router-link" :to="{ path: '/cfd' }">
              CFD
            </b-navbar-item>
            <b-navbar-item tag="router-link" :to="{ path: '/throughput' }">
              Throughput
            </b-navbar-item>
          </b-navbar-dropdown>
        </template>
        <template slot="end">
          <b-navbar-item
            href="https://github.com/jbrunton/team-flow-metrics/"
            target="_blank"
          >
            <span class="icon-text">
              <b-icon icon="github"> </b-icon>
              <span>Source</span>
            </span>
          </b-navbar-item>
        </template>
      </b-navbar>
    </div>

    <div class="container">
      <router-view :key="$route.fullPath" />
    </div>
  </div>
</template>

<style lang="scss">
// Import Bulma's core
@import "~bulma/sass/utilities/_all";

$primary: #8c67ef;
$primary-light: findLightColor($primary);
$primary-dark: findDarkColor($primary);
$primary-invert: findColorInvert($primary);

$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: mergeColorMaps(
  (
    "white": (
      $white,
      $black
    ),
    "black": (
      $black,
      $white
    ),
    "light": (
      $light,
      $light-invert
    ),
    "dark": (
      $dark,
      $dark-invert
    ),
    "primary": (
      $primary,
      $primary-invert,
      $primary-light,
      $primary-dark
    ),
    "link": (
      $link,
      $link-invert,
      $link-light,
      $link-dark
    ),
    "success": (
      $success,
      $success-invert,
      $success-light,
      $success-dark
    ),
    "warning": (
      $warning,
      $warning-invert,
      $warning-light,
      $warning-dark
    ),
    "danger": (
      $danger,
      $danger-invert,
      $danger-light,
      $danger-dark
    ),
    "none": (
      rgb(199, 199, 199),
      $black
    ),
    "to-do": (
      #db2828,
      $white
    ),
    "in-progress": (
      #21ba45,
      $white
    ),
    "done": (
      #2185d0,
      $white
    ),
    "to-do-bg": (
      #ffcdd2,
      $black
    ),
    "in-progress-bg": (
      #c8e6c9,
      $black
    ),
    "done-bg": (
      #bbdefb,
      $black
    )
  ),
  $custom-colors
);

$tooltip-color: $primary-light;

$card-radius: 0.5rem;
$card-header-background-color: #eee;

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

.dropdown.is-fullwidth {
  display: flex;
  * {
    width: 100%;
    text-align: left;

    .icon {
      width: auto;
    }
  }
}

.b-table td.col-v-align {
  vertical-align: middle;
}

// fixes flickering behavior when cursor moves over tooltips
svg > g > g.google-visualization-tooltip {
  pointer-events: none;
}

.icon-text {
  align-items: flex-start;
  color: inherit;
  display: inline-flex;
  flex-wrap: wrap;
  vertical-align: top;

  .icon {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .icon:not(:first-child) {
    margin-left: 0.25em;
  }

  .icon:not(:last-child) {
    margin-right: 0.25em;
  }
}
</style>

<script lang="ts">
const ws = new WebSocket("ws://localhost:3001/api/ws");

ws.onerror = event => {
  console.error(event);
};

ws.onmessage = event => {
  console.log("message received:", event);
};
</script>
