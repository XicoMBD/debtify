Purchases = new Meteor.Collection("purchases")
Debts = new Meteor.Collection("debts")
Payments = new Meteor.Collection("payments")

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
  },
  remove: function (userId, debt) {
    if(userId == debt.creditor) {
		return true
	} else {
	  return false
    }
  },
  update: function (userId, debt) {
    if(userId == debt.creditor || userId == debt.debtor) {
		return true
	} else {
	  return false
    }
  }
})

Payments.allow({
  insert: function (userId, payment) {
    payment.created = Date.now() // Add timestamp server side so client can't effect message ordering
    return true
  },
  remove: function (userId, payment) {
    if(userId == payment.payer) {
		return true
	} else {
	  return false
    }
  },
  update: function (userId, payment) {
    if(userId == payment.payer || userId == payment.payee) {
		return true
	} else {
	  return false
    }
  }
})
