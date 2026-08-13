const express = require('express');
const app = express();
app.use(express.json());
const dev = require('./server/routes/devRoutes');
app.use('/api/dev', dev);
app.listen(6200, () => console.log('Temp dev server listening on 6200'));
