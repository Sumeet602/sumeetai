import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { createOrder, verifyPayment } from "../utils/api.js";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/userSlice.js";

const BillingDrawer = ({ isOpen, onClose }) => {
  const user = useSelector(state => state.user.userData);
  const dispatch = useDispatch();

  const plans = [
    { name: "Starter", price: 999, credits: 500, features: ["500 Agent Credits", "Standard Support"] },
    { name: "Pro", price: 1999, credits: 1000, features: ["1000 Agent Credits", "Priority Support", "Fast Generation"] }
  ];

  const handleUpgrade = async (plan) => {
    try {
      // 1. Create order
      const orderRes = await createOrder(plan.price, plan.name);
      if (!orderRes.data.success) throw new Error("Failed to create order");
      
      const options = {
        key: "rzp_test_fallback", // Mock Razorpay key
        amount: plan.price * 100,
        currency: "INR",
        name: "SumeetAI",
        description: `Upgrade to ${plan.name} Plan`,
        order_id: orderRes.data.order.id,
        handler: async function (response) {
          // 2. Verify Payment
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: plan.name
          });
          
          if (verifyRes.data.success) {
            alert("Payment Successful!");
            // Optimistic update
            dispatch(setUser({ ...user, plan: plan.name, credits: plan.credits, totalCredits: plan.credits }));
            onClose();
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Billing & Plans</h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-8 p-4 bg-zinc-800 rounded-2xl border border-zinc-700">
                <h3 className="text-zinc-300 text-sm font-medium mb-2">Current Plan</h3>
                <div className="text-2xl font-bold text-white mb-1">{user?.plan || "Free"}</div>
                <div className="flex justify-between text-sm text-zinc-400 mb-2 mt-4">
                  <span>Credits remaining</span>
                  <span>{user?.credits || 0} / {user?.totalCredits || 100}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, ((user?.credits || 0)/(user?.totalCredits || 100))*100))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-medium mb-4">Upgrade Plan</h3>
                {plans.map(plan => (
                  <div key={plan.name} className="p-5 border border-zinc-700 rounded-2xl hover:border-indigo-500 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white group-hover:text-indigo-400">{plan.name}</h4>
                        <p className="text-sm text-zinc-400">{plan.credits} Credits/mo</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-white">₹{plan.price}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                          <Check size={16} className="text-emerald-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => handleUpgrade(plan)}
                      className="w-full py-2.5 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
                    >
                      Upgrade to {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BillingDrawer;
