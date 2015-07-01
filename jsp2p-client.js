/* Copyright (C) 2015 Legrand France
 * All rights reserved
 *
 * JS library to deal with Legrand P2P servers (XMPP)
 */
'use strict';

var STATUS = {
    AWAY: "away",
    DND: "dnd",
    XA: "xa",
    ONLINE: "online",
    OFFLINE: "offline"
};

var xmpp = require('simple-xmpp'),
    log4js = require('log4js'),
    nxmlpp = require('nxmlpp'),
    program = require('commander');

log4js.configure({
  appenders: [
    { type: 'console' },
  ]
});

var logger = log4js.getLogger('jsp2p');

program
  .version('0.1.0')
  .usage('[options] <JID> <password> <host>')
  .option('-d --debug <level>', 'Log level', /^(DEBUG|INFO|ERROR)$/i, 'INFO')
  .option('-port, --port <port>', 'XMPP port to connect to', parseInt)
  .option('-r, --register', 'Register before any other XMPP operation')
  .parse(process.argv);

if (process.argv.slice(2).length < 3) {
    program.help();
}

logger.setLevel(program.debug);

var options = {
  jid: process.argv[2],
  password: process.argv[3],
  host: process.argv[4],
  port: program.port || 5222,
  register: program.register || false
};

logger.debug('XMPP connection options', options);

xmpp.on('online', function(data) {
    logger.info('Connected with JID:', data.jid.user);
});

xmpp.on('error', function(err) {
    logger.error(err);
});

xmpp.on('stanza', function(stanza) {
    logger.debug('Incoming stanza:', nxmlpp.strPrint(stanza.toString()));
    if (stanza.is('iq') && stanza.attrs.type === 'result' && stanza.attrs.id === 'roster_0') {
        var buddies = stanza.children[0].children;
        logger.info('buddies:', buddies);
    }
});

process.on('SIGINT', function() {
    logger.debug("\nCaught ctrl+c");
    logger.debug("Disconnecting...");
    xmpp.disconnect();
    logger.info("Exiting...");
    process.exit();
});

logger.debug('Connecting to %s:%d with %s', options.host, options.port, options.jid);
xmpp.connect(options);

logger.debug('Sending presence...');
xmpp.setPresence(STATUS.ONLINE, 'At work!');

logger.debug('Asking for roster...');
xmpp.getRoster();
