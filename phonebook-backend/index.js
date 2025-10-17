require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const Entry = require('./models/entry')


// Middleware
app.use(express.static('dist'))
app.use(express.json())

// Middleware -- Logging
morgan.token('body', (req) => (
  JSON.stringify(req.body)
))
app.use(morgan((tokens, req, res) => {
  let logging = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms'
  ]

  if (req.method === 'POST' && req.url === '/api/persons') {
    logging = logging.concat(JSON.stringify(req.body))
  }

  return logging.join(' ')
}))


// Helper functions
const nameExists = async (name) => {
  if(await Entry.findOne({ name: name }).exec()) return true
  else return false
}


// Routes
app.get('/info', async (req, res, next) => {
  try {
    const entries = await Entry.find({})
    const body = [
      `<p>Phonebook has info for ${entries.length} people</p>`,
      `<p>${Date()}</p>`
    ].join('\n')
    return res.send(body)
  } catch (err) {
    next(err)
  }
})


app.get('/api/persons', (req, res, next) => {
  Entry
    .find({})
    .then(entries => {
      return res.json(entries)
    })
    .catch(err => next(err))
})


app.get('/api/persons/:id', (req, res, next) => {
  Entry
    .findById(req.params.id)
    .then(entry => {
      if (entry) {
        console.log('Entry found')
        return res.json(entry)
      }
      else {
        const statusMessage = 'Entry not found'
        console.log(statusMessage)
        return res.status(404).json({
          error: statusMessage
        })
      }
    })
    .catch(err => next(err))
})


app.delete('/api/persons/:id', (req, res, next) => {
  Entry
    .findByIdAndDelete(req.params.id)
    .then(result => {
      const deletionStatus = result ? 'successful' : 'unsuccessful'
      const statusMessage = `Deletion ${deletionStatus}`
      console.log(statusMessage)
      res.statusMessage = statusMessage // Headers usually stripped away with Status Code 204
      return res.status(204).end()
    })
    .catch(err => next(err))
})


app.post('/api/persons', async (req, res, next) => {
  // Validate input
  const requiredFields = ['name', 'number']
  const missingField = requiredFields.find(field => !req.body[field])
  if (missingField) {
    return res.status(400).json({
      error: `Missing information: ${missingField}`
    })
  }

  if (await nameExists(req.body.name)) {
    return res.status(400).json({
      error: `Name must be unique: '${req.body.name}' already exists`
    })
  }

  // Add entry
  const entry = new Entry({
    name: req.body.name,
    number: req.body.number ? req.body.number : null,
  })

  entry
    .save()
    .then(result => {
      console.log(`Added ${result.name} number ${result.number} to phonebook`)
      return res.json(entry)
    })
    .catch(err => next(err))

})

app.put('/api/persons/:id', (req, res, next) => {
  Entry
    .findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        number: req.body.number
      },
      {
        new: true,
        runValidators: true
      }
    )
    .then(entry => {
      if (!entry) {
        const statusMessage = 'Entry not found'
        console.log(statusMessage)
        return res.status(404).json({
          error: statusMessage
        })
      }
      else {
        console.log(`Updated ${entry.name} number ${entry.number} in phonebook`)
        return res.json(entry)
      }
    })
    .catch(err => next(err))
})


// Middleware -- Unknown endpoint
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}
app.use(unknownEndpoint)


// Middleware -- Error handling
const errorHandler = (err, req, res, next) => {
  console.error(err.message)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted ID' })
  }
  else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  next(err)
}
app.use(errorHandler)


// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})