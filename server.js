const express = require('express');
const app = express();
const fetch = require('node-fetch');

app.get('/api/search/:search', async function (req, res) {
  const search = req.params.search;
  const omdbRequest = await fetch(`http://www.omdbapi.com/?apikey=d88baf32&s=${search}`, { method: 'GET' });
  if (omdbRequest.ok) {
    const data = await omdbRequest.json();
    res.send(JSON.stringify(data, null, 2));
    res.status(200);
  } else {
    console.error(omdbRequest.statusText);
    res.status(omdbRequest.status || 501);
    res.send(omdbRequest.statusText);
  }
});

app.use(express.static('public'));

const server = app.listen(process.env.PORT || 8081, '0.0.0.0', function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Example app listening at http://0.0.0.0:%s', host, port);
});
