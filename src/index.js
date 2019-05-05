import React from 'react'
import ReactDOM from 'react-dom'

import Uploader from './uploader'
import WaveForm from './waveform'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { wavfile: '', segInfo: null }
  }
  render () {
    const setUploadResult = (wavfile, segInfo) => {
      this.setState({ wavfile: wavfile, segInfo: segInfo })
    }

    return (
      <div>
        <Uploader onComplete={setUploadResult} />
        <br /><br />
        <WaveForm wavfile={this.state.wavfile} segInfo={this.state.segInfo} />
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
