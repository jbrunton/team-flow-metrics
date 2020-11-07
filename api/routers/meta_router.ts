import * as express from 'express';
import { Field } from '../models/entities/field';
const router = express.Router()
const {getRepository} = require('typeorm')


router.get('/fields', async (req, res) => {
  const fields = await getRepository(Field).find()
  res.json({
    count: fields.length,
    fields: fields
  })
})

module.exports = {
  routerPath: '/meta',
  router: router
}
