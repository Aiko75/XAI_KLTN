import json
import pandas as pd
import numpy as np

# 1. Load Scenarios JSON
with open(r'd:\My_projects\XAI_KLTN\src\data\scenarios.json', 'r', encoding='utf-8') as f:
    scenarios_data = json.load(f)

scenario_list = scenarios_data.get('scenarios', [])

# 2. Load CSV logs
users = pd.read_csv(r'd:\My_projects\XAI_KLTN\data\2nd test\users_rows.csv')
logs = pd.read_csv(r'd:\My_projects\XAI_KLTN\data\2nd test\response_logs_rows.csv')

def is_admin_test(row):
    name = str(row['name']).lower()
    uid = str(row['user_id']).lower()
    return 'test' in name or 'test' in uid or 'admin' in name

completed_users = users[~users.apply(is_admin_test, axis=1) & users['end_time'].notna()]
user_logs = {uid: group.sort_values('scenario_id') for uid, group in logs.groupby('user_id')}

group_thresh = {'A': 2.0, 'B': 3.0, 'C': 4.0}

clean_user_logs = {}
for idx, u in completed_users.iterrows():
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
        continue
    
    # 4-Tier filter: NO TIER 5
    clean_user_logs[uid] = (u, valid_logs)

# Map clean logs into DataFrame
all_clean_logs = []
for uid, (u, vlogs) in clean_user_logs.items():
    for l in vlogs:
        l_copy = dict(l)
        l_copy['group_assigned'] = u['group_assigned']
        all_clean_logs.append(l_copy)

clean_df = pd.DataFrame(all_clean_logs)
scenarios_by_id = {s['scenario_id']: s for s in scenario_list}

trap_scenarios = [1, 8, 11, 16]

scenario_analysis = []
for sid in range(1, 21):
    s = scenarios_by_id.get(sid, {})
    stype = s.get('scenario_type', 'normal')
    is_trap = (stype == 'trap')
    
    ai_pred = s.get('ai_prediction', {})
    ai_decision = ai_pred.get('decision', 'N/A').lower()
    
    gt = s.get('ground_truth', {})
    gt_decision = gt.get('decision', 'N/A').lower()
    
    s_logs = clean_df[clean_df['scenario_id'] == sid]
    
    stats_by_group = {}
    for g in ['A', 'B', 'C']:
        g_s_logs = s_logs[s_logs['group_assigned'] == g]
        count = len(g_s_logs)
        if count == 0:
            stats_by_group[g] = {'count': 0, 'avg_time': 0, 'correct_rate': 0, 'hovers': 0, 'chats': 0, 'clicks': 0}
            continue
        
        correct_count = 0
        for _, r in g_s_logs.iterrows():
            ud = str(r['user_decision']).lower().strip()
            if ai_decision == 'approve':
                user_chosen = 'approve' if (ud == 'agree' or ud == 'approve') else 'reject'
            else:
                user_chosen = 'reject' if (ud == 'agree' or ud == 'approve') else 'approve'
            
            if user_chosen == gt_decision:
                correct_count += 1
                
        correct_rate = round(correct_count / count * 100, 1)
        avg_time = round(g_s_logs['time_spent_seconds'].mean(), 2)
        hovers = round(g_s_logs['hover_count'].mean(), 2) if 'hover_count' in g_s_logs else 0
        chats = round(g_s_logs['chat_count'].mean(), 2) if 'chat_count' in g_s_logs else 0
        clicks = round(g_s_logs['interactive_clicks'].mean(), 2) if 'interactive_clicks' in g_s_logs else 0
        
        stats_by_group[g] = {
            'count': count,
            'avg_time': avg_time,
            'correct_rate': correct_rate,
            'hovers': hovers,
            'chats': chats,
            'clicks': clicks
        }

    profile = s.get('profile', {})
    shap = s.get('shap_summary', {})
    
    scenario_analysis.append({
        'id': sid,
        'type': 'BẪY AI (Trap Scenario)' if is_trap else 'BÌNH THƯỜNG (Normal Scenario)',
        'profile': profile,
        'ai_decision': ai_decision.upper(),
        'ai_confidence': ai_pred.get('confidence_percent', 'N/A'),
        'gt_decision': gt_decision.upper(),
        'gt_note': gt.get('note', ''),
        'shap_text': shap.get('text', ''),
        'top_factors': shap.get('top_factors', []),
        'group_A': stats_by_group['A'],
        'group_B': stats_by_group['B'],
        'group_C': stats_by_group['C']
    })

# Format Markdown Report
md_lines = []
md_lines.append("# BÁO CÁO PHÂN TÍCH CHI TIẾT 20 KỊCH BẢN THỰC NGHIỆM (SCENARIO-LEVEL ANALYSIS)")
md_lines.append("*Dựa trên dữ liệu thực nghiệm thực tế từ các người dùng sạch sau khi lọc 4 tầng (Time-Based)*\n")

md_lines.append("## I. BẢNG TỔNG QUAN HỆ THỐNG 20 KỊCH BẢN (16 KỊCH BẢN CHUẨN + 4 KỊCH BẢN BẪY)\n")
md_lines.append("| ID | Loại Kịch Bản | Credit Score | DTI (%) | Thu Nhập Tháng (VND) | Số Tiền Vay (VND) | Nợ Xấu | Đề Xuất AI | Ground Truth | Nhóm A Đúng (%) | Nhóm B Đúng (%) | Nhóm C Đúng (%) |")
md_lines.append("|---|---|---|---|---|---|---|---|---|---|---|---|")

for sa in scenario_analysis:
    p = sa['profile']
    dti_pct = round(p.get('TotalDebtToIncomeRatio', 0) * 100, 1)
    inc = f"{p.get('MonthlyIncome', 0):,}"
    loan = f"{p.get('LoanAmount', 0):,}"
    defaults = p.get('PreviousLoanDefaults', 0)
    
    line = f"| **{sa['id']}** | {sa['type']} | {p.get('CreditScore', 'N/A')} | {dti_pct}% | {inc} | {loan} | {defaults} | **{sa['ai_decision']}** ({sa['ai_confidence']}%) | **{sa['gt_decision']}** | {sa['group_A']['correct_rate']}% | {sa['group_B']['correct_rate']}% | {sa['group_C']['correct_rate']}% |"
    md_lines.append(line)

md_lines.append("\n---\n")
md_lines.append("## II. PHÂN TÍCH NỘI DUNG CHI TIẾT VÀ HÀNH VI HCI THEO TỪNG KỊCH BẢN\n")

for sa in scenario_analysis:
    p = sa['profile']
    dti_pct = round(p.get('TotalDebtToIncomeRatio', 0) * 100, 1)
    inc = f"{p.get('MonthlyIncome', 0):,}"
    loan = f"{p.get('LoanAmount', 0):,}"
    
    md_lines.append(f"### Kịch bản #{sa['id']} — {sa['type']}")
    md_lines.append(f"*   **Thông tin Hồ sơ**: Điểm tín dụng **{p.get('CreditScore')}**, DTI **{dti_pct}%**, Thu nhập **{inc} VNĐ/tháng**, Vay **{loan} VNĐ**, Tuổi **{p.get('Age')}**, Nợ xấu **{p.get('PreviousLoanDefaults')}**, Phá sản **{p.get('BankruptcyHistory')}**, Trạng thái công việc: **{p.get('EmploymentStatus')}**")
    md_lines.append(f"*   **Phán quyết AI**: Đề xuất **{sa['ai_decision']}** (Độ tin cậy: {sa['ai_confidence']}%)")
    md_lines.append(f"*   **Ground Truth (Đáp án Chuẩn)**: **{sa['gt_decision']}** — *{sa['gt_note']}*")
    md_lines.append(f"*   **Giải thích SHAP (Visual Explanation)**: {sa['shap_text']}")
    md_lines.append(f"*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:")
    md_lines.append(f"    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **{sa['group_A']['correct_rate']}%** | Tg xem **{sa['group_A']['avg_time']}s**")
    md_lines.append(f"    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **{sa['group_B']['correct_rate']}%** | Tg xem **{sa['group_B']['avg_time']}s** | Rê chuột SHAP **{sa['group_B']['hovers']} lượt**")
    md_lines.append(f"    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **{sa['group_C']['correct_rate']}%** | Tg xem **{sa['group_C']['avg_time']}s** | Rê chuột **{sa['group_C']['hovers']} lượt** | Hỏi Chatbot **{sa['group_C']['chats']} lượt** | Thử What-if **{sa['group_C']['clicks']} lượt**")
    md_lines.append("")

report_content = "\n".join(md_lines)
with open(r'd:\My_projects\XAI_KLTN\data\2nd test\Scenario_Analysis_20_Profiles.md', 'w', encoding='utf-8') as f:
    f.write(report_content)

print("✓ Scenario analysis completed and report saved to data/2nd test/Scenario_Analysis_20_Profiles.md")
