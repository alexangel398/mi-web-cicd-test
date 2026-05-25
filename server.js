const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});