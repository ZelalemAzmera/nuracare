import json
from http.server import BaseHTTPRequestHandler
from datetime import datetime

try:
    from kenat import Kenat, get_holidays_for_year
except ImportError:
    Kenat = None
    get_holidays_for_year = None

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        today_greg = datetime.now()
        
        if Kenat:
            today = Kenat.now()
            ethiopian_date = today.get_ethiopian()
            current_holidays = get_holidays_for_year(ethiopian_date['year'])
            active_events = [h for h in current_holidays if today.is_holiday()]
            
            # Determine active season
            month = ethiopian_date['month']
            active_season = "Bega (Dry Season)"
            if month in [10, 11, 12, 13]: # Sene, Hamle, Nehase, Pagume
                active_season = "Kiremt (Rainy/Muddy Season - expect indoor limitations)"
                
            res = {
                "current_gregorian_date": today_greg.strftime("%Y-%m-%d"),
                "current_ethiopian_date": today.formatted(),
                "active_season": active_season,
                "religious_status": {
                    "is_orthodox_fasting_day": today.check_bahire_hasab_fasts(),
                    "fasting_name": "Active Fast" if today.check_bahire_hasab_fasts() else "None",
                    "dietary_restriction": "Strictly vegan (No meat, dairy, eggs, or animal fats)" if today.check_bahire_hasab_fasts() else "None"
                },
                "upcoming_occasions": [event['name'] for event in active_events]
            }
        else:
            # Fallback mock for local testing without kenat installed
            res = {
                "current_gregorian_date": today_greg.strftime("%Y-%m-%d"),
                "current_ethiopian_date": "Sene 6, 2018",
                "active_season": "Kiremt (Rainy/Muddy Season - expect indoor limitations)",
                "religious_status": {
                    "is_orthodox_fasting_day": True,
                    "fasting_name": "Wednesday Fast (Yeresu’e Fast)",
                    "dietary_restriction": "Strictly vegan (No meat, dairy, eggs, or animal fats)"
                },
                "upcoming_occasions": ["Ashenda / Shaday preparations starting soon"]
            }
            
        self.wfile.write(json.dumps(res).encode('utf-8'))
