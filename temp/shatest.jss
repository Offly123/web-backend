const { createHash } = require('crypto');

let result = createHash('sha256').update('1').digest('base64');

console.log(result);

result = createHash('sha256').update('1').digest('base64');

console.log(result);

result = createHash('sha256').update('1').digest('base64');

console.log(result);