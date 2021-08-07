import express from 'express';
import { read } from './jsonFileStorage.js';

const PORT = process.argv[2];
const app = express();
const FILENAME = './data.json';

const handleQueryParams = (request, response) => {
  read(FILENAME, (err, data) => {
    // Respond with the name at the index specified in the URL
    console.log('Recipe:', data.recipes[request.params.index]);
    response.send(data.recipes[request.params.index]);
  });
};

app.get('/recipe/:index', handleQueryParams);

app.listen(PORT);
