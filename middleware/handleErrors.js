const ERROR_HANDLERS = {
  CastError: res => res.status(400).send({ error: 'Id is malformed' }),
  ValidationError: (res, { message }) => res.status(409).end({ error: message }),
  JsonWebTokenError: res => res.status(401).json({ error: 'token missing or invalid' }),
  TokenExpiredError: res => res.status(401).json({ error: 'token expired' }),
  defaultError: res => res.status(500).end()
}

module.exports = (err, request, response, next) => {
  console.log(err.name)

  const handler = ERROR_HANDLERS[err.name] || ERROR_HANDLERS.defaultError
  handler(response, err)
}
