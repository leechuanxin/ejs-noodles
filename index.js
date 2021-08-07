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

const handleYieldFilter = (request, response) => {
  read(FILENAME, (err, data) => {
    if (Number.isNaN(Number(request.params.yield))) {
      response.status(400).send('Yield has to be a number!');
    } else {
      const matchYield = data.recipes.filter(
        (recipe) => recipe.yield === Number(request.params.yield),
      );
      if (matchYield.length < 1) {
        response.status(404).send('Sorry, we cannot find that!');
      } else {
        response.send(matchYield);
      }
    }
  });
};

const handleRecipeLabel = (request, response) => {
  read(FILENAME, (err, data) => {
    const kebabCaseLabel = request.params.label.toLowerCase();
    const label = kebabCaseLabel.split('-').join(' ');
    if (!label || label.trim() === '') {
      response.status(400).send('Please enter a valid label to search for.');
    } else {
      const matched = data.recipes.filter((recipe) => recipe.label.toLowerCase() === label);
      if (matched.length < 1) {
        response.status(404).send('Sorry, we cannot find that!');
      } else {
        response.send(matched);
      }
    }
  });
};

const handle404 = (request, response) => {
  response.status(404).send('Page not found.');
};

app.get('/recipe/:index', handleQueryParams);
app.get('/yield/:yield', handleYieldFilter);
app.get('/recipe-label/:label', handleRecipeLabel);
app.get('*', handle404);

app.listen(PORT);
