import pandas as pd

users = pd.read_csv(r'd:\My_projects\XAI_KLTN\data\2nd test\users_rows.csv')
logs = pd.read_csv(r'd:\My_projects\XAI_KLTN\data\2nd test\response_logs_rows.csv')

user_logs = {}
for uid, group in logs.groupby('user_id'):
    user_logs[uid] = group.sort_values('scenario_id')

def is_admin_test(row):
    name = str(row['name']).lower()
    uid = str(row['user_id']).lower()
    return 'test' in name or 'test' in uid or 'admin' in name

completed = users[~users.apply(is_admin_test, axis=1) & users['end_time'].notna()]
group_thresh = {'A': 2.0, 'B': 3.0, 'C': 4.0}

full_clean = []
partial_clean = []
excluded = []

for idx, u in completed.iterrows():
    uid = u['user_id']
    g = u['group_assigned']
    u_l = user_logs.get(uid)
    
    if u_l is None or len(u_l) < 20:
        continue
        
    thresh = group_thresh[g]
    sorted_logs = u_l.sort_values('scenario_id').to_dict('records')
    
    collapse_idx = -1
    for i in range(2, len(sorted_logs) - 2):
        if (sorted_logs[i]['time_spent_seconds'] < thresh and
            sorted_logs[i+1]['time_spent_seconds'] < thresh and
            sorted_logs[i+2]['time_spent_seconds'] < thresh):
            collapse_idx = i
            break
            
    valid_logs = sorted_logs
    if collapse_idx != -1:
        valid_logs = sorted_logs[:collapse_idx]
        
    if len(valid_logs) < 10:
        excluded.append(u)
        continue
        
    if len(valid_logs) == 20:
        decision_counts = {}
        for l in valid_logs:
            dec = str(l['user_decision']).lower().strip()
            decision_counts[dec] = decision_counts.get(dec, 0) + 1
        max_rep = max(decision_counts.values()) if decision_counts else 0
        if max_rep == 20: # 100% straight-lining
            excluded.append(u)
            continue
            
    if len(valid_logs) == 20:
        full_clean.append(u)
    else:
        partial_clean.append(u)

print("=== EXACT VERIFICATION WITH STRAIGHT_LINING = 20 (100%) ===")
print(f"Full Clean (20/20): {len(full_clean)}")
print(f"Partial Clean (10-19): {len(partial_clean)}")
print(f"Excluded (Early Collapse / 100% Spam): {len(excluded)}")
