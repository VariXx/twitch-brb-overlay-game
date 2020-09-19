const express = require('express');
const bodyParser = require('body-parser');
const { repsonse } = require('express');

const app = express();
const port = 16016; 

app.get('/', (req, res) => {
    res.send('go away');
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false} ));
app.use(bodyParser.json());

app.post('/users', (req, res) => {
    // update user info
});

app.get('/users', (req, res) => {
    // get user info
});

app.listen(port, () => console.log(`Listening on port ${port}`));
