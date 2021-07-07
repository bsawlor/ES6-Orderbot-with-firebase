import "https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.12/js/framework7.bundle.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.24.0/firebase-app.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.24.0/firebase-database.js"
// Your web app's Firebase configuration
import firebaseConfig from "./firebase.js";

//initialize framework 7
var myApp = new Framework7();

// If your using custom DOM library, then save it to $$ variable
var $$ = Dom7;

// Add the view
myApp.view.create('.view-main', {

    // enable the dynamic navbar for this view:
    dynamicNavbar: true
});

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.database().ref('deliorders/').on("value", snapshot => {
    $$("#order_list").html("");
    let oTodos = snapshot.val();
    console.log(oTodos);
    Object.keys(oTodos).map((key) => {
        const oTodo = oTodos[key];
        console.log(oTodo);
        $$("#order_list").prepend(`<div class="border border-primary border-2 rounded mb-2 ml-5 w-auto d-inline-block p-2 shadow p-3 mb-5 bg-body bg-light bg-gradient">
        <h3 class="w-auto">Order ID:${oTodo.id}</h3>
        <p class="ml-2 w-auto">Email:${oTodo.payer.email_address}</p>
        <p class="ml-2 w-auto">Order Number: ${oTodo.order.nOrder}</p>
        <p class="ml-2 w-auto">Item Ordered: ${oTodo.order.sSize}" sub</p>
        <p class="ml-2 w-auto">Toppings: ${oTodo.order.sToppings}</p>
        <p class="ml-2 w-auto">Salad?: ${oTodo.order.sSalad}</p>
        <p class="ml-2 w-auto">Dessert?: ${oTodo.order.sDessert}</p>
        <p class="ml-2 w-auto">Drink: ${oTodo.order.sDrinks}</p>
        </div`);
    });
});