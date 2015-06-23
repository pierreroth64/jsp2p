'use strict';

var nxmlpp = require('nxmlpp');
var xmpp = require('simple-xmpp');
var argv = process.argv;

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
     console.log('Incoming stanza:\n', nxmlpp.strPrint(stanza.toString()));
});

xmpp.on('subscribe', function(from) {
// if (from === 'a.friend@gmail.com') {
//     xmpp.acceptSubscription(from);
//     }
});

xmpp.connect({
        jid                 : argv[2],
        password            : argv[3],
        host                : argv[4],
        port                : 5222
});

