import * as server from './server.js';
let config = {};
config.PORT = +(process.env.PORT || 5000);
server.run(config);
