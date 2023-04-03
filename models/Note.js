const { Schema, model } = require('mongoose')

const noteSechema = new Schema({
  content: String,
  date: Date,
  important: Boolean
})

noteSechema.set('toJSON', { // Change json fomart response
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Note = model('Note', noteSechema)

module.exports = Note

/* Note.find({}).then(result => {
  console.log(result)
  mongoose.connection.close()
}) */

/* const note = new Note({
  content: 'MongoDB, usando prueba 1',
  date: new Date(),
  important: false
})

note.save()
  .then(result => {
    console.log(result)
    mongoose.connection.close()
  })
  .catch(err => {
    console.error(err)
  }) */
