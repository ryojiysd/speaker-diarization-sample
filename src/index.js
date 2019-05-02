import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import fetch from 'node-fetch'
import FormData from 'form-data'

class Uploader extends React.Component {
  constructor (props) {
    super(props)
    this.file = ''
  }

  render () {
    const handleChangeFile = (e) => {
      this.file = e.target.files.item(0)
    }

    const uploadFile = () => {
      const data = new FormData()
      data.append('file', this.file)
      data.append('name', this.file.name)
      fetch('/api/upload', { method: 'POST', body: data })
        .then(res => res.json())
        .then(json => {
          console.log(json)
        })
    }

    return (
      <div>
        <input type='file' onChange={(e) => handleChangeFile(e)} />
        <button onClick={() => uploadFile()}>upload</button>
      </div>
    )
  }
}

const App = () => (
  <Router>
    <div>
      <Route exact path='/' component={Uploader} />
    </div>
  </Router>
)

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
