const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const UserModel = require('./models/User');
const SummaryModel = require('./models/Summary');
const TokenModel = require('./models/token');

const app = express();
app.use(cors());
app.use(express.json());

// Ganti URL koneksi MongoDB dengan URL MongoDB Atlas
const mongoURI = 'mongodb+srv://Muchenkay:EcropV4bHT1s6ynn@cluster0.i05feyf.mongodb.net';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log('Error connecting to MongoDB Atlas:', err));

// Route for login and user creation
app.post('/formlogin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists in the database
    let user = await UserModel.findOne({ username });
    if (!user) {
      // If the user doesn't exist, create a new user
      user = await UserModel.create({ username, password });
    } else {
      // If the user exists, check the password
      if (user.password !== password) {
        return res.status(401).json({ message: 'Username or password is incorrect' });
      }
    }

    // Remove existing token for the user
    await TokenModel.deleteMany({ username: user.username });

    // Generate token
    const token = jwt.sign({ username: user.username }, 'Muchkyam');

    // Save the token in the Token collection
    await TokenModel.create({ token, username: user.username });

    // Send the token as a response
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware for token verification
app.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    // Verifikasi token menggunakan jwt.verify
    jwt.verify(token, 'Muchkyam', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Gagal melakukan autentikasi token' });
      }

      // Get the token from the Token collection
      const tokenData = await TokenModel.findOne({ token });
      if (!tokenData) {
        return res.status(403).json({ message: 'Token tidak valid' });
      }

      // Token valid, kirim respons berhasil
      res.json({ message: 'Token terverifikasi', decoded });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Kesalahan server internal' });
  }
});

// Definisikan route untuk mendapatkan seluruh data summary
app.get('/api/summary', async (req, res) => {
  try {
    const summaries = await SummaryModel.find();
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Definisikan route untuk membuat entri baru pada summary
app.post('/api/summary', async (req, res) => {
  try {
    const summary = await SummaryModel.create(req.body);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Definisikan route untuk mengupdate entri pada summary berdasarkan ID
app.put('/api/summary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSummary = await SummaryModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedSummary);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Definisikan route untuk menghapus entri pada summary berdasarkan ID
app.delete('/api/summary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await SummaryModel.findByIdAndRemove(id);
    res.json({ message: 'Summary deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Jalankan server pada port 5000
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
