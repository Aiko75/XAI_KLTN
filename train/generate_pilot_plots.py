import os
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
sns.set_theme(style="whitegrid")

# 1. Save VI plot
def save_plots_vi():
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    groups = ['Nhóm A\n(Black-box)', 'Nhóm B\n(Visual XAI)', 'Nhóm C\n(Interactive)']
    
    agreement = [70.0, 72.5, 80.0]
    trap_detect = [30.0, 50.0, 50.0]
    x = [0, 1, 2]
    
    axes[0].bar([i - 0.2 for i in x], agreement, width=0.4, label='Tỷ lệ đồng ý với AI', color='#3182bd')
    axes[0].bar([i + 0.2 for i in x], trap_detect, width=0.4, label='Khả năng phát hiện bẫy', color='#de2d26')
    axes[0].set_ylabel('Phần trăm (%)')
    axes[0].set_title('Tỷ lệ tương tác & Phát hiện lỗi AI')
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(groups)
    axes[0].set_ylim(0, 100)
    axes[0].legend()
    
    response_time = [12.29, 9.27, 24.63]
    axes[1].bar(groups, response_time, color=['#7f7f7f', '#31a354', '#756bb1'], width=0.5)
    axes[1].set_ylabel('Thời gian (Giây)')
    axes[1].set_title('Thời gian ra quyết định trung bình')
    axes[1].set_ylim(0, 30)
    for i, v in enumerate(response_time):
        axes[1].text(i, v + 0.5, f"{v}s", ha='center', fontweight='bold')
        
    nasa_tlx = [3.73, 3.33, 3.50]
    axes[2].bar(groups, nasa_tlx, color=['#7f7f7f', '#31a354', '#756bb1'], width=0.5)
    axes[2].set_ylabel('Điểm số (Thang 1-7)')
    axes[2].set_title('Chỉ số tải nhận thức NASA-TLX')
    axes[2].set_ylim(0, 7)
    for i, v in enumerate(nasa_tlx):
        axes[2].text(i, v + 0.1, f"{v}/7", ha='center', fontweight='bold')
        
    plt.suptitle('Kết quả Thực nghiệm Sơ bộ (Pilot Test Phase) - 14 Đối tượng', fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\pilot_results.png", dpi=150, bbox_inches='tight')
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\pilot_results.png", dpi=150, bbox_inches='tight')
    plt.close()

# 2. Save EN plot
def save_plots_en():
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    groups = ['Group A\n(Black-box)', 'Group B\n(Visual XAI)', 'Group C\n(Interactive)']
    
    agreement = [70.0, 72.5, 80.0]
    trap_detect = [30.0, 50.0, 50.0]
    x = [0, 1, 2]
    
    axes[0].bar([i - 0.2 for i in x], agreement, width=0.4, label='AI Agreement Rate', color='#3182bd')
    axes[0].bar([i + 0.2 for i in x], trap_detect, width=0.4, label='Trap Detection Accuracy', color='#de2d26')
    axes[0].set_ylabel('Percentage (%)')
    axes[0].set_title('Interaction & Error Detection Rates')
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(groups)
    axes[0].set_ylim(0, 100)
    axes[0].legend()
    
    response_time = [12.29, 9.27, 24.63]
    axes[1].bar(groups, response_time, color=['#7f7f7f', '#31a354', '#756bb1'], width=0.5)
    axes[1].set_ylabel('Time (Seconds)')
    axes[1].set_title('Average Decision Time')
    axes[1].set_ylim(0, 30)
    for i, v in enumerate(response_time):
        axes[1].text(i, v + 0.5, f"{v}s", ha='center', fontweight='bold')
        
    nasa_tlx = [3.73, 3.33, 3.50]
    axes[2].bar(groups, nasa_tlx, color=['#7f7f7f', '#31a354', '#756bb1'], width=0.5)
    axes[2].set_ylabel('Score (1-7 scale)')
    axes[2].set_title('NASA-TLX Cognitive Workload')
    axes[2].set_ylim(0, 7)
    for i, v in enumerate(nasa_tlx):
        axes[2].text(i, v + 0.1, f"{v}/7", ha='center', fontweight='bold')
        
    plt.suptitle('Pilot Study Results (Pre-Test Phase) - 14 Participants', fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\pilot_results_en.png", dpi=150, bbox_inches='tight')
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\pilot_results_en.png", dpi=150, bbox_inches='tight')
    plt.close()

os.makedirs(r"d:\My_projects\XAI_KLTN\docs\assets", exist_ok=True)
save_plots_vi()
save_plots_en()
print("Pilot results plot (VI + EN) generated successfully!")
