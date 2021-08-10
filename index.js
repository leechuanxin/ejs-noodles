import express from 'express';
import { read } from './jsonFileStorage.js';

const PORT = process.argv[2];
const app = express();
const FILENAME = './data.json';

// Set view engine
app.set('view engine', 'ejs');
// Set public folder for static files
app.use(express.static('public'));

const handleCategoryParams = (request, response) => {
  read(FILENAME, (err, data) => {
    const categoriesObj = {};
    // retrieve all valid categories
    data.recipes.forEach((recipe) => {
      if (recipe.category && !categoriesObj[recipe.category]) {
        categoriesObj[recipe.category.toLowerCase()] = '';
      }
    });
    // store all valid categories in an array
    const categoriesArr = Object.keys(categoriesObj);
    // 404 if category doesn't exist
    if (categoriesArr.indexOf(request.params.category.toLowerCase()) < 0) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      const { recipes } = data;
      // save indexes of existing data
      const recipesWithIndexes = recipes.map((recipe, index) => ({
        ...recipe,
        index,
      }));
      // create recipes obj, with overaching category,
      // and all recipes matching category
      // mark those recipes without categories as false
      const recipesObj = {
        category: request.params.category.substring(0, 1).toUpperCase()
        + request.params.category.substring(1).toLowerCase(),
        recipes: recipesWithIndexes.filter(
          (el) => ((el.category)
            ? el.category.toLowerCase() === request.params.category.toLowerCase() : false),
        ),
      };
      response.render('category', recipesObj);
    }
  });
};

const handleQueryParams = (request, response) => {
  read(FILENAME, (err, data) => {
    // Respond with the name at the index specified in the URL
    if (request.params.index >= data.recipes.length) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      const recipe = data.recipes[request.params.index];
      const ingredients = (recipe && recipe.ingredients) ? recipe.ingredients.split('\n') : [];
      const recipeObj = {
        recipe: {
          ...recipe,
          ingredients,
          index: request.params.index,
        },
      };
      response.render('recipe', recipeObj);
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

const handleIndex = (request, response) => {
  read(FILENAME, (err, data) => {
    const categoriesObj = {};
    data.recipes.forEach((recipe) => {
      if (recipe.category && !categoriesObj[recipe.category]) {
        categoriesObj[recipe.category] = '';
      }
    });
    const categoriesArr = Object.keys(categoriesObj);
    const categoriesArrObj = {
      categories: categoriesArr,
    };
    response.render('index', categoriesArrObj);
  });
};

const handle404 = (request, response) => {
  response.status(404).send('Page not found.');
};

app.get('/', handleIndex);
app.get('/category/:category', handleCategoryParams);
app.get('/recipe/:index', handleQueryParams);
app.get('/yield/:yield', handleYieldFilter);
app.get('/recipe-label/:label', handleRecipeLabel);
app.get('*', handle404);

app.listen(PORT);
