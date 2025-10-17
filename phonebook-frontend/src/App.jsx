import { useState, useEffect } from 'react'
import Search from './components/Search'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Message from './components/Message'
import phonebookService from './services/phonebook'
// cSpell:words phonebook

const App = () => {
  // Hooks: State
  const [persons,       setPersons]       = useState([])
  const [formData,      setFormData]      = useState({ name: '', number: '' })
  const [searchString,  setSearchString]  = useState('')
  const [message,  setMessage]            = useState({ text: '', type: 'success' })


  // Helper functions
  const resetPersons = () => {
    phonebookService
      .getAll()
      .then(setPersons) // Equivalent: .then(initialPersons => setPersons(initialPersons))
  }

  const findPerson = (identifier, method) => (
    persons.find(person => person[method] === identifier)
  )

  const resetForm = () => {
    setFormData({ name: '', number: '' })
  }

  const setTempMessage = (text, type, ms = 5000) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), ms)
  }


  // Hooks: Effect
  useEffect(() => {
    resetPersons()
  }, []) // Alternative to below: Set 'message' in the dependency array and refresh persons from the backend whenever a message is set (instead of processing locally)


  // Event handlers
  const handleSearchChange = (e) => {
    console.log('Search:', e.target.value)
    setSearchString(e.target.value)
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    console.log(`${id}: ${value}`)
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Entry:', formData)
    const personSubmitted = findPerson(formData.name, 'name')

    if (personSubmitted) { // PUT request
      if (confirm(`${formData.name} is already added to phonebook, replace the old number with a new one?`)) {
        phonebookService
          .updatePerson({ ...personSubmitted, number: formData.number })
          .then(returnedPerson => {
            setPersons(persons.map(person =>
              person.id === returnedPerson.id
                ? returnedPerson
                : person
            ))
            setTempMessage(`Updated ${returnedPerson.name}`, 'success')
            resetForm()
          })
          .catch((err) => {
            setTempMessage(err.response.data.error, 'failure')
            resetPersons()
          })
      }
    }

    else { // POST request
      phonebookService
        .addPerson(formData) // Let the server handle ID generation
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          resetForm()
          setTempMessage(`Added ${returnedPerson.name}`, 'success')
        })
        .catch(err => {
          setTempMessage(err.response.data.error, 'failure')
          resetPersons()
        })
    }
  }

  const handleDeletion = (id) => {
    const person = findPerson(id, 'id')
    if (confirm(`Delete ${person.name}?`)) {
      phonebookService
        .deletePerson(id)
        .then(() => {
          setTempMessage(`Deleted ${person.name}`, 'success')
        })
        .catch(() => {
          setTempMessage(`${person.name} was already removed from the server`, 'failure')
        })
        .finally(() => {
          setPersons(persons.filter(person => person.id !== id))
        })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Message
        text={message.text}
        type={message.type}
      />
      <Search
        value={searchString}
        onChange={handleSearchChange}
      />
      <h3>Add a new entry</h3>
      <PersonForm
        data={formData}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
      />
      <h3>Numbers</h3>
      <Persons
        persons={persons}
        searchString={searchString}
        onClickDelete={handleDeletion}
      />
    </div>
  )
}

export default App