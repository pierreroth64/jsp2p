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

var JsP2PClient = require('./client').JsP2PClient,
    program = require('commander');

program
  .version('0.1.0')
  .usage('[options] <JID> <password> <host>')
  .option('-d --debug <level>', 'Log level', /^(DEBUG|INFO|ERROR)$/i, 'INFO')
  .option('-port, --port <port>', 'XMPP port to connect to', parseInt)
  .option('-r, --register', 'Ask for XMPP registration before any further operation')
  .parse(process.argv);

if (process.argv.slice(2).length < 3) {
  program.help();
}

var options = {
  jid: process.argv[2],
  password: process.argv[3],
  host: process.argv[4],
  port: program.port || 5222,
  register: program.register || false,
};

var client = new JsP2PClient(options);

client.addListener('online', function(data) {
  client.send('<presence/>');
  this.logger.info('Connected with JID:', data.jid.user);
  client.sendPresence(STATUS.AWAY, 'working!');
  client.getRoster();
});

client.addListener('stanza', function(stanza) {
  this.logger.debug('Incoming stanza:', stanza);
  if (stanza.is('iq') && stanza.attrs.type === 'result' && stanza.attrs.id === 'roster_0') {
      var buddies = stanza.children[0].children;
      this.logger.info('buddies:', buddies);
  }
});

client.addListener('error', function(e) {
    this.logger.error(e);
});



