Meteor.publish("purchases", function (opts) {
  return Purchases.find({channel: opts.channel}, {limit: opts.limit, sort: [["created", "desc"]]})
})

Meteor.publish("allUsers", function () {
  return Meteor.users.find({});
});
Meteor.publish("allUserData", function () {
  return Meteor.users.find({}, {fields: {"emails.address": 1}});
});
