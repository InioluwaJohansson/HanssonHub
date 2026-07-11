const axios = require('axios');
axios.post('http://localhost:3000/api/Action/GetAllActions')
  .then(res => console.log(JSON.stringify(res.data[0], null, 2)))
  .catch(err => console.error(err.message));
