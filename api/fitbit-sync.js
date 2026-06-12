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

    // 2. Fetch data from Google Fitness API
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTimeMillis = startOfDay.getTime();
    const endTimeMillis = now.getTime();

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // We use the dataset:aggregate endpoint for steps and heart rate
    const aggregateBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.step_count.delta' },
        { dataTypeName: 'com.google.heart_rate.bpm' }
      ],
      bucketByTime: { durationMillis: endTimeMillis - startTimeMillis },
      startTimeMillis,
      endTimeMillis
    };

    const aggregateRes = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers,
      body: JSON.stringify(aggregateBody)
    });

    const aggregateData = aggregateRes.ok ? await aggregateRes.json() : {};

    // Sleep requires querying sessions
    const sleepRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis - 86400000).toISOString()}&endTime=${now.toISOString()}&activityType=72`, {
      headers
    });
    const sleepData = sleepRes.ok ? await sleepRes.json() : {};

    // 3. Parse Data
    let steps = 0;
    let restingHr = null;
    let sleepMin = 0;

    if (aggregateData.bucket && aggregateData.bucket.length > 0) {
        const bucket = aggregateData.bucket[0];
        
        // Steps
        const stepDataset = bucket.dataset.find(d => d.dataSourceId.includes('step_count.delta'));
        if (stepDataset && stepDataset.point.length > 0) {
            steps = stepDataset.point.reduce((acc, p) => acc + (p.value[0].intVal || 0), 0);
        }

        // Heart Rate
        const hrDataset = bucket.dataset.find(d => d.dataSourceId.includes('heart_rate.bpm'));
        if (hrDataset && hrDataset.point.length > 0) {
            // Get an average or the first value
            restingHr = Math.round(hrDataset.point[0].value[0].fpVal || 0);
        }
    }

    // Parse sleep sessions (activityType 72)
    if (sleepData.session && sleepData.session.length > 0) {
        const totalSleepMillis = sleepData.session.reduce((acc, s) => acc + (parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis)), 0);
        sleepMin = Math.round(totalSleepMillis / 60000);
    }

    const today = now.toISOString().split('T')[0];

    // 4. Save to wearable_readings table
    const reading = {
      user_id: userId,
      source: 'fitbit',
      reading_date: today,
      steps: steps > 0 ? steps : null,
      calories: null, // Omitted for simplicity, requires calories.expended scope
      sleep_min: sleepMin > 0 ? sleepMin : null,
      heart_rate: restingHr > 0 ? restingHr : null,
      raw_payload: { aggregateData, sleepData }
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
