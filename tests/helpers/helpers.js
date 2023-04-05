const { app } = require('../../index')
const User = require('../../models/User')
const supertest = require('supertest')

const api = supertest(app)

const initialNotes = [
  {
    content: 'Prueba test 1',
    important: false,
    date: new Date()
  },
  {
    content: 'Chale xd',
    important: true,
    date: new Date()
  }
]

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/notes')
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

const getUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

module.exports = {
  api,
  initialNotes,
  getUsers,
  getAllContentFromNotes
}
