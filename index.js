/** THIS IS THE SERVER CODE */

const express = require('express');
const app = express();
const fetch = require('node-fetch');
const port = process.env.PORT || 8081;
const cosmos = require('@azure/cosmos');
const { promisify } = require('util');

const storage = require('azure-storage');
const { TableQuery } = require('azure-storage');
const storageClient = storage.createTableService(process.env['COSMOS']);
const bodyParser = require('body-parser');
app.use(bodyParser.json());

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

app.get('/movie/:id', async function (req, res) {
  const id = req.params.id;
  const omdbRequest = await fetch(`http://www.omdbapi.com/?apikey=d88baf32&i=${id}`, { method: 'GET' });
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

app.get('/votes', async function (req, res) {
  const out = {
    proposals: {
      movieId: 'tt6723592',
      votes: 1,
    },
    wishlists: [
      {
        wishlist: ['tt7126948', 'tt6723592'],
        user: 'joewood@live.com',
      },
    ],
  };
  res.send(JSON.stringify(out));
  res.status(200);
});

app.get('/user/:id', async function (req, res) {
  let out = {};
  try {
    out = await new Promise((resolve, reject) =>
      storageClient.retrieveEntity(
        'user',
        'woods',
        decodeURIComponent(req.params.id),
        { autoResolveProperties: true },
        (e, r) => (e ? reject(e) : resolve(r))
      )
    );
  } catch (e) {
    console.error(e);
    res.status(503);
    res.send(JSON.stringify(e));
    return;
  }
  for (const k in out) {
    if ('_' in out[k]) out[k] = out[k]._;
  }
  delete out['.metadata'];
  delete out.etag;
  res.send(JSON.stringify(out));
  res.status(200);
});

app.put('/user/:id', async function (req, res) {
  let out = {};
  const RowKey = decodeURIComponent(req.params.id);
  const PartitionKey = 'woods';
  console.log('BODY', req.body);
  try {
    let newUser = { ...req.body, PartitionKey, RowKey };
    console.log('NEW', newUser);
    out = await new Promise((resolve, reject) =>
      storageClient.insertOrReplaceEntity('user', newUser, (e, r) => (e ? reject(e) : resolve(r)))
    );
  } catch (e) {
    console.error(e);
    res.status(503);
    res.send(JSON.stringify(e));
    return;
  }
  res.send(JSON.stringify(out));
  res.status(200);
});

const options = {
  index: 'index.html',
};
app.use('/', express.static('/home/site/wwwroot/build', options));
app.use('/callback', express.static('/home/site/wwwroot/build', options));
app.use('/showmovie/*', express.static('/home/site/wwwroot/build', options));
app.use('/showuser/*', express.static('/home/site/wwwroot/build', options));

console.log('Port ' + port);

const server = app.listen(port);
