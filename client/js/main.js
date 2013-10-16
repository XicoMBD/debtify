Meteor.subscribe("purchases")
Meteor.subscribe("debts")
Meteor.subscribe("payments")
Meteor.subscribe("allUserData");

// Send a message by inserting into the Messages collection
function submitPurchase () {
  var title = $("#purchase").val()
  var price = $("#price").val()
  
  if (!title || title == "") return;
  
  var buyers = [];
    $('input[name=buyer]:checked').each(function() {
      buyers.push($(this).val());
    });
  
  Purchases.insert({
    creator: Meteor.userId()
    , price: price
    , title: title
    , buyers: buyers
  }, function(error, result){
	  for (var i = 0; i < buyers.length; i++) {
		Debts.insert({
			purchaseId: result
		  , title: title
		  , creditor: Meteor.userId()
		  , debtor: buyers[i]
		  , price: (price / buyers.length)
		  , paid: (Meteor.userId() == buyers[i])
		})
	  }
  });
  
  $("#purchase").val()
}

// Events for sending messages and saving handle to localStorage
Template.addPurchase.events({
  "click #send": submitPurchase,
  "keyup #handle": function () {
    if (localStorage) {
      localStorage.setItem("handle", $("#handle").val())
    }
  },
  "keypress #purchase": function (event) {
    if (event.which == 13) {
      event.preventDefault()
      submitPurchase()
    }
  }
})

// When the remove button is clicked on a chat message, delete
// that message.
Template.purchase.events({
  "click #remove": function () {
	console.log(this._id);
    Purchases.remove(this._id);
    var associatedDebts = Debts.find({"purchaseId": this._id}).fetch();
    for (var i = 0; i < associatedDebts.length; i++) {
		Debts.remove(associatedDebts[i]._id);
	}
  }
});

// Send a message by inserting into the Messages collection
function registerPayment (debt) {
  var paymentValue = $("#paymentValue")
  if (!paymentValue.val()) return;
  
  if(debt.value > 0) {
    Payments.insert({
      creator: Meteor.userId()
      , payer: Meteor.userId()
      , payee: debt.user
      , amount: paymentValue.val()
      , confirmed: false
      , used: false
    }, function(error, result){
      paymentValue.val("")
    });
  } else {
    Payments.insert({
      creator: Meteor.userId()
      , payer: debt.user
      , payee: Meteor.userId()
      , amount: paymentValue.val()
      , confirmed: false
      , used: false
    }, function(error, result){
      paymentValue.val("")
    });
  }
}

// Get the messages for the template
Template.debts.debts = function () {
  var allDebts = Debts.find({"creditor":Meteor.userId()}).fetch();
  allDebts = allDebts.concat(Debts.find({"debtor":Meteor.userId()}).fetch());
  var allPayments = Payments.find({"payee":Meteor.userId()}).fetch();
  allPayments = allPayments.concat(Payments.find({"payer":Meteor.userId()}).fetch());
  
  var debtsByUser = [];
  
  for (var i = 0; i < allDebts.length; i++) {
	if(allDebts[i].paid == false) {
	  var debt = new Object();
	  if(allDebts[i].debtor == Meteor.userId()) {
        debt.user = allDebts[i].creditor;
        debt.value = Number(allDebts[i].price);
	  } else {
	    debt.user = allDebts[i].debtor;
	    debt.value = -Number(allDebts[i].price);
	  }
	  
	  for (var o = 0; o < debtsByUser.length && debtsByUser[o].user != debt.user; o++);
	
      if(debtsByUser[o]) {
        debtsByUser[o].value += debt.value;
      } else {
        debtsByUser.push(debt);
      }
    }
  }

  for (var i = 0; i < allPayments.length; i++) {
	if(allPayments[i].used == false) {
	  var debt = new Object();
	  if(allPayments[i].payer == Meteor.userId()) {
        debt.user = allPayments[i].payee;
        debt.value = -Number(allPayments[i].amount);
	  } else {
	    debt.user = allPayments[i].payer;
	    debt.value = Number(allPayments[i].amount);
	  }
	  
	  for (var o = 0; o < debtsByUser.length && debtsByUser[o].user != debt.user; o++);
	
      if(debtsByUser[o]) {
        debtsByUser[o].value += debt.value;
      } else {
        debtsByUser.push(debt);
      }
    }
  }
  
  for (var o = 0; o < debtsByUser.length; o++){
    if(debtsByUser[o].value < 0) {
      debtsByUser[o].class = "success";
      debtsByUser[o].action = "Receive";
	} else if(debtsByUser[o].value > 0) {
	  debtsByUser[o].class = "danger";
      debtsByUser[o].action = "Pay";
	} else {
	  var associatedDebts = Debts.find({"debtor": Meteor.userId(), "creditor": debtsByUser[o].user}).fetch();
	  associatedDebts = associatedDebts.concat(Debts.find({"creditor": Meteor.userId(), "debtor": debtsByUser[o].user}).fetch());
	  var associatedPayments = Payments.find({"payer": Meteor.userId(), "payee": debtsByUser[o].user}).fetch();
	  associatedPayments = associatedPayments.concat(Payments.find({"payee": Meteor.userId(), "payer": debtsByUser[o].user}).fetch());
	  
      for (var i = 0; i < associatedDebts.length; i++) {
        Debts.update(associatedDebts[i]._id, {$set: {paid:true}});
      }
      for (var i = 0; i < associatedPayments.length; i++) {
        Payments.update(associatedPayments[i]._id, {$set: {used:true}});
      }
	}
  }
  
  return debtsByUser
}

// When the remove button is clicked on a chat message, delete
// that message.
Template.debt.events({
  "click #registerPayment": function () {
	  registerPayment(this);
  }
});

// Get the messages for the template
Template.purchases.purchases = function () {
  return Purchases.find().fetch()
}

// Get the messages for the template
Template.payments.payments = function () {
  return Payments.find().fetch()
}

// Get the users for the template
Template.users.users = function () {
  return Meteor.users.find().fetch()
}

// When the messages have been rendered, scroll to the bottom of the page
Template.purchases.rendered = function () {
  //$("html, body").animate({scrollTop: $(document).height()}, 1000)
}

// Turn an email address into a gravatar URL
Template.purchase.gravatar = function (email) {
  return "http://www.gravatar.com/avatar/" + $.md5(email) + "?s=50&d=retro"
}

// Turn an id into a gravatar URL
Template.payment.getPicture = function (id) {
  if(Meteor.users.findOne({"_id": id})) {
    return Meteor.users.findOne({"_id": id}).profile.picture;
  }
}

// Create a fuzzy from time from a timestamp
Template.payment.fromnow = function (ms) {
  return moment(ms).fromNow()
}

// Turn an id into a gravatar URL
Template.purchase.getPicture = function (id) {
  if(Meteor.users.findOne({"_id": id})) {
    return Meteor.users.findOne({"_id": id}).profile.picture;
  }
}

// Turn an id into a gravatar URL
Template.debt.getPicture = function (id) {
  if(Meteor.users.findOne({"_id": id})) {
    return Meteor.users.findOne({"_id": id}).profile.picture;
  }
}

// Create a fuzzy from time from a timestamp
Template.purchase.fromnow = function (ms) {
  return moment(ms).fromNow()
}

// Get or generate the user's handle
Template.addPurchase.rendered = function () {
  var handle = localStorage.getItem("handle") || Math.random().toString(36).substring(7) + "@gravatar.com"
  $("#handle").val(handle)
}
