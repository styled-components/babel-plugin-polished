# babel-plugin-polished

Compile away [polished](https://polished.js.org/) helpers.

## Example

**In**

```js
import * as polished from 'polished';

let value = polished.clearFix();
```

**Out**

```js
let value = {
  '&::after': {
    clear: 'both',
    content: '',
    display: 'table'
  }
};
```

## Installation

```sh
$ npm install babel-plugin-polished
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["polished"]
}
```

### Via CLI

```sh
$ babel --plugins polished script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["polished"]
});
```
