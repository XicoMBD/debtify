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
  return Meteor.users.find({}, {fields: {"profile": 1}});
});

Accounts.onCreateUser(function(options, user) {
    if (options.profile) {
        options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/";
        user.profile = options.profile;
    }
    return user;
});

//Meteor.users.remove({});
//Payments.remove({});
//Purchases.remove({});
//Debts.remove({});
