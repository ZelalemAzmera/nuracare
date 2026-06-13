const https = require('https');

const titles = "Withania_somnifera|Echinacea|Peppermint|Hagenia|Moringa_oleifera|Chamomile|Ginger|Turmeric|Clove|Elettaria_cardamomum|Fenugreek|Ruta_graveolens|Teff|Flax|Avocado|Blueberry|Water|Human_eye|Diaphragmatic_breathing|Ethiopian_cuisine".split('|');

const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${titles.join('|')}&prop=pageimages&format=json&pithumbsize=400`;

https.get(url, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    const pages = data.query.pages;
    for (let id in pages) {
      if (pages[id].thumbnail) {
        console.log(`${pages[id].title}: ${pages[id].thumbnail.source}`);
      }
    }
  });
});
