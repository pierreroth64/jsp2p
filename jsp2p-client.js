/* Copyright (C) 2015 Legrand France
 * All rights reserved
 *
 * JS library to deal with Legrand P2P servers (XMPP)
 */
'use strict';

var nxmlpp = require('nxmlpp');
var xmpp = require('simple-xmpp');
var argv = process.argv;

function ConnectioInfo() {
    this.jid = argv[2];
    this.pwd = argv[3];
    this.host = argv[4];
    this.port = 5222;
}

var connInfo = new ConnectioInfo();

if (argv.length < 3) {
    console.error('Usage: node jsp2p-client.js <myjid> ' +
        '<mypassword> <host>');
    process.exit(1);
}

xmpp.on('online', function(data) {
    console.log('Connected with JID: ' + data.jid.user);
    console.log('Sending presence');
    xmpp.setPresence('away', 'Swimming...');
    // var roster = xmpp.getRoster();
    // console.log(roster);
});

xmpp.on('chat', function(from, message) {
    xmpp.send(from, 'echo: ' + message);
});

xmpp.on('error', function(err) {
    console.error(err);
});

xmpp.on('stanza', function(stanza) {
    console.log('Incoming stanza:', nxmlpp.strPrint(stanza.toString()));
    if (stanza.is('iq') && stanza.attrs.type === 'result' && stanza.attrs.id === 'roster_0') {
        var buddies = stanza.children[0].children;
        console.log("buddies:", buddies);
    }
});

process.on('SIGINT', function() {
    console.log("\nCaught ctrl+c");
    console.log("Disconnecting...");
    xmpp.disconnect();
    console.log("Exiting...");
    process.exit();
});

xmpp.connect({
        jid                 : connInfo.jid,
        password            : connInfo.pwd,
        host                : connInfo.host,
        port                : connInfo.port
});

console.log('Sending presence...');
xmpp.setPresence('away', 'Swimming :-D \o/');

console.log('Asking for roster...');
xmpp.getRoster();
