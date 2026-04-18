const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json());

const supabase = createClient('https://ltrhnucudgwwwvjvroxv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cmhudWN1ZGd3d3d2anZyb3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDA0NDAsImV4cCI6MjA2NDYxNjQ0MH0.1n2z3Aew59vkJEnL3eerR_5VXiOsGgqzpQnijcWxIYg');

// Configure multer for .jpg/.jpeg
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'cert_uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only .jpg and .jpeg images are allowed'));
    }
    cb(null, true);
  },
});

// 📥 Signup with image uploads
app.post('/signup', upload.array('certifications'), async (req, res) => {
  const { name, username, password, skills } = req.body;
  const certs = req.files;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const urls = [];
    for (const file of certs) {
      const fileBuffer = fs.readFileSync(file.path);
      const { data, error } = await supabase.storage
        .from('certifications')
        .upload(`${username}/${file.filename}`, fileBuffer, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { publicURL } = supabase.storage.from('certifications').getPublicUrl(`${username}/${file.filename}`);
      urls.push(publicURL);
      fs.unlinkSync(file.path); // Clean up
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, username, password: hashedPassword, skills: skills.split(','), certification_urls: urls }]);

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'User registered', user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧠 Other routes remain the same (login, profile, buy-credits)

app.listen(PORT, () => console.log(`SkillAce backend running on http://localhost:${PORT}`));
