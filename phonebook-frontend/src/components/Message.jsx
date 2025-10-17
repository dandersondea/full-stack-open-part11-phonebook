const Message = ({ text, type }) => {
  if (!text) return null

  let color
  if (type === 'success') color = 'green'
  else if (type === 'failure') color = 'red'
  else {
    console.log('Usage: Message({ text, type }). "type" in ("success", "failure")')
    return null
  }

  const style = {
    color: color,
    backgroundColor: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  return (
    <div style={style}>
      {text}
    </div>
  )
}

export default Message