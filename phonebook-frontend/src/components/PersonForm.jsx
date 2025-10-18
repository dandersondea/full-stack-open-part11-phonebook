const PersonForm = ({ data, onSubmit, onChange }) => (
  <form onSubmit={onSubmit}>
    <div>name:    <input id='name'    value={data.name}    onChange={onChange}/></div>
    <div>number:  <input id='number'  value={data.number}  onChange={onChange}/></div>
    <div><button type="submit">add</button>
    </div>
  </form>
)

export default PersonForm