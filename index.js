import express from 'express';
import { read } from './jsonFileStorage.js';

const PORT = process.argv[2];
const app = express();
const FILENAME = './data.json';

const handleQueryParams = (request, response) => {
  read(FILENAME, (err, data) => {
    // Respond with the name at the index specified in the URL
    if (request.params.index >= data.recipes.length) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      console.log('Recipe:', data.recipes[request.params.index]);
      response.send(data.recipes[request.params.index]);
    }
  });
};

app.get('/recipe/:index', handleQueryParams);

app.listen(PORT);
