const axios = require("axios");

exports.getPaymobToken = async () => {
  const res = await axios.post("https://accept.paymob.com/api/auth/tokens", {
    api_key: process.env.PAYMOB_API_KEY,
  });
  return res.data.token;
};

exports.createPaymobOrder = async (token, items, totalAmount) => {
  try {
    const res = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: true,
        amount_cents: totalAmount * 100,
        currency: "EGP",
        items: items.map((item) => ({
          name: item.name,
          amount_cents: item.amount_cents,
          description: item.description,
          quantity: item.quantity,
        })),
      }
    );
    return res.data;
  } catch (err) {
    console.error("❌ Paymob Order Error:", err.response?.data || err.message);
    throw err;
  }
};

exports.getPaymentKey = async (token, orderId, totalAmount, billingData) => {
  const res = await axios.post(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      auth_token: token,
      amount_cents: Math.round(totalAmount * 100),
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: billingData.email || "test@example.com",
        floor: "NA",
        first_name: billingData.name?.split(" ")[0] || "First",
        street: "NA",
        building: "NA",
        phone_number: "01000000000", // مهم جدًا
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "EG",
        last_name: billingData.name?.split(" ")[1] || "Last",
        state: "NA",
      },

      currency: "EGP",
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    }
  );

  return res.data.token;
};
