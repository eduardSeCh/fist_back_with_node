module.exports = (err, request, response, next) => {
  console.error(err)
  console.log(err.name)
  err.name === 'CastError'
    ? response.status(400).send({ error: 'Id is malformed' })
    : response.status(500).end()
}
