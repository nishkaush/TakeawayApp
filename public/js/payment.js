const backToHomeBtn = document.querySelector('button[name="back-to-home"]');

backToHomeBtn.addEventListener("click", function() {
    window.location = "/home";
});


var stripe = Stripe("pk_test_A5hHeSSpseezUCMKluUl99eK");
var elements = stripe.elements();

const checkoutForm = document.querySelector("#checkoutForm");
const customerName = document.querySelector("#customerName");
const address = document.querySelector("#address");
const cardholderName = document.querySelector("#cardholderName");
const ccNumber = document.querySelector("#ccNumber");
const expMonth = document.querySelector("#expMonth");
const expYear = document.querySelector("#expYear");
const cvc = document.querySelector("#cvc");
const buyNowBtn = document.querySelector('#buyNowBtn');


var card = elements.create("card");
card.mount(ccNumber);

checkoutForm.addEventListener("submit", function(e) {
    e.preventDefault();

    var cardDetailsObj = {
        name: cardholderName.value,
    };

    stripe.createToken(card, cardDetailsObj).then((result) => {
        if (result.token) {
            buyNowBtn.disabled = true;
            buyNowBtn.value = "Processing...";
            ccNumber.value = "";
            this.reset();
            console.log(result.token);
        } else if (result.error) {
            console.log(result.error);
        }
    }).catch((e) => {
        console.log("shit went south with token creation", e);
    });

});
