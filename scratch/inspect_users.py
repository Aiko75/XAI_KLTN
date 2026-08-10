import pandas as pd

df = pd.read_csv(r'd:\My_projects\XAI_KLTN\data\2nd test\users_rows.csv')
print("Total rows in CSV:", len(df))
print("\nAll User IDs and Names:")
for idx, r in df.iterrows():
    print(f"[{idx+1}] ID: {r['user_id']} | Name: '{r['name']}' | Group: {r['group_assigned']} | EndTime: {r['end_time']}")
