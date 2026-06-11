export const discoveryData = {
  herbs: [
    { name: "Ashwagandha", benefit: "Helps the body manage stress and reduce anxiety.", icon: "Leaf", image: "/ashwaganda.jfif", tags: ["stress", "sleep", "ayurveda"] },
    { name: "Chamomile", benefit: "Promotes calm and improves sleep quality naturally.", icon: "Flower2", image: "/Chamomile.jfif", tags: ["sleep", "calm", "tea"] },
    { name: "Ginger", benefit: "Soothes digestion and reduces mild nausea.", icon: "Flame", image: "/Ginger.jfif", tags: ["digestion", "immunity", "spice"] },
    { name: "Turmeric", benefit: "Contains curcumin, known for strong anti-inflammatory effects.", icon: "Sun", image: "/Turmeric.jfif", tags: ["inflammation", "immunity", "spice"] },
    { name: "Moringa (Shiferaw)", benefit: "Ethiopian superfood rich in vitamins, minerals, and antioxidants. Great for energy.", icon: "TreePine", image: "https://images.unsplash.com/photo-1621245840656-74fcba922c06?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "energy", "superfood"], vid: "q_rQ-rQzZLQ" },
    { name: "Korerima (Ethiopian Cardamom)", benefit: "Supports digestion and respiratory health, commonly used in Ethiopian stews.", icon: "Sparkles", image: "https://images.unsplash.com/photo-1596647271465-d44933a0bcf8?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "digestion", "spice"] },
    { name: "Abish (Fenugreek)", benefit: "Excellent for digestion, controlling blood sugar, and supporting lactation.", icon: "Droplets", image: "https://images.unsplash.com/photo-1600857317765-1d3744cc1ab0?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "digestion", "metabolism"] },
    { name: "Tena Adam (Rue)", benefit: "Traditionally used in Ethiopian coffee for stomach aches and headaches.", icon: "Leaf", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "pain-relief", "herb"] },
    { name: "Koso", benefit: "Traditional Ethiopian medicinal plant known for anti-parasitic properties.", icon: "TreePine", image: "https://images.unsplash.com/photo-1621245840656-74fcba922c06?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "cleansing", "traditional"] }
  ],
  foods: [
    { name: "Red Teff", benefit: "Gluten-free ancient Ethiopian grain packed with iron and protein.", icon: "Wheat", image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "iron", "grain"], vid: "uQ_rQ_rQzLQ" },
    { name: "Beso (Roasted Barley)", benefit: "Energy-dense Ethiopian breakfast drink/snack, great for gut health.", icon: "Coffee", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "energy", "breakfast"] },
    { name: "Telba (Flaxseed Drink)", benefit: "Rich in Omega-3s and fiber. Excellent for heart health and digestion.", icon: "Droplet", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "heart", "omega3"] },
    { name: "Avocado", benefit: "High in healthy fats to support heart and skin health.", icon: "Heart", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80", tags: ["heart", "fats"] },
    { name: "Blueberries", benefit: "Rich in antioxidants that protect your brain and cells.", icon: "Droplet", image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80", tags: ["brain", "antioxidants"] },
    { name: "Shiro (Chickpea Stew)", benefit: "High in plant protein and fiber, a staple of Ethiopian fasting (Tsom).", icon: "Flame", image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "protein", "tsom"] }
  ],
  tips: [
    { name: "Morning Hydration", benefit: "Drink a glass of water before coffee to kickstart metabolism.", icon: "Droplets", image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80", tags: ["morning", "hydration"] },
    { name: "The 20-20-20 Rule", benefit: "Every 20 mins, look 20 feet away for 20 seconds to rest eyes.", icon: "Eye", image: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&w=400&q=80", tags: ["eyes", "focus"] },
    { name: "Deep Breathing", benefit: "Take 5 deep belly breaths to lower cortisol immediately.", icon: "Lungs", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=400&q=80", tags: ["stress", "breathing"], vid: "aNXKjgVcwGQ" },
    { name: "Tsom (Fasting) Tips", benefit: "During Ethiopian fasting periods, ensure you combine grains and legumes (like Teff and Shiro) for complete proteins.", icon: "Activity", image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "fasting", "tsom"] },
    { name: "Gebeta (Communal Eating)", benefit: "Sharing meals fosters social connection, which is proven to lower stress and increase longevity.", icon: "Users", image: "https://images.unsplash.com/photo-1528605105345-5344ea20e269?auto=format&fit=crop&w=400&q=80", tags: ["ethiopian", "social", "mental-health"] }
  ]
};

export const chatFlow = [
  {
    question: "Hi there 🌿 What's bothering you today?",
    options: ["Headache", "Stomach Pain", "Fatigue", "Cold / Flu symptoms"],
    field: "symptom"
  },
  {
    question: "How severe would you say it is?",
    options: ["Mild", "Moderate", "Severe"],
    field: "severity"
  },
  {
    question: "How long have you been feeling this way?",
    options: ["Just started today", "A few days", "A week or more"],
    field: "duration"
  }
];

export function getDailyTip() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const allTips = [...discoveryData.herbs, ...discoveryData.foods, ...discoveryData.tips];
  return allTips[dayOfYear % allTips.length];
}
