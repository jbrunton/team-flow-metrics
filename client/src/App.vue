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
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
// Import Bulma's core
@import "~bulma/sass/utilities/_all";

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: mergeColorMaps(
  (
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
    )
  ),
  $custom-colors
);

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";
</style>
