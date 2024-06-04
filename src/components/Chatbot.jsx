import React, {useState} from "react"
import axios from "axios"

const Chatbot = () => {
    const [input, setInput] = useState('')
    const [response, setResponse] = useState('')
  
    const handleSubmit = async(event) => {
        event.preventDefault()
        try {
            const res = await axios.post('http://localhost:3000/api/chat', { input })
            console.log(res.data.output)
            setResponse(res.data.output)
            // setResponse(res)
        }catch (error) {
            console.error('Error', error)
            setResponse('Something went wrong while fetching response')
        }
    }
  
    return(
      <div>
        <h1>Eth-Mentor</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            style={{width: "80vw"}}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your Ethereum mentor is here. Ask anything about Ethereum"
          />
          <br />
          <button type="submit">Enter</button>
        </form>
        <p>{response && <div><strong>Response:</strong>{response}</div>}</p>
      </div>
    )
  }

  export default Chatbot