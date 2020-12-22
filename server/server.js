const express = require('express');
const app = express();
const fetch = require('node-fetch');
const port = process.env.PORT || 9000;

app.get('/search/:search', async function (req, res) {
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

// const options = {
//   index: 'index.html',
// };
// app.use('/', express.static('/home/site/wwwroot/public', options));

// app.use(express.static('public'));

const server = app.listen(port);