---
headless: true
title: Typescript
params:
    app-file: app.ts
    lib-file: dice.ts
---
{{% code-block "init" %}}

```bash
npm init -y
npm install typescript \
  ts-node \
  @types/node \
  express \
  @types/express

# initialize typescript
npx tsc --init
```

{{% /code-block %}}
{{% code-block "app-file" %}}

```javascript
/*app.ts*/
import express, { Request, Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

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
/*dice.ts*/
function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /code-block %}}

{{% code-block "run-app" %}}

```console
$ npx ts-node app.ts
Listening for requests on http://localhost:8080
```

{{% /code-block %}}