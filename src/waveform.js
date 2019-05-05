import React from 'react'
import PropTypes from 'prop-types'
import Peaks from 'peaks.js'

class WaveForm extends React.Component {
  constructor (props) {
    super(props)
    this.initPeaks = this.initPeaks.bind(this)
    this.resetPpeaks = this.initPeaks.bind(this)
    this.playSegments = this.playSegments.bind(this)
  }

  componentDidUpdate () {
    if (this.props.segInfo !== null) {
      this.seg1 = this.createSegments(this.props.segInfo[0], '#ff0066')
      this.seg2 = this.createSegments(this.props.segInfo[1], '#0099cc')
      const segments = this.seg1.concat(this.seg2)
      this.initPeaks(segments)
    }
  }

  // Create segments ([[startTime, endTime, color], [startTime, endTime, color], ...])
  // arr: [startTime, endTime]
  createSegments (arr, color) {
    let segments = []
    for (let v of arr) {
      // if startTime >= endTime, peaks.js raises error
      if (v[0] === v[1]) v[1] += 0.001
      segments.push({ startTime: v[0], endTime: v[1], editable: false, color: color })
    }
    return segments
  }

  // Initialize peak.js
  // segments: [[startTime, endTime, color], [startTime, endTime, color], ...]
  initPeaks (segments) {
    this.audioCtx = new window.AudioContext()
    this.peaks = Peaks.init({
      container: document.querySelector('#peaks-container'),
      mediaElement: document.querySelector('audio'),
      audioContext: this.audioCtx,
      height: 150,
      inMarkerColor: '#aff000',
      outMarkerColor: '#0000ff',
      zoomWaveformColor: '#999999',
      overviewWaveformColor: '#999999',
      overviewHighlightRectangleColor: 'rgba(0, 0, 0, 0.0)',
      segments: segments
    })
    this.peaks.on('peaks.ready', () => {
      console.log('peaks ready')
    })
  }

  // Play specified segments
  // segments: [ {startTime: 0, endTIme: 1}, {startTime: 2, endTime: 3}, ...]
  playSegments (segments, i) {
    const player = this.peaks.player
    if (i === segments.length) {
      player.seek(0)
      player.pause()
      return
    }
    player.seek(segments[i].startTime)
    player.play()
    this.interval = setInterval(() => {
      if (player.getCurrentTime() >= segments[i].endTime) {
        clearTimeout(this.interval)
        this.interval = null
        this.playSegments(segments, i + 1)
      } else if (player._mediaElement.paused) {
        //
      }
    }, 30)
  }

  render () {
    if (this.props.wavfile === '' || this.props.segInfo === null) {
      return <div />
    }
    const play = () => {
      this.peaks.player.play()
    }
    const pause = () => {
      this.peaks.player.pause()
    }
    const stop = () => {
      this.peaks.player.pause()
      this.peaks.player.seek(0)
    }

    return (
      <div className='Form'>
        <div id='peaks-container' />
        <audio id='peaks-audio' controls='controls'>
          <source src={this.props.wavfile} type='audio/wav' />
        </audio><br />
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={stop}>Stop</button>
        <button onClick={() => this.playSegments(this.seg1, 0)}>Play A</button>
        <button onClick={() => this.playSegments(this.seg2, 0)}>Play B</button>
      </div>
    )
  }
}

WaveForm.propTypes = {
  wavfile: PropTypes.string,
  segInfo: PropTypes.array
}

export default WaveForm
