const express = require('express');
const app = express();
app.use(express.json());
const pr = require('./server/routes/productRoutes');
app.use('/api/products', pr);
app.listen(6000, () => console.log('Temp server listening on 6000'));
