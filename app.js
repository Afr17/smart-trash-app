require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Koneksi Database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Konfigurasi S3
const s3 = new AWS.S3({
    region: process.env.S3_REGION
});

// Upload ke S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read',
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + path.extname(file.originalname));
        }
    })
});

// Routes
app.get('/', (req, res) => {
    db.query("SELECT * FROM reports ORDER BY created_at DESC", (err, results) => {
        res.render('index', { laporan: results });
    });
});

app.post('/report', upload.single('photo'), (req, res) => {
    const { description } = req.body;
    const imageUrl = req.file.location; 
    db.query("INSERT INTO reports (description, image_url) VALUES (?, ?)", [description, imageUrl], () => {
        res.redirect('/');
    });
});

app.listen(3000, () => console.log('Web jalan di port 3000'));