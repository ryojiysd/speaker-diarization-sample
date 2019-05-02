const express = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const uploader = multer({ dest: './public/wav/' })

let app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

app.post('/api/upload', uploader.fields([{ name: 'file' }]), (req, res) => {
  const file = req.files.file[0]
  const tmpPath = file.path
  const targetPath = './public/wav/' + file.originalname

  fs.renameSync(tmpPath, targetPath)
  res.json({ path: targetPath, message: `File was uploaded to ${targetPath} - ${file.size} bytes` })
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000')
})
