const express = require("express");
const Stripe = require("stripe");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-checkout-session
// Creates a Stripe Checkout session and returns the redirect URL
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({ message: "planId is required." });
    }

    // Get the plan from our database
    const [plans] = await db.query(
      "SELECT * FROM plans WHERE id = ? AND is_active = TRUE",
      [planId]
    );

    if (plans.length === 0) {
      return res.status(404).json({ message: "Plan not found." });
    }

    const plan = plans[0];
    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5500/public";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1
        }
      ],
      success_url: `${frontendUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing.html?checkout=canceled`,
      metadata: {
        userId: String(userId),
        planId: String(plan.id)
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: String(userId),
          planId: String(plan.id)
        }
      }
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create checkout session." });
  }
});

// GET /api/payments/verify-session?session_id=...
// Called by the success page to confirm payment and activate subscription
router.get("/verify-session", verifyToken, async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "session_id is required." });
    }

    // Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.status !== "complete") {
      return res.status(400).json({ message: "Checkout not completed." });
    }

    // Security: make sure this session belongs to the logged-in user
    const sessionUserId = Number(session.metadata.userId);
    if (sessionUserId !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Get the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const planId = Number(session.metadata.planId);

    // Map Stripe status to our database enum
    let dbStatus = "none";
    if (subscription.status === "trialing" || subscription.status === "active") {
      dbStatus = "active";
    } else if (subscription.status === "past_due") {
      dbStatus = "past_due";
    } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
      dbStatus = "canceled";
    }

    // Trial end date (or billing period end if no trial)
    const endTimestamp = subscription.trial_end || subscription.current_period_end;

    // Activate subscription in our database
      await db.query(
      `UPDATE users
       SET plan_id = ?, subscription_status = ?, subscription_end = FROM_UNIXTIME(?), stripe_subscription_id = ?
       WHERE id = ?`,
      [planId, dbStatus, endTimestamp, session.subscription, req.user.id]
    );

    // Get plan name for the success message
    const [planRows] = await db.query("SELECT name FROM plans WHERE id = ?", [planId]);

    res.json({
      message: "Subscription activated.",
      planName: planRows[0] ? planRows[0].name : "Unknown",
      subscriptionStatus: dbStatus,
      subscriptionEnd: new Date(endTimestamp * 1000).toISOString()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify session." });
  }
});

// POST /api/payments/cancel-subscription
// Cancels at period end (user keeps access until then)
router.post("/cancel-subscription", verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT stripe_subscription_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0 || !users[0].stripe_subscription_id) {
      return res.status(404).json({ message: "No active subscription found." });
    }

    await stripe.subscriptions.update(users[0].stripe_subscription_id, {
      cancel_at_period_end: true
    });

    res.json({
      message: "Your subscription will cancel at the end of your billing period."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel subscription." });
  }
});
module.exports = router;