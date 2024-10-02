---
headless: true
title: JavaScript
params:
    app-file: app.js
    lib-file: dice.js
---
{{% code-block "init" %}}

```bash
npm init -y
npm install express
```

{{% /code-block %}}
{{% code-block "app-file" %}}

```javascript
/*app.js*/
const express = require('express');
const { rollTheDice } = require('./dice.js');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /code-block %}}

{{% code-block "lib-file" %}}

```javascript
/*dice.js*/
function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };

});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /code-block %}}

{{% code-block "run-app" %}}

```console
$ node app.js
Listening for requests on http://localhost:8080
```

{{% /code-block %}}