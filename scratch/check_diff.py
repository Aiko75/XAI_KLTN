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

completed_users = users[~users.apply(is_admin_test, axis=1) & users['end_time'].notna()]

group_thresh = {'A': 2.0, 'B': 3.0, 'C': 4.0}

print(f"Total Completed Users: {len(completed_users)}")

for idx, u in completed_users.iterrows():
    uid = u['user_id']
    g = u['group_assigned']
    u_l = user_logs.get(uid)
    
    if u_l is None or len(u_l) < 20:
        print(f"EXCLUDED (<20): {u['name']} ({uid}) - Group {g}")
        continue
        
    thresh = group_thresh[g]
    sorted_logs = u_l.sort_values('scenario_id').to_dict('records')
    
    # Tier 2: Collapse Point Detection (scenario_id >= 3, index >= 2)
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
        print(f"EXCLUDED (Collapse early <10): {u['name']} ({uid}) - Group {g} - Collapse at scenario {sorted_logs[collapse_idx]['scenario_id']} (valid count = {len(valid_logs)})")
        continue
        
    if len(valid_logs) == 20:
        approves = sum(1 for l in valid_logs if str(l['user_decision']).lower() in ['agree', 'approve'])
        rejects = sum(1 for l in valid_logs if str(l['user_decision']).lower() == 'reject')
        max_rep = max(approves, rejects)
        
        if max_rep >= 19:
            print(f"EXCLUDED (Straight-lining >=19): {u['name']} ({uid}) - Group {g} - {max_rep}/20 identical choices")
            continue
            
    if len(valid_logs) == 20:
        print(f"FULL CLEAN (20/20): {u['name']} ({uid}) - Group {g}")
    else:
        print(f"PARTIAL CLEAN ({len(valid_logs)}/20): {u['name']} ({uid}) - Group {g} - Collapse at scenario {sorted_logs[collapse_idx]['scenario_id']}")
