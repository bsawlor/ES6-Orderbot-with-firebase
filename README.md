# <a href="https://github.com/bsawlor/Orderbot-with-firebase" target="_blank">Order Bot with Firebase</a>>

This is based on a starting SMS app provided by RHildred (<a href="https://github.com/rhildred/twiliobot2021" target="_blank"> ES6 Order Bot </a>)

This app is currently configured to store orders in an existing firebase.

If you want to change the firebase: 

1. Create a web app on firebase
2. In the SDK configuration, copy everything in the firebaseConfig var
3. Replace everything in the firebase.js export default var/object. 

To run:

1. Sign up for paypal developer sandbox and get a client id
2. The first time run `npm install`
3. `SB_CLIENT_ID=<put_in_your_client_id> npm start`