const express = require('express');
const axios = require('axios');
const app = express();

const clientId = '3MVG9GCMQoQ6rpzTU4xobK1vILbUOSgBk4Oi7k7YzYW3AnASXqH0nSe0CDcIT7xNSIy7XvHhCUXl7MfgC8oJW';
const clientSecret = '6CAB4D5ED7CC9927AE39FD5F51A8CDBCCFF87F28C94EBCDC9A169DBFF4410EEB';
const redirectUri = 'https://apexserver-gu2i.onrender.com/callback';

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('❌ No code received');

  try {
    const tokenRes = await axios.post('https://login.salesforce.com/services/oauth2/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      }
    });

    const { access_token, instance_url } = tokenRes.data;

    // 🛑 You could store this somewhere, but for now we'll display instructions:
    res.send(`
      <h2>✅ Salesforce Login Successful</h2>
      <p><strong>Access Token:</strong> ${access_token}</p>
      <p><strong>Instance URL:</strong> ${instance_url}</p>
      <p style="color:red;">Copy this manually into your extension for now or build a secure relay mechanism.</p>
    `);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('❌ Token exchange failed: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 OAuth server running on port ${PORT}`));
