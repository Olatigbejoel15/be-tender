export type Faq = { question: string; answer: string };

// SAMPLE answers: change them to match how YOUR business really works
// (delivery times, return rules, prices) before launch.
export const faqs: Faq[] = [
  { question: "How long does delivery take?",
    answer: "Orders within Lagos usually arrive in 1 to 3 working days. Other states take 3 to 7 working days. You'll get a tracking update once your order ships." },
  { question: "Is delivery free?",
    answer: "Delivery is free on orders over ₦50,000. Below that, the fee is calculated at checkout based on your location." },
  { question: "What is your returns policy?",
    answer: "You can return unworn items with their tags within 30 days of delivery for an exchange or refund. Contact us first so we can guide you." },
  { question: "How do I find my size?",
    answer: "Each product page will include a size guide. If you're between sizes, we recommend sizing up for a relaxed fit. You can also message us on WhatsApp for help." },
  { question: "How do I pay?",
    answer: "We accept card payments, bank transfer and USSD through our secure payment partner. We never see or store your card details." },
  { question: "How should I wash my gym wear?",
    answer: "Machine wash cold with similar colors, and avoid fabric softener and high heat. Air dry to keep the stretch and shape for longer." },
  { question: "Can I change or cancel my order?",
    answer: "Yes, as long as it hasn't shipped. Message us as soon as possible with your order number." },
];