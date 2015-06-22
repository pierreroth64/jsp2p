'use strict';

var Client = require('node-xmpp-client');
var xmpp = require('node-xmpp');
var argv = process.argv;

if (argv.length < 3) {
    console.error('Usage: node jsp2p-client.js <my-jid> ' +
        '<my-password> <host>')
    process.exit(1)
}

var client = new Client({
    jid: argv[2],
    password: argv[3],
    host: argv[4],
    port: 5222
});

client.on('online', function() {
    console.log('online! :)');
    var roster = new xmpp.Element('iq', {
        id: 'roster_0',
        type: 'get'
    }).c('query', {
         xmlns: 'jabber:iq:roster'
    });
    client.send(roster);
});

client.on('offline', function() {
    console.log('online!');
});

client.on('stanza', function(stanza) {
    console.log('Incoming stanza:', stanza.toString());
});

process.on('SIGINT', function() {
    console.log("Exiting");
    client.end();
    process.exit();
});
