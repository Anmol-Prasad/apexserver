// const express = require('express');
// const axios = require('axios');
// const app = express();

// const clientId = '3MVG9GCMQoQ6rpzTU4xobK1vILbUOSgBk4Oi7k7YzYW3AnASXqH0nSe0CDcIT7xNSIy7XvHhCUXl7MfgC8oJW';
// const clientSecret = '6CAB4D5ED7CC9927AE39FD5F51A8CDBCCFF87F28C94EBCDC9A169DBFF4410EEB';
// const redirectUri = 'https://apexserver-gu2i.onrender.com/callback';

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

app.use(cors());
app.use(helmet());


const clientId = '3MVG9GCMQoQ6rpzTU4xobK1vILbUOSgBk4Oi7k7YzYW3AnASXqH0nSe0CDcIT7xNSIy7XvHhCUXl7MfgC8oJW';
const clientSecret = '6CAB4D5ED7CC9927AE39FD5F51A8CDBCCFF87F28C94EBCDC9A169DBFF4410EEB';
const redirectUri = 'https://apexserver-gu2i.onrender.com/callback';

const memoryStore = {}; // Temporary in-memory store: state → token

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!code || !state) return res.status(400).send('❌ Missing code or state');

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

    memoryStore[state] = { access_token, instance_url };

    res.send(`
      <h2>✅ Salesforce Login Successful</h2>
      <p>🔒 Token relayed. You may close this tab.</p>
      <script>window.close();</script>
    `);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('❌ Token exchange failed: ' + err.message);
  }
});

app.get('/token', (req, res) => {
  const { state } = req.query;
  const token = memoryStore[state];
  if (token) {
    res.json(token);
    delete memoryStore[state]; // Optional: clean up
  } else {
    res.status(404).send('Token not ready');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 OAuth server running on port ${PORT}`));
