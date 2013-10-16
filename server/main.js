Meteor.publish("purchases", function (opts) {
  return Purchases.find({})
})

Meteor.publish("debts", function (opts) {
  return Debts.find({})
})

Meteor.publish("payments", function (opts) {
  return Payments.find({})
})

Meteor.publish("allUserData", function () {
  return Meteor.users.find({}, {fields: {"emails.address": 1}});
});
