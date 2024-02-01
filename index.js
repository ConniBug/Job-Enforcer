require('dotenv').config();

// Start main job handler
require('./JobHandler');
// ------------------------------



// Load bot & bot events
const client = require('./modules/client');

require('./events/ClientReady');
require('./events/InteractionCreate');
require('./events/MessageCreate');
// ------------------------------


// Load bot commands
require('./command_loader')(client);
// ------------------------------
