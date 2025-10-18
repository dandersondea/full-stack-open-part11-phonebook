const Persons = ({ persons, searchString, onClickDelete }) => {
  // Copy and filter persons
  let personsCopy = [...persons]
  if (searchString) {
    personsCopy = personsCopy.filter(person => (
      person.name.toLowerCase().
        startsWith(searchString.toLowerCase())
    ))
  }

  console.log(`Persons ${searchString && '[filtered]'}:`, personsCopy)
  return (
    <div>
      {personsCopy.map(person =>
        <Person
          person={person}
          onClickDelete={() => onClickDelete(person.id)}
          key={person.id}
        />
      )}
    </div>
  )
}

const Person = ({ person, onClickDelete }) => (
  <div>
    <span>{person.name} {person.number} </span>
    <button onClick={onClickDelete}>delete</button>
  </div>
)

export default Persons