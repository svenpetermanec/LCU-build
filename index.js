const { default: axios } = require('axios');
const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var champion;
//to instance
connector.on('connect', async (data) => {
  axios.interceptors.request.use((config) => {
    if (config.url.includes('127.0.0.1')) {
      config.headers.Authorization =
        'Basic ' + Buffer.from('riot:' + data.password).toString('base64');
    }
    return config;
  });

  const response = await axios.get(
    `https://127.0.0.1:${data.port}/lol-champ-select/v1/current-champion`
  );

  const champions = await axios.get(
    'http://ddragon.leagueoflegends.com/cdn/11.23.1/data/en_US/champion.json'
  );

  Object.keys(champions.data.data).forEach((champ) => {
    if (champions.data.data[champ].key === response.data.toString(10)) {
      champion = champions.data.data[champ].name;
    }
  });

  const pages = await axios.get(
    `https://127.0.0.1:${data.port}/lol-perks/v1/pages`
  );

  const currentPage = pages.data.filter((page) => page.current);

  const runes = await axios.get(
    'https://league-champion-aggregate.iesdev.com/api/champions?queue=420'
  );

  const currentBuild = runes.data.data.filter(
    (champ) => champ.champion_id == response.data.toString(10)
  );

  const currentRunes = currentBuild[0].stats.runes.build;

  await axios.put(
    `https://127.0.0.1:${data.port}/lol-perks/v1/pages/${currentPage[0].id}`,
    {
      autoModifiedSelections: [0],
      current: true,
      id: currentPage[0].id,
      isActive: false,
      isDeletable: true,
      isEditable: true,
      isValid: true,
      lastModified: 0,
      name: champion,
      order: 2,
      primaryStyleId: currentRunes[0],
      selectedPerkIds: [
        currentRunes[1],
        currentRunes[2],
        currentRunes[3],
        currentRunes[4],
        currentRunes[6],
        currentRunes[7],
        5005,
        5008,
        5002,
      ],
      subStyleId: currentRunes[5],
    }
  );
});

connector.start();
