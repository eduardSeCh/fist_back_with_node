const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/User')

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', {
    content: 1, // just content
    date: 1, // and date
    _id: 0
  }) // model/User.notes
  response.json(users)
})

userRouter.post('/', async (request, response) => {
  try {
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
  } catch (error) {
    response.status(400).json(error)
  }
})

module.exports = userRouter
