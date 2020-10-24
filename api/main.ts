const app = require('./app')
const port = 5000

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
