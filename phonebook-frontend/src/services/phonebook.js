import axios from 'axios'
const baseUrl = '/api/persons'

// Helper functions
const handleResponse = action => res => {
  const returnValue = action === 'DELETE' ? res.statusText : res.data
  console.log(`${action} response:`, returnValue)
  return returnValue
}

// Public methods
const getAll = () => (
  axios
    .get(baseUrl)
    .then(handleResponse('GET'))
)

const addPerson = person => (
  axios
    .post(baseUrl, person)
    .then(handleResponse('POST'))
)

const updatePerson = person => (
  axios
    .put(`${baseUrl}/${person.id}`, person)
    .then(handleResponse('PUT'))
)

const deletePerson = id => (
  axios
    .delete(`${baseUrl}/${id}`)
    .then(handleResponse('DELETE'))
)

export default { getAll, addPerson, updatePerson, deletePerson }