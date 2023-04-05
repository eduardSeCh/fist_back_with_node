const mongoose = require('mongoose')
const { server } = require('../index')
const Note = require('../models/Note')
const { initialNotes, api, getAllContentFromNotes } = require('./helpers/helpers')

beforeEach(async () => {
  await Note.deleteMany({})

  for (const note of initialNotes) {
    const noteObject = new Note(note)
    await noteObject.save()
  }
})

test('Notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('There are two notes', async () => {
  const response = await api.get('/api/notes')
  expect(response.body).toHaveLength(initialNotes.length)
})

test('One note is about prueba', async () => {
  const { contents } = await getAllContentFromNotes()
  expect(contents).toContainEqual('Prueba test 1')
})

// --- POST ---
test('a valid note can be added', async () => {
  const newNote = {
    content: 'Prueba test post',
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { contents, response } = await getAllContentFromNotes()

  expect(response.body).toHaveLength(initialNotes.length + 1)
  expect(contents).toContain(newNote.content)
})

test('note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const response = await api.get('/api/notes')
  expect(response.body).toHaveLength(initialNotes.length)
})

// -- DELETE --
test('note can be deleted', async () => {
  const { response: firstResponse } = await getAllContentFromNotes()
  const { body: notes } = firstResponse
  const [noteToDelete] = notes
  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const { contents, response: secondResponse } = await getAllContentFromNotes()
  expect(secondResponse.body).toHaveLength(initialNotes.length - 1)

  expect(contents).not.toContain(noteToDelete.content)
})

test('note that do not exist can not be deleted', async () => {
  await api
    .delete('/api/notes/643c784ca751923e363832b5')
    .expect(204)

  const { response } = await getAllContentFromNotes()
  expect(response.body).toHaveLength(initialNotes.length)
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
