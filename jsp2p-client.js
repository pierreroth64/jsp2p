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

var Client = require('node-xmpp-client'),
    ltx = require('node-xmpp-core').ltx,
    nxmlpp = require('nxmlpp'),
    log4js = require('log4js'),
    program = require('commander');

log4js.configure({
  appenders: [
    { type: 'console' },
  ]
});

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

var util = require('util');

function JsP2PClient(options) {
  this.logger = log4js.getLogger('jsp2p');
  this.logger.setLevel(program.debug);
  this.logger.debug('JsP2PClient creation options:', options);
  Client.call(this, options);
}

util.inherits(JsP2PClient, Client);


JsP2PClient.prototype.getRoster = function () {
  var roster = new ltx.Element('iq',{id: 'roster_0',type: 'get'}).c('query', { xmlns: 'jabber:iq:roster'});
  this.logger.debug('Send get roster request:', roster);
  this.send(roster);
};

var client = new JsP2PClient(options);

client.addListener('online', function(data) {
  client.send('<presence/>');
  this.logger.info('Connected with JID:', data.jid.user);
});

client.addListener('stanza', function(stanza) {
  this.logger.debug('Incoming stanza:', nxmlpp.strPrint(stanza.toString()));
  if (stanza.is('iq') && stanza.attrs.type === 'result' && stanza.attrs.id === 'roster_0') {
      var buddies = stanza.children[0].children;
      this.logger.debug("buddies:", buddies);
  }
});

client.addListener('connect', function () {
    this.logger.debug('Client is connected');
});

client.addListener('error', function(e) {
    this.logger.error(e);
});


client.getRoster();
