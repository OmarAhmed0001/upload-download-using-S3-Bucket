const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Set AWS credentials and region
AWS.config.update({
    accessKeyId: 'AKIAYBUPTBR4AELDL2BP',
    secretAccessKey: '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',
    region: 'us-east-1'
});


// Create S3 instance
const s3 = new AWS.S3();

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' });

// Enable CORS
app.use(cors());

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const uploadParams = {
    Bucket: 'omargraduation',
    Key: file.originalname,
    Body: fs.createReadStream(file.path)
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      return res.status(500).send('Upload error:', err);
    }
    fs.unlinkSync(file.path); // Delete local file after upload
    res.send({ message: 'File uploaded successfully', data });
  });
});

// File download endpoint
app.get('/download', (req, res) => {
  const downloadParams = {
    Bucket: 'omargraduation',
    Key: 'test.txt' // Name of the file to download
  };

  s3.getObject(downloadParams, (err, data) => {
    if (err) {
      return res.status(500).send('Download error:', err);
    }
    fs.writeFileSync('downloads/downloaded_example.txt', data.Body);
    res.download('downloads/downloaded_example.txt', 'downloaded_example.txt', (err) => {
      if (err) {
        return res.status(500).send('Downloaded file error:', err);
      }
      fs.unlinkSync('downloads/downloaded_example.txt'); // Delete downloaded file after sending
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});