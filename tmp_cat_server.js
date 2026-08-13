const express = require('express');
const app = express();
app.use(express.json());
const cr = require('./server/routes/categoryRoutes');
app.use('/api/categories', cr);
app.listen(6100, () => console.log('Temp category server listening on 6100'));
