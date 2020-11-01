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
        </template>
      </b-navbar>
    </div>

    <div class="container">
      <router-view />
    </div>
  </div>
</template>
