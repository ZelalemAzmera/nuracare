const https = require('https');
const fs = require('fs');
const url = 'https://expo.dev/artifacts/eas/C-UgZsC__wqw56esa8iN1OXISQYLfOgSFNiqU0O70lY.apk';
const file = fs.createWriteStream('apps/web/public/nuracare.apk');
https.get(url, (response) => {
  if (response.statusCode === 307 || response.statusCode === 302) {
    https.get(response.headers.location, (res2) => {
      if (res2.statusCode === 307 || res2.statusCode === 302) {
        https.get(res2.headers.location, (res3) => {
           res3.pipe(file);
           res3.on('end', () => console.log('Done downloading!'));
        });
      } else {
        res2.pipe(file);
        res2.on('end', () => console.log('Done downloading!'));
      }
    });
  } else {
    response.pipe(file);
    response.on('end', () => console.log('Done downloading!'));
  }
}).on('error', (err) => console.error(err));
