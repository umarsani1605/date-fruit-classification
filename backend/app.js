const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');

const app = express();
const PORT = 3000;

app.use(cors());

// Folder untuk menyimpan gambar
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter file hanya untuk gambar jpg, jpeg, png
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpg, jpeg, png) yang diperbolehkan!'));
  }
};

const upload = multer({ storage, fileFilter });

const LABELS = ['Ajwa', 'Galaxy', 'Medjool', 'Meneifi', 'Nabtat Ali', 'Rutab', 'Shaishe', 'Sokari', 'Sugaey'];

// Load model tfjs (singleton)
let model;
async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel('file://' + path.join(__dirname, 'tfjs_model/model.json'));
  }
  return model;
}

// Fungsi prediksi gambar
async function predictImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  let tensor = tf.node.decodeImage(imageBuffer, 3);
  tensor = tf.image.resizeBilinear(tensor, [224, 224]); // Resize gambar
  tensor = tensor.toFloat().div(tf.scalar(255.0)).expandDims(0); // Normalisasi x = x / 255.0
  const model = await loadModel();
  const prediction = model.predict(tensor);
  const scores = prediction.arraySync()[0];
  const maxIdx = scores.indexOf(Math.max(...scores));
  return {
    label: LABELS[maxIdx],
    score: scores[maxIdx],
    scores: scores,
    labelList: LABELS,
  };
}

// Endpoint upload
app.post('/upload', upload.single('gambar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diupload atau format tidak sesuai.' });
  }
  const imagePath = req.file.path;
  try {
    const prediction = await predictImage(imagePath);
    res.json({
      url: `http://localhost:${PORT}/uploads/${req.file.filename}`,
      prediction,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal melakukan inferensi model: ' + err });
  }
});

// Serve file statis dari folder uploads
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
