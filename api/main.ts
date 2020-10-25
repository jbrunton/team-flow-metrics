const { createApp } = require('./app')
const port = 5000

createApp().then(app => {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })
});

