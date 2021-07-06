import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.24.0/firebase-app.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.24.0/firebase-database.js"
// Your web app's Firebase configuration
import firebaseConfig from "./firebase.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


window.fSaveOrder = (oOrder)=>{
    const todoID = new Date().toISOString().replace(".", "_");
    firebase.database().ref('orders/' + todoID).set(oOrder).then(() => {
        alert("Order Saved");
        window.open("", "_self");
        window.close();
    }).catch(e => {
        console.log(e.toString());
    });

}