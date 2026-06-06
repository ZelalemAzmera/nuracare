export const discoveryData = {
  herbs: [
    { name: "Ashwagandha", benefit: "Helps the body manage stress and reduce anxiety.", icon: "Leaf", image: "/ashwaganda.jfif" },
    { name: "Chamomile", benefit: "Promotes calm and improves sleep quality naturally.", icon: "Flower2", image: "/Chamomile.jfif" },
    { name: "Ginger", benefit: "Soothes digestion and reduces mild nausea.", icon: "Flame", image: "/Ginger.jfif" },
    { name: "Turmeric", benefit: "Contains curcumin, known for strong anti-inflammatory effects.", icon: "Sun", image: "/Turmeric.jfif" },
    { name: "Echinacea", benefit: "Supports the immune system, especially during cold season.", icon: "ShieldPlus", image: "https://images.unsplash.com/photo-1621245840656-74fcba922c06?auto=format&fit=crop&w=400&q=80" },
    { name: "Peppermint", benefit: "Eases tension headaches and digestive discomfort.", icon: "Wind", image: "https://images.unsplash.com/photo-1600857317765-1d3744cc1ab0?auto=format&fit=crop&w=400&q=80" }
  ],
  fruits: [
    { name: "Blueberries", benefit: "Rich in antioxidants that protect your brain and cells.", icon: "Droplet", image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80" },
    { name: "Avocado", benefit: "High in healthy fats to support heart and skin health.", icon: "Heart", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80" },
    { name: "Papaya", benefit: "Contains enzymes that support healthy digestion.", icon: "SunDim", image: "https://images.unsplash.com/photo-1618683515865-9eb22c7a6597?auto=format&fit=crop&w=400&q=80" },
    { name: "Kiwi", benefit: "Packed with more Vitamin C than an orange.", icon: "Sparkles", image: "https://images.unsplash.com/photo-1585059895524-72359e06138a?auto=format&fit=crop&w=400&q=80" },
    { name: "Pomegranate", benefit: "Supports heart health and reduces inflammation.", icon: "Activity", image: "https://images.unsplash.com/photo-1601314115456-e910bd6b8c80?auto=format&fit=crop&w=400&q=80" },
    { name: "Bananas", benefit: "Great source of potassium for muscle recovery.", icon: "Smile", image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80" }
  ],
  tips: [
    { name: "Morning Hydration", benefit: "Drink a glass of water before coffee to kickstart metabolism.", icon: "Droplets", image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80" },
    { name: "The 20-20-20 Rule", benefit: "Every 20 mins, look 20 feet away for 20 seconds to rest eyes.", icon: "Eye", image: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&w=400&q=80" },
    { name: "Deep Breathing", benefit: "Take 5 deep belly breaths to lower cortisol immediately.", icon: "Lungs", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=400&q=80" },
    { name: "Sunlight Exposure", benefit: "Get 10 mins of morning sun to regulate your sleep cycle.", icon: "Sun", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80" },
    { name: "Mindful Eating", benefit: "Chew your food slowly to improve digestion and satisfaction.", icon: "Utensils", image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=400&q=80" },
    { name: "Evening Unplug", benefit: "Stop screens 1 hour before bed for better deep sleep.", icon: "SmartphoneOff", image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=400&q=80" }
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
  const allTips = [...discoveryData.herbs, ...discoveryData.fruits, ...discoveryData.tips];
  return allTips[dayOfYear % allTips.length];
}
