const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING: Symbol("welcoming"),
    SIZE: Symbol("size"),
    TOPPINGS: Symbol("toppings"),
    DRINKS: Symbol("drinks"),
    PAYMENT: Symbol("payment"),
    SALAD: Symbol("salad"),
    DESSERT: Symbol("dessert")
});

// from https://www.delftstack.com/howto/javascript/javascript-round-to-2-decimal-places/
function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

module.exports = class DeliOrder extends Order {
    constructor(sNumber, sUrl) {
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sToppings = "";
        this.sDrinks = "";
        this.sItem = "sub";
        this.sSalad = "";
        this.sDessert = "";
        this.nCost = 0;
        this.nToppings = 0;
    }
    handleInput(sInput) {
        let aReturn = [];
        var vToppings = 0.8;
        var nToppings = 3;
        var vSalad = 3.5;
        var vDessert = 2.5;
        var vDefaultCost = 15;
        var vSub06Inch = 7.99;
        var vSub12Inch = 11.99;
        switch (this.stateCur) {
            case OrderState.WELCOMING:
                this.stateCur = OrderState.SIZE;
                aReturn.push("Welcome to Franks Deli.");
                aReturn.push("What size would you like? (6 or 12 inch)");
                break;
            case OrderState.SIZE:
                this.stateCur = OrderState.TOPPINGS
                this.sSize = sInput;
                if (this.sSize.startsWith('6')) {
                    this.nCost += vSub06Inch;
                } else if (this.sSize.startsWith('12')) {
                    this.nCost += vSub12Inch;
                } else {
                    this.stateCur = OrderState.SIZE;
                    aReturn.push("Not a valid sub size, Please select 6 or 12 inch");
                    break;
                }
                aReturn.push("What toppings would you like?");
                break;
            case OrderState.TOPPINGS:
                this.stateCur = OrderState.SALAD
                this.sToppings = sInput;
                this.nToppings = (this.sToppings.match(/,/g) || []).length;
                this.nToppings++;
                if (this.nToppings > nToppings) {
                    this.nToppings -= nToppings;
                    this.nCost += (this.nToppings * vToppings);
                } else {
                    aReturn.push("Please separate the toppings with commas.")
                    this.stateCur = OrderState.TOPPINGS
                    break;
                }
                aReturn.push("Would you like a salad with your order?");
                break;
            case OrderState.SALAD:
                this.stateCur = OrderState.DESSERT
                if (sInput.toLowerCase() != "no") {
                    this.sSalad = sInput;
                    this.nCost += vSalad;
                }
                aReturn.push("Would you like a cookie, an ice cream bar, or a popsicle or no dessert with your order?");
                break;
            case OrderState.DESSERT:
                this.stateCur = OrderState.DRINKS
                if (sInput.toLowerCase().startsWith("no") || sInput.toLowerCase() == "yes") {
                    //aReturn.push("Would you like a cookie, an ice cream bar, or a popsicle?");
                    this.sDessert = sInput;
                } else this.sDessert = sInput;
                if (this.sDessert.startsWith('c') || this.sSize.startsWith('i') || this.sSize.startsWith('p')) {
                    this.nCost += vDessert;
                }
                aReturn.push("Would you like drinks with your order?");
                break;
            case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                this.nOrder = vDefaultCost;
                if (sInput.toLowerCase() != "no") {
                    this.sDrinks = sInput;
                }
                aReturn.push("Thank-you for your order of");
                aReturn.push(`${this.sSize}" ${this.sItem} with ${this.sToppings}`);
                if (this.sDrinks) {
                    aReturn.push(this.sDrinks);
                }
                if (this.sSalad != "yes") {
                    aReturn.push(this.sSalad);
                } else aReturn.push("basic salad")
                if (this.sDessert) {
                    aReturn.push(this.sDessert);
                }

                this.nCost = roundToTwo(this.nCost);

                aReturn.push(`The approx cost without tax is $${this.nCost}`);
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
            case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                var address = sInput.purchase_units[0].shipping.address.address_line_1;
                var city = sInput.purchase_units[0].shipping.address.admin_area_2;
                var province = sInput.purchase_units[0].shipping.address.admin_area_1;
                var country = sInput.purchase_units[0].shipping.address.country_code;
                var postal_code = sInput.purchase_units[0].shipping.address.postal_code;

                aReturn.push(`Your order will be delivered at ${d.toTimeString()} to: `);
                aReturn.push(`${address}`);
                aReturn.push(`${city}, ${province}`);
                aReturn.push(`${country}`);
                aReturn.push(`${postal_code}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1") {
        // your client id should be kept private
        if (sTitle != "-1") {
            this.sItem = sTitle;
        }
        if (sAmount != "-1") {
            this.nOrder = sAmount;
        }
        const sClientID = process.env.SB_CLIENT_ID || ''; // 'put your client id here for testing ... Make sure that you delete it before committing'
        return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nCost}.
        <div id="paypal-button-container"></div>
        <script src="/js/order.js" type="module"></script>
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      //"currency_code": "CAD",
                      value: '${this.nCost}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    //window.open("", "_self");
                    //window.close(); 
                    details.order = ${JSON.stringify(this)};
                    window.fSaveOrder(details);
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

    }
}