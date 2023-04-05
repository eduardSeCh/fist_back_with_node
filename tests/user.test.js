const mongoose = require('mongoose')
const { server } = require('../index')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { api, getUsers } = require('../tests/helpers/helpers')

describe.only('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('pwd', 10)
    const user = new User({ username: 'userTest', passwordHash })

    await user.save()
  })

  test('works as expected creating a fresh username', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      username: 'pruebaTestUser',
      name: 'test',
      password: '123'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
