import React from 'react'
import PropTypes from 'prop-types'
import fetch from 'node-fetch'
import FormData from 'form-data'

class Uploader extends React.Component {
  constructor (props) {
    super(props)
    this.file = ''
    this.state = { jump: '' }
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
          this.props.onComplete(json.wavfile, json.segInfo)
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

Uploader.propTypes = {
  onComplete: PropTypes.func
}

export default Uploader
