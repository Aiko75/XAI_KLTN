import json
import pandas as pd
import numpy as np

# Load CSV files
users = pd.read_csv(r'd:\My_projects\XAI_KLTN\data\2nd test\users_rows.csv')
logs = pd.read_csv(r'd:\My_projects\XAI_KLTN\data\2nd test\response_logs_rows.csv')

def is_admin_test(row):
    name = str(row['name']).lower()
    uid = str(row['user_id']).lower()
    return 'test' in name or 'test' in uid or 'admin' in name

real_users = users[~users.apply(is_admin_test, axis=1)]
dropouts = real_users[real_users['end_time'].isna()]

print(f"Total Dropouts: {len(dropouts)}")

# Group logs by user_id
user_logs = {uid: group.sort_values('scenario_id') for uid, group in logs.groupby('user_id')}

trap_scenarios = [1, 8, 11, 16]

dropout_details = []

for idx, u in dropouts.iterrows():
    uid = u['user_id']
    g = u['group_assigned']
    u_l = user_logs.get(uid)
    
    if u_l is None or len(u_l) == 0:
        dropout_details.append({
            'user': u,
            'scenarios_answered': 0,
            'stopped_scenario': 0,
            'avg_time': 0,
            'total_time': 0,
            'traps_answered': 0,
            'traps_correct': 0,
            'hovers': 0,
            'chats': 0,
            'clicks': 0
        })
        continue
        
    sorted_logs = u_l.sort_values('scenario_id').to_dict('records')
    answered_count = len(sorted_logs)
    stopped_sid = sorted_logs[-1]['scenario_id']
    
    times = [l['time_spent_seconds'] for l in sorted_logs]
    avg_time = round(np.mean(times), 2)
    total_time = round(np.sum(times), 2)
    
    hovers = sum(l.get('hover_count', 0) or 0 for l in sorted_logs)
    chats = sum(l.get('chat_count', 0) or 0 for l in sorted_logs)
    clicks = sum(l.get('interactive_clicks', 0) or 0 for l in sorted_logs)
    
    traps_answered = sum(1 for l in sorted_logs if l['scenario_id'] in trap_scenarios)
    traps_correct = sum(1 for l in sorted_logs if l['scenario_id'] in trap_scenarios and l.get('is_correct_on_error_case') == True)
    
    dropout_details.append({
        'user': u,
        'scenarios_answered': answered_count,
        'stopped_scenario': stopped_sid,
        'avg_time': avg_time,
        'total_time': total_time,
        'traps_answered': traps_answered,
        'traps_correct': traps_correct,
        'hovers': hovers,
        'chats': chats,
        'clicks': clicks
    })

print(f"Processed {len(dropout_details)} dropouts.")
for d in dropout_details:
    u = d['user']
    print(f"  - {u['name']} (ID: {u['user_id']}) | Group: {u['group_assigned']} | Answered: {d['scenarios_answered']}/20 | Stopped at Scenario: {d['stopped_scenario']} | Avg Time: {d['avg_time']}s | Traps: {d['traps_correct']}/{d['traps_answered']}")
