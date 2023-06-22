import React, { useState, Dispatch, SetStateAction, useEffect } from "react"
import Parser from "html-react-parser"

interface commandResponse {
  result: boolean
  query: string
  response: HTMLElement
  // response: Promise<HTMLElement>
  //maybe make response Promise<HTMLElement>
}

function DisplayREPLresponse({ display }: { display: commandResponse }) {
  return (
    <div className="sampleHTMLContent">
      {Parser(display.response.outerHTML)}
    </div>
  )
}

async function mockCommand(
  command_name: string,
  command_body: string[]
): Promise<commandResponse> {
  const responseObj = document.createElement("p")
  responseObj.textContent = command_body.join(" ") + "i"

  return {
    result: true,
    query: command_name,
    response: responseObj,
  }
}

//note: commands should actually be taking in a list of strings (as is standard convention)
let commandLibrary: Map<
  //store in state
  string,
  (command_name: string, command_body: string[]) => Promise<commandResponse>
> = new Map()
commandLibrary.set("mock", mockCommand)

async function parseCommandQuery(query: string): Promise<commandResponse> {
  const query_split = query.split(" ")
  const command_name = query_split[0]
  const command_body = query_split.slice(1)

  const commandFunc = commandLibrary.get(command_name)
  if (commandFunc) {
    return await commandFunc(command_name, command_body)
  } else {
    const returnVal = document.createElement("p")
    returnVal.textContent = "value not found" //should be a constant but I don't care
    return { result: false, query: command_name, response: returnVal }
  }
}

interface AcceptREPLresponseProps {
  addRequest: (request: commandResponse) => any
  setNotification: Dispatch<SetStateAction<string>>
}
function AcceptREPLresponse({
  addRequest,
  setNotification,
}: AcceptREPLresponseProps) {
  const [query, setQuery] = useState<string>("")
  const [response, setResponse] = useState<commandResponse>()

  return (
    <div className="REPLInput">
      <div className="accept-input">
        <input
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
        ></input>
      </div>
      <div className="submitButton">
        <button
          onClick={async () => {
            if (query != "") {
              const commandResponse = await parseCommandQuery(query)
              addRequest(commandResponse)
              if (!commandResponse.result) {
                setNotification("Invalid command")
              } else {
                setNotification("")
              }
              setQuery("")
            }
          }}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default function REPL() {
  const [REPLHistory, setREPLHistory] = useState<commandResponse[]>([])
  const [notification, setNotif] = useState("")

  //really great idea from another group: they store the data as a list of promises
  //to prevent undefined from getting rendered. Another implementation would be for me to put
  //pending (but this seems like weak design)

  //maybe store as HTML elements? Unclear. Promise<HTMLElement>
  return (
    <div className="App">
      {REPLHistory.map((REPLRequest, REPLRequestNum) => (
        <DisplayREPLresponse display={REPLRequest} key={REPLRequestNum} />
      ))}
      <AcceptREPLresponse
        addRequest={(response: commandResponse) => {
          const newResponses = REPLHistory.slice()
          newResponses.push(response)
          setREPLHistory(newResponses)
        }}
        setNotification={setNotif}
      />
      {notification}
    </div>
  )
}
