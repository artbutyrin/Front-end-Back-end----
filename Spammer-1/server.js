const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

const Contact = require('./models/Contact');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi');

const nodemailer = require('nodemailer');

let transporter;

function createTransporter() {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

createTransporter();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use(express.static('public'));
app.use(express.json());
app.post('/api/contacts', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  res.json(contact);
});

app.get('/api/contacts', async (req, res) => {
  const contacts = await Contact.find().sort({ lastName: 1, firstName: 1 });
  res.json(contacts);
});

app.post('/api/send', async (req, res) => {
  const text = req.body.text;
  const subject = req.body.subject;

  if (!text || !subject) {
    return res.status(400).json({ error: 'Subject and text are required' });
  }

  if (!transporter) {
    return res.status(503).json({ error: 'Mail transport is not ready' });
  }
  
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Select at least one contact' });
  }

  const contacts = await Contact.find({ _id: { $in: ids } }).sort({ lastName: 1, firstName: 1 });
  if (contacts.length === 0) {
    return res.status(404).json({ error: 'Contacts not found' });
  }

  const messages = [];
  
  for (const contact of contacts) {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: contact.email,
      subject,
      text
    });
  
    messages.push({
      email: contact.email,
      preview: nodemailer.getTestMessageUrl(info)
    });
  }
  
  res.json({ sent: messages.length, messages });

  
});

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));