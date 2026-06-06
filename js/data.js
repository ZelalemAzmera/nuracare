// Discovery Data
const discoveryData = {
  herbs: [
    { name: "Ashwagandha", benefit: "Helps the body manage stress and reduce anxiety.", icon: "leaf" },
    { name: "Chamomile", benefit: "Promotes calm and improves sleep quality naturally.", icon: "flower-2" },
    { name: "Ginger", benefit: "Soothes digestion and reduces mild nausea.", icon: "flame" },
    { name: "Turmeric", benefit: "Contains curcumin, known for strong anti-inflammatory effects.", icon: "sun" },
    { name: "Echinacea", benefit: "Supports the immune system, especially during cold season.", icon: "shield-plus" },
    { name: "Peppermint", benefit: "Eases tension headaches and digestive discomfort.", icon: "wind" }
  ],
  fruits: [
    { name: "Blueberries", benefit: "Rich in antioxidants that protect your brain and cells.", icon: "droplet" },
    { name: "Avocado", benefit: "High in healthy fats to support heart and skin health.", icon: "heart" },
    { name: "Papaya", benefit: "Contains enzymes that support healthy digestion.", icon: "sun-dim" },
    { name: "Kiwi", benefit: "Packed with more Vitamin C than an orange.", icon: "sparkles" },
    { name: "Pomegranate", benefit: "Supports heart health and reduces inflammation.", icon: "activity" },
    { name: "Bananas", benefit: "Great source of potassium for muscle recovery.", icon: "smile" }
  ],
  tips: [
    { name: "Morning Hydration", benefit: "Drink a glass of water before coffee to kickstart metabolism.", icon: "droplets" },
    { name: "The 20-20-20 Rule", benefit: "Every 20 mins, look 20 feet away for 20 seconds to rest eyes.", icon: "eye" },
    { name: "Deep Breathing", benefit: "Take 5 deep belly breaths to lower cortisol immediately.", icon: "lungs" },
    { name: "Sunlight Exposure", benefit: "Get 10 mins of morning sun to regulate your sleep cycle.", icon: "sun" },
    { name: "Mindful Eating", benefit: "Chew your food slowly to improve digestion and satisfaction.", icon: "utensils" },
    { name: "Evening Unplug", benefit: "Stop screens 1 hour before bed for better deep sleep.", icon: "smartphone-off" }
  ]
};

// Daily tip rotation based on day of year
function getDailyTip() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const allTips = [...discoveryData.herbs, ...discoveryData.fruits, ...discoveryData.tips];
  return allTips[dayOfYear % allTips.length];
}
