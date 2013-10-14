Purchases = new Meteor.Collection("purchases")
Debts = new Meteor.Collection("debts")

Purchases.allow({
  insert: function (userId, purchase) {
    purchase.created = Date.now() // Add timestamp server side so client can't effect message ordering
    return true
  },
  remove: function (userId, purchase) {
    if(userId == purchase.creator) {
		return true
	} else {
	  return false
    }
  }
})

Debts.allow({
  insert: function (userId, debt) {
    debt.created = Date.now() // Add timestamp server side so client can't effect message ordering
    return true
  }
})
