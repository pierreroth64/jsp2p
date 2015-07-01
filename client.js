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
    xmpp = require('node-xmpp'),
    log4js = require('log4js'),
    util = require('util');

function JsP2PClient(options) {
  this.logger = log4js.getLogger('jsp2p');
  this.logger.setLevel(options.debug || 'DEBUG');
  this.logger.debug('JsP2PClient creation options:', options);
  Client.call(this, options);
}

util.inherits(JsP2PClient, Client);

JsP2PClient.prototype.getRoster = function () {
  var roster = new xmpp.Element('iq', { id: 'roster_0', type: 'get' });
  roster.c('query', { xmlns: 'jabber:iq:roster' });
  this.send(roster);
  this.logger.debug('Sent get roster request:', roster);
};

JsP2PClient.prototype.sendPresence = function (show, status) {
  var stanza = new xmpp.Element('presence');
  if (show && show !== STATUS.AWAY) {
      stanza.c('show').t(show);
  }
  if (typeof(status) !== 'undefined') {
      stanza.c('status').t(status);
  }
  this.send(stanza);
  this.logger.debug('Sent presence:', stanza);
};

exports.JsP2PClient = JsP2PClient;

