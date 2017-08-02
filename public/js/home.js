const heartIcon = [].slice.call(document.querySelectorAll(".heart-icon"));
const likeIcon = [].slice.call(document.querySelectorAll(".like-icon"));
const imagesArr = [].slice.call(document.querySelectorAll("img"));
const addToCartBtn = [].slice.call(document.querySelectorAll('button[name="add-to-cart-btn"]'));
const cartAddMessage = [].slice.call(document.querySelectorAll(".addedToCart-msg"));

const removeFromCartBtn = [].slice.call(document.querySelectorAll(".remove-from-cart-icon"));

const sortingArr = [].slice.call(document.querySelectorAll(".sorting"));

const logoutBtn = document.getElementById("logoutBtn");
const viewCartBtn = document.querySelector('button[name="view-cart-btn"]');
const all = document.querySelector(".all");
const logo = document.querySelector(".logo");


if (location.pathname === "/home/mains") {
    sortingArr[0].classList.add("active-category");
} else if (location.pathname === "/home/sides") {
    sortingArr[1].classList.add("active-category");
} else if (location.pathname === "/home/desserts") {
    sortingArr[2].classList.add("active-category");
} else if (location.pathname === "/home/") {
    all.classList.add("active-category");
}
sortingArr.forEach(function(e) {
    e.addEventListener("click", function() {
        window.location = `/home/${this.dataset.category}`
    });
});


// ###############################################################
// sorting items with their category
if (all) {
    all.addEventListener("click", function() {
        window.location = "/home";
    });
}

// ###############################################################
// click on image events

imagesArr.forEach(function(e) {

    e.addEventListener("click", function() {
        window.location = `/product/${this.dataset.productid}`;
    });

});

// ###############################################################

logoutBtn.addEventListener("click", function() {
    window.location = "/logout";
});

// ###############################################################

if (viewCartBtn) {
    viewCartBtn.addEventListener("click", function() {
        window.location = "/mycart";
    });
}



// ###############################################################
// remove from cart event
removeFromCartBtn.forEach(function(e) {
    e.addEventListener("click", function() {
        axios.post("/mycart", {
            id: this.dataset.id
        }).then((res) => {
            location.reload();
        });
    });
});


// ###############################################################

// Add to Cart Event

addToCartBtn.forEach(function(e) {
    e.addEventListener("click", function() {

        if (this.nextElementSibling.value > 0) {

            axios.post("/home", {
                qty: this.nextElementSibling.value,
                id: this.value
            }).then((res) => {
                this.nextElementSibling.value = "";
                this.nextElementSibling.style.outline = "none";
                console.log(res);
                viewCartBtn.innerHTML = res.data;

                var tempVar = this;
                let mycartAddMessage = cartAddMessage.find((e) => {
                    return e.dataset.id === tempVar.value; //check if id on addToCartBtn is same as paragraph with error message
                });

                mycartAddMessage.style.display = "block";
                mycartAddMessage.style.color = "limegreen";
                mycartAddMessage.innerHTML = "Successfully Added to Cart!"
                setTimeout(function() {
                    mycartAddMessage.style.display = "none";
                }, 5000);
            });

        } else {
            var tempVar = this;
            let mycartAddMessage = cartAddMessage.find((e) => {
                return e.dataset.id === tempVar.value;
            });

            mycartAddMessage.style.display = "block"; //make it appear
            mycartAddMessage.style.color = "red"; //red mean danger
            mycartAddMessage.innerHTML = "Specify Quantity To Order Before Adding to Cart"; //message changes for error
            this.nextElementSibling.focus(); //autofocus try
            this.nextElementSibling.style.outline = "2px solid red"; //red border around qty
        }


    });
});



// ###############################################################

heartIcon.forEach(function(e) {
    e.style.fill = "transparent";
    e.style.stroke = "black";

    var heartflag = 0;
    e.addEventListener("click", function() {
        if (heartflag === 0) {
            var heartsCount = parseInt(this.nextElementSibling.innerHTML);
            heartsCount++;
            this.nextElementSibling.innerHTML = heartsCount;
            heartflag++;
            this.style.fill = "red";
            this.style.stroke = "red";
        } else if (heartflag === 1) {
            var heartsCount = parseInt(this.nextElementSibling.innerHTML);
            heartsCount--;
            this.nextElementSibling.innerHTML = heartsCount;
            heartflag--;
            this.style.fill = "transparent";
            this.style.stroke = "black";
        }

        axios.post("/home", {
            heartsCount: heartsCount,
            id: this.dataset.productid
        }).then((res) => {
            let a = res;
        });

    });

});

// ###############################################################

likeIcon.forEach(function(e) {
    e.style.fill = "transparent";
    e.style.stroke = "black";

    var likeflag = 0;
    e.addEventListener("click", function() {
        if (likeflag === 0) {
            var likesCount = parseInt(this.nextElementSibling.innerHTML);
            likesCount++;
            this.nextElementSibling.innerHTML = likesCount;
            likeflag++;
            this.style.fill = "blue";
            this.style.stroke = "blue";
        } else if (likeflag === 1) {
            var likesCount = parseInt(this.nextElementSibling.innerHTML);
            likesCount--;
            this.nextElementSibling.innerHTML = likesCount;
            likeflag--;
            this.style.fill = "transparent";
            this.style.stroke = "black";
        }

        axios.post("/home", {
            likesCount: likesCount,
            id: this.dataset.productid
        }).then((res) => {
            let b = res;
        });

    });

});;



logo.addEventListener("click", function() {
    window.location = "/home";
});
