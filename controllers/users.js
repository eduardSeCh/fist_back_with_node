const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/User')

userRouter.post('/', async (request, response) => {
  const { body } = request
  const { username, name, password } = body

  const saltRound = 10
  const passwordHash = await bcrypt.hash(password, saltRound)
  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = userRouter
