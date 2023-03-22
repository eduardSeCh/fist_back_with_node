const express = require('express')
const cors = require('cors')

const app = express()
const logger = require('./loggerMiddleware')

app.use(cors())
app.use(express.json()) // Habilitar request.boy

app.use(logger)

let notes = [
  {
    i: 1,
    content: 'html is easy',
    date: '2019-05-30T17:30:31.098Z',
    important: true
  },
  {
    i: 2,
    content: 'Browser can execute only js',
    date: '2019-05-30T17:30:34.091Z',
    important: false
  },
  {
    i: 3,
    content: 'GET and PORT are important methods',
    date: '2019-05-30T17:20:14.298Z',
    important: true
  }
]

app.get('/', (request, response) => {
  response.send('<h1>hello word in home</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.i === id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.i !== id)
  console.log(notes.length)
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const note = request.body
  console.log(note)

  // envio obligatorio
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const ids = notes.map(note => note.i)
  const maxId = Math.max(...ids)

  const newNote = {
    i: maxId + 1,
    content: note.content,
    important: typeof note.important !== 'undefined' ? note.important : false,
    date: new Date().toISOString()
  }

  // Añadir nueva nota a notas
  notes = [...notes, newNote]
  // Response 201 & new note
  response.status(201).json(newNote)
})

app.use((request, response) => {
  response.status(404).json({
    error: 'Not found'
  })
  console.log('404')
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
