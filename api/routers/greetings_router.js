const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  res.json({
    greeting: 'Hello, world!'
  })
})

module.exports = {
  routerPath: '/greetings',
  router: router
}
