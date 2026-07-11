const axios = require('axios');
axios.post('https://kv5zhpcr-7190.uks1.devtunnels.ms/Home_Security/Action/GetAllActions')
  .then(res => console.log(JSON.stringify(res.data[0], null, 2)))
  .catch(err => console.error(err.message));
