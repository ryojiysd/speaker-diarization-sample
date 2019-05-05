const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const uploader = multer({ dest: './public/wav/' })

let app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, 'public')))

// Receives wav file, sends it to Google Cloud Speech API and returns
// speaker diarization info
app.post('/api/upload', uploader.fields([{ name: 'file' }]), (req, res) => {
  const file = req.files.file[0]
  const tmpPath = file.path
  const targetPath = './public/wav/' + file.originalname

  fs.renameSync(tmpPath, targetPath)
  syncRecognize(targetPath, 'LINEAR16', 16000, 'ja-JP').then(result => {
    const segInfo = extractSegInfo(result)
    res.json({ wavfile: `wav/${file.originalname}`, segInfo: segInfo })
  })
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000')
})

// Sends wav file to Google Cloud Speech API and returns its response
async function syncRecognize (filename, encoding, sampleRate, languageCode) {
  const speech = require('@google-cloud/speech').v1p1beta1
  const fs = require('fs')

  const client = new speech.SpeechClient()

  const audio = {
    content: fs.readFileSync(filename).toString('base64')
  }

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRate,
    languageCode: languageCode,
    diarizationSpeakerCount: 2,
    enableAutomaticPunctuation: true,
    enableSpeakerDiarization: true,
    model: 'default'
  }

  const request = {
    audio: audio,
    config: config
  }

  const [response] = await client.recognize(request)
  return response
}

// Extract segmentation info from Cloud Speech API's results
const extractSegInfo = (recognizeInfo) => {
  // Convert Speech API result to segment data
  let segSpk1 = []
  let segSpk2 = []
  recognizeInfo.results[0].alternatives[0].words.forEach((word) => {
    const startTime = parseFloat(word.startTime.seconds) + parseFloat(word.startTime.nanos) / 1000 / 1000 / 1000
    const endTime = parseFloat(word.endTime.seconds) + parseFloat(word.endTime.nanos) / 1000 / 1000 / 1000
    const speakerTag = word.speakerTag
    if (speakerTag === 1) {
      if (segSpk1.length > 0 && segSpk1[segSpk1.length - 1][1] === startTime) {
        segSpk1[segSpk1.length - 1][1] = endTime
      } else {
        segSpk1.push([startTime, endTime])
      }
    } else if (speakerTag === 2) {
      if (segSpk2.length > 0 && segSpk2[segSpk2.length - 1][1] === startTime) {
        segSpk2[segSpk2.length - 1][1] = endTime
      } else {
        segSpk2.push([startTime, endTime])
      }
    } else {
      console.log(`unknown speaker ${speakerTag}`)
    }
  })
  return [segSpk1, segSpk2]
}
