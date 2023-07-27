import config from './config/config.json' assert { type: "json" };
import * as server from './server.js'; 

config.PORT = process.env.PORT || config.PORT;

server.run(config);
