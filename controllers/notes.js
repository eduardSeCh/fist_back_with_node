const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')
// notesRouter.get('/', (request, response) => {
//   response.send('<h1>hello word in home</h1>')
// })

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
})

notesRouter.get('/:id', (request, response, next) => {
  const { id } = request.params
  // const note = notes.find(note => note.i === id)

  Note.findById(id).then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  }).catch(err => {
    next(err)
    /* console.error(err.message)
    response.status(400).end() */
  })
})

notesRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const { id } = request.params
  // notes = notes.filter(note => note.i !== id)
  // Note.findByIdAndRemove(id).then(result => {
  //   response.status(204).end()
  // }).catch(err => next(err))

  await Note.findByIdAndDelete(id)
  response.status(204).end()
})

notesRouter.post('/', userExtractor, async (request, response, next) => {
  const {
    content, important = false
  } = request.body

  // get userId to request
  const { userId } = request
  const user = await User.findById(userId)

  // envio obligatorio
  if (!content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  /* const ids = notes.map(note => note.i)
  const maxId = Math.max(...ids) */

  const newNote = new Note({
    content,
    important,
    date: new Date(),
    user: user._id
  })

  // Añadir nueva nota a notas
  /* notes = [...notes, newNote] */

  // newNote.save().then(saveNote => {
  //   response.json(saveNote)
  // })
  try {
    const saveNote = await newNote.save()
    user.notes = user.notes.concat(saveNote._id)
    await user.save()
    response.json(saveNote)
  } catch (error) {
    next(error)
  }

  // Response 201 & new note
  /* response.status(201).json(newNote) */
})

notesRouter.put('/:id', userExtractor, (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      response.json(result)
    })
})

module.exports = notesRouter
