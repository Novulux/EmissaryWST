

const exports = module.exports;
const BASIC_PLAN_ID = 'emissary_basic';

const Company = require('../../models/Company');

const stripe = require('stripe')(
  'sk_test_dqzYJJ6xWGgg6U1hgQr3hNye',
); // TODO: do i need to do this for every js file that uses stripe?

exports.createSubscription = function (req, res) {
	// create customer, TODO: could there be an existing stripe customer ID?
  stripe.customers.create({ // calls stripe customer create
    description: `Customer for ${req.body.stripeEmail}`,
    plan: BASIC_PLAN_ID, // TODO: move this string to a global constant
    source: req.body.stripeToken,
  }, (err, customer) => { // then passes err and customer to this callback for handling
    if (err) {
      return res.status(400).send({ error: 'Could not create customer' });
    }
		// TODO: set company's subscribed to true and
		// save customerID to account with a call to api/companies/update?
		// use localstorage to retrieve id of which company to update?
  });
};

exports.getSubscription = function (req, res) {
  Company.findOne({ _id: req.params.id }, (err, result) => {
    const stripeCustomerID = result.stripeCustomerID;
    stripe.customers.listSubscriptions(stripeCustomerID,
			(err, subscriptions) => {
  const subList = subscriptions.data;
  const index = basicPlanIndex(subList);
  if (index == -1) {
    return res.status(200).json({ error: 'Could not find' });
  }

  return res.status(200).json(subList[index]);
});
  });
};

function basicPlanIndex(arr) {
  const arrLength = arr.length;
  for (let i = 0; i < arrLength; i++) {
    if (arr[i].plan.id == BASIC_PLAN_ID) {
      return i;
    }
  }
  return -1;
}
