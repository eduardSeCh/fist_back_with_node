require('dotenv').config()
require('./mongo') // Conection db
const express = require('express')
const cors = require('cors')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

const Note = require('./models/Note') // Model Note
const app = express()

const logger = require('./loggerMiddleware')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')
const userRouter = require('./controllers/users')

app.use(cors())
app.use(express.json()) // Habilitar request.boy

app.use(logger)

Sentry.init({
  dsn: 'https://7d440f3a60424ec7b0e1ae062f6b0962@o4504950975627264.ingest.sentry.io/4504950977789952',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
    // Automatically instrument Node.js libraries and frameworks
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.get('/', (request, response) => {
  response.send('<h1>hello word in home</h1>')
})

app.get('/api/notes', async (request, response) => {
  // Note.find({}).then(notes => {
  //   response.json(notes)
  // }).catch((err) => {
  //   console.error(err)
  // })
  const notes = await Note.find({})
  response.json(notes)
})

app.get('/api/notes/:id', (request, response, next) => {
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

app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params
  // notes = notes.filter(note => note.i !== id)
  // Note.findByIdAndRemove(id).then(result => {
  //   response.status(204).end()
  // }).catch(err => next(err))

  await Note.findByIdAndDelete(id)
  response.status(204).end()
})

app.post('/api/notes', async (request, response, next) => {
  const note = request.body
  console.log(note)

  // envio obligatorio
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  /* const ids = notes.map(note => note.i)
  const maxId = Math.max(...ids) */

  const newNote = new Note({
    content: note.content,
    important: typeof note.important !== 'undefined' ? note.important : false,
    date: new Date()
  })

  // Añadir nueva nota a notas
  /* notes = [...notes, newNote] */

  // newNote.save().then(saveNote => {
  //   response.json(saveNote)
  // })
  try {
    const saveNote = await newNote.save()
    response.json(saveNote)
  } catch (error) {
    next(error)
  }

  // Response 201 & new note
  /* response.status(201).json(newNote) */
})

app.put('/api/notes/:id', (request, response, next) => {
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

app.use('/api/users', userRouter)

app.use(Sentry.Handlers.errorHandler())

app.use(notFound)
app.use(handleErrors)

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
