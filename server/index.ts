import * as server from './server.js'; 

let config = {} as any;
config.PORT = process.env.PORT || 5000;

server.run(config);
