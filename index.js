const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const _ = require('underscore');

// import "https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.12/js/framework7.bundle.min.js";
// import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.24.0/firebase-app.js";
// import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.24.0/firebase-database.js"
// // Your web app's Firebase configuration
// import firebaseConfig from "firebase.js";

// //initialize framework 7
// var myApp = new Framework7();

// // If your using custom DOM library, then save it to $$ variable
// var $$ = Dom7;

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

const port = process.env.PORT || parseInt(process.argv.pop()) || 3002;

server.listen(port, function() {
    console.log("Server listening at port %d", port);
});

// const ShwarmaOrder = require("./ShawarmaOrder");
const DeliOrder = require("./DeliOrder");
const e = require('express');
const { exception } = require('console');

// Create a new express application instance

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("www"));

let oSockets = {};
let oOrders = {};
app.post("/payment/:phone", (req, res) => {
    // this happens when the order is complete
    sFrom = req.params.phone;
    const aReply = oOrders[sFrom].handleInput(req.body);
    const oSocket = oSockets[sFrom];
    //let sAddress = ""; //"<Response>";
    // send messages out of turn
    for (let n = 0; n < aReply.length; n++) {
        if (oSocket) {
            // for (let n = 0; n < aReply.length; n++) {
            //     //sAddress += "<Message>";
            //     sAddress += aReply[n];
            //     //sAddress += "<Message>";
            // }
            //sAddress += "</Message>";
            const data = {
                message: aReply[n]
            };
            oSocket.emit('receive message', data);
            // oSocket.emit('receive message', sAddress);

            // if (aReply == shipping.address) {
            //     console.log(data);
            // }
        } else {
            throw new Exception("twilio code would go here");
        }
    }
    if (oOrders[sFrom].isDone()) {
        delete oOrders[sFrom];
        delete oSockets[sFrom];
    }

    const todoID = new Date().toISOString().replace(".", "_");
    // firebase.database().ref('Orders/' + todoID).set({
    //     prop1: aReply[0],
    //     prop2: aReply[1],
    //     prop3: aReply[2],
    //     prop4: aReply[3],
    //     prop5: aReply[4],
    //     prop6: aReply[5],
    //     prop7: aReply[6]
    // }).catch(e => {
    //     console.log(e.toString());
    // });
    res.end("ok");
});

app.get("/payment/:phone", (req, res) => {
    // this happens when the user clicks on the link in SMS
    const sFrom = req.params.phone;
    if (!oOrders.hasOwnProperty(sFrom)) {
        res.end("order already complete");
    } else {
        res.end(oOrders[sFrom].renderForm());
    }
});

app.post("/payment", (req, res) => {
    // this happens when the user clicks on the link in SMS
    //const sFrom = req.params.phone;
    const sFrom = req.body.telephone;
    // oOrders[sFrom] = new ShwarmaOrder(sFrom);
    oOrders[sFrom] = new DeliOrder(sFrom);
    res.end(oOrders[sFrom].renderForm(req.body.title, req.body.price));
});

app.post("/sms", (req, res) => {
    // turn taking SMS
    let sFrom = req.body.From || req.body.from;
    let sUrl = `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.headers.host}${req.baseUrl}`;
    if (!oOrders.hasOwnProperty(sFrom)) {
        //oOrders[sFrom] = new ShwarmaOrder(sFrom, sUrl);
        oOrders[sFrom] = new DeliOrder(sFrom, sUrl);
    }
    if (oOrders[sFrom].isDone()) {
        delete oOrders[sFrom];
    }
    let sMessage = req.body.Body || req.body.body;
    let aReply = oOrders[sFrom].handleInput(sMessage);
    res.setHeader('content-type', 'text/xml');
    let sResponse = "<Response>";
    for (let n = 0; n < aReply.length; n++) {
        sResponse += "<Message>";
        sResponse += aReply[n];
        sResponse += "</Message>";
    }
    res.end(sResponse + "</Response>");
});

io.on('connection', function(socket) {
    // when the client emits 'receive message', this listens and executes
    socket.on('receive message', function(data) {
        // set up a socket to send messages to out of turn
        const sFrom = _.escape(data.from);
        oSockets[sFrom] = socket;
    });
});