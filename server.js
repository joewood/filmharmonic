const express = require('express');
const app = express();
const fetch = require('node-fetch');

app.get('/api/hi', function (req, res) {
  res.send('Hello World');
});

app.get('/api/search/:search', async function (req, res) {
  const search = req.params.search;
  const r = await fetch(`http://www.omdbapi.com/?apikey=d88baf32&s=${search}`, { method: 'GET' });
  if (r.ok) {
    const oo = await r.json();
    res.send(JSON.stringify(oo, null, 2));
    res.status(200);
  } else {
    console.error(r.statusText);
    res.status(r.status || 501);
    res.send(r.statusText);
  }
});

app.use(express.static('public'));

var server = app.listen(process.env.PORT || 8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
