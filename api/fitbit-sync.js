import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Get the user's Fitbit token
    const { data: tokenData, error: tokenError } = await supabase
      .from('wearable_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'fitbit')
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Fitbit not connected or token not found' });
    }

    let accessToken = tokenData.access_token;
    
    // Check if token is expired (basic check)
    if (new Date(tokenData.expires_at) < new Date()) {
       // Ideally we would refresh the token here using tokenData.refresh_token. 
       // For now, if it fails, the user will just need to reconnect.
       console.log('Token might be expired. Trying anyway...');
    }

    // 2. Fetch data from Fitbit APIs
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    };

    // Fetch Steps
    const activityRes = await fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, { headers });
    const activityData = activityRes.ok ? await activityRes.json() : {};
    
    // Fetch Sleep
    const sleepRes = await fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, { headers });
    const sleepData = sleepRes.ok ? await sleepRes.json() : {};

    // Fetch Heart Rate
    const hrRes = await fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, { headers });
    const hrData = hrRes.ok ? await hrRes.json() : {};

    // 3. Parse Data
    const steps = activityData.summary?.steps || null;
    const calories = activityData.summary?.caloriesOut || null;
    const sleepMin = sleepData.summary?.totalMinutesAsleep || null;
    
    let restingHr = null;
    if (hrData['activities-heart'] && hrData['activities-heart'].length > 0) {
        restingHr = hrData['activities-heart'][0].value?.restingHeartRate || null;
    }

    // 4. Save to wearable_readings table
    const reading = {
      user_id: userId,
      source: 'fitbit',
      reading_date: today,
      steps: steps,
      calories: calories,
      sleep_min: sleepMin,
      heart_rate: restingHr,
      raw_payload: { activityData, sleepData, hrData }
    };

    const { error: dbError } = await supabase
      .from('wearable_readings')
      .insert([reading]);

    if (dbError) {
      throw dbError;
    }

    res.status(200).json({ success: true, reading });

  } catch (err) {
    console.error('Fitbit Sync Error:', err);
    res.status(500).json({ error: 'Internal server error during sync' });
  }
}
