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
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            Home
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/about' }">
            About
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/issues' }">
            Issues
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/scatterplot' }">
            Scatterplot
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

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: mergeColorMaps(
  (
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

$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

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

// fixes flickering behavior in tooltips
svg > g > g:last-child {
  pointer-events: none;
}
</style>
