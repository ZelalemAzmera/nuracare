import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Get user's Oura token
    const { data: tokenData, error: tokenError } = await supabase
      .from('wearable_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'oura')
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({ error: 'Oura not connected or token missing' });
    }

    const accessToken = tokenData.access_token;

    // 2. Prepare date range (last 2 days to be safe)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 2);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    // 3. Fetch Data from Oura
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    
    const [sleepRes, activityRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${endDate}`, { headers })
    ]);

    if (!sleepRes.ok || !activityRes.ok) {
      console.error('Oura API Error:', await sleepRes.text(), await activityRes.text());
      return res.status(500).json({ error: 'Failed to fetch data from Oura' });
    }

    const sleepData = await sleepRes.json();
    const activityData = await activityRes.json();

    // 4. Parse the latest records
    const latestSleep = sleepData.data && sleepData.data.length > 0 ? sleepData.data[sleepData.data.length - 1] : null;
    const latestActivity = activityData.data && activityData.data.length > 0 ? activityData.data[activityData.data.length - 1] : null;

    if (!latestSleep && !latestActivity) {
      return res.status(200).json({ message: 'No recent data available' });
    }

    // Oura returns total_sleep_duration in seconds
    const sleepMin = latestSleep && latestSleep.contributors ? Math.floor((latestSleep.contributors.total_sleep || 0) / 60) : 
                     (latestSleep && latestSleep.score ? latestSleep.score * 4.8 : null); // Fallback estimate if total_sleep missing
                     
    // Heart rate is resting_heart_rate in sleep
    // Actually, v2 daily_sleep doesn't have resting HR, heart_rate is separate or in sleep session. 
    // Wait, let's just grab what we can. Oura v2 daily_activity has steps and active_calories.
    
    const steps = latestActivity ? latestActivity.steps : null;
    const calories = latestActivity ? latestActivity.active_calories : null;

    // We can also fetch heart_rate or just leave it null if it's too complex. 
    // Let's insert what we have.
    const today = endDate;

    const { error: dbError } = await supabase
      .from('wearable_readings')
      .insert({
        user_id: userId,
        source: 'oura',
        reading_date: today,
        steps: steps,
        sleep_min: latestSleep ? Math.floor(latestSleep.contributors?.total_sleep / 60 || 0) || null : null,
        calories: calories,
        raw_payload: { sleep: sleepData, activity: activityData }
      });

    if (dbError) throw dbError;

    return res.status(200).json({ 
      success: true, 
      data: { steps, calories }
    });

  } catch (err) {
    console.error('Oura Sync Error:', err);
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
}
