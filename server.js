const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/hi', function (req, res) {
  res.send('Hello World');
});

var server = app.listen(process.env.PORT || 8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
