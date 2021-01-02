/** THIS IS THE SERVER CODE */

const express = require('express');
const app = express();
const fetch = require('node-fetch');
const port = process.env.PORT || 8081;

const storage = require('azure-storage');
const { TableQuery, TableUtilities } = require('azure-storage');
const storageClient = storage.createTableService(process.env['COSMOS']);
const bodyParser = require('body-parser');
app.use(bodyParser.json());

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

app.get('/api/movie/:id', async function (req, res) {
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

app.get('/api/votes', async function (req, res) {
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

app.get('/api/user/:id', async function (req, res) {
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

app.put('/api/user/:id', async function (req, res) {
  let out = {};
  const RowKey = decodeURIComponent(req.params.id);
  const PartitionKey = 'woods';
  try {
    let newUser = { ...req.body, PartitionKey, RowKey };
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

app.get('/api/group', async function (req, res) {
  let resultSet = {};
  try {
    resultSet = await new Promise((resolve, reject) =>
      storageClient.queryEntities(
        'user',
        new TableQuery()
          .select('proposed', 'vote', 'wishlist', 'RowKey')
          .where(TableQuery.stringFilter('PartitionKey', TableUtilities.QueryComparisons.EQUAL, 'woods')),
        null,
        {},
        (e, r) => (e ? reject(e) : resolve(r))
      )
    );
  } catch (e) {
    console.error(e);
    res.status(503);
    res.send(JSON.stringify(e));
    return;
  }
  for (const out of resultSet.entries || []) {
    for (const k in out) {
      if ('_' in out[k]) out[k] = out[k]._;
    }
    delete out['.metadata'];
    delete out.etag;
  }
  res.send(JSON.stringify(resultSet.entries));
  res.status(200);
});

const options = {
  index: 'index.html',
};

app.use(express.static(__dirname + '/build', options));
app.get('*', (req, res) => res.sendFile(__dirname + '/build/index.html'));

console.log('Port ' + port);

const server = app.listen(port);
