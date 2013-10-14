Meteor.subscribe("debts")
Meteor.subscribe("purchases")
Meteor.subscribe("allUserData");

// Send a message by inserting into the Messages collection
function submitPurchase () {
  var title = $("#purchase")
  
  if (!title.val()) return;
  
  var buyers = [];
    $('input[name=buyer]:checked').each(function() {
      buyers.push($(this).val());
    });
  
  Purchases.insert({
    creator: Meteor.userId()
    , handle: Meteor.user().emails[0].address
    , price: $("#price").val()
    , title: title.val()
    , buyers: buyers
  }, function(error, result){
	  for (var i = 0; i < buyers.length; i++) {
		Debts.insert({
			purchaseId: result
		  , title: title.val()
		  , creditor: Meteor.userId()
		  , debtor: buyers[i]
		  , price: ($("#price").val() / buyers.length)
		  , paid: (Meteor.userId() == buyers[i])
		})
	  }
	  
	  title.val("")
  });
}

// Events for sending messages and saving handle to localStorage
Template.input.events({
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

// Get the messages for the template
Template.purchases.purchases = function () {
  return Purchases.find({}).fetch().reverse()
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
Template.purchase.getGravatarFromId = function (id) {
  if(Meteor.users.findOne({"_id": id}).emails) {
    var email = Meteor.users.findOne({"_id": id}).emails[0].address;
    return "http://www.gravatar.com/avatar/" + $.md5(email) + "?s=20&d=retro"
  }
}

// Create a fuzzy from time from a timestamp
Template.purchase.fromnow = function (ms) {
  return moment(ms).fromNow()
}

// Get or generate the user's handle
Template.input.rendered = function () {
  var handle = localStorage.getItem("handle") || Math.random().toString(36).substring(7) + "@gravatar.com"
  $("#handle").val(handle)
}
