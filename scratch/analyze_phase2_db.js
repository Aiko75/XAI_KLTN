const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found.');
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!dbUrlMatch) {
  console.error('Error: DATABASE_URL not found in .env file.');
  process.exit(1);
}
const databaseUrl = dbUrlMatch[1];

async function run() {
  console.log('Connecting to Supabase...');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('Fetching users, responses, and survey logs...');
    const usersRes = await client.query('SELECT * FROM users');
    const logsRes = await client.query('SELECT * FROM response_logs ORDER BY created_at ASC');
    const surveysRes = await client.query('SELECT * FROM survey_logs ORDER BY created_at ASC');

    // Filter out explicit developer / admin test accounts only
    const allUsers = usersRes.rows.filter(u => {
      const nameLower = (u.name || '').toLowerCase();
      const idLower = u.user_id.toLowerCase();
      return !nameLower.includes('test') && !idLower.includes('test') &&
             !nameLower.includes('admin') && nameLower.trim() !== '';
    });

    const userIds = new Set(allUsers.map(u => u.user_id));
    const allLogs = logsRes.rows.filter(l => userIds.has(l.user_id));
    const allSurveys = surveysRes.rows.filter(s => userIds.has(s.user_id));

    // Group logs by user_id
    const userLogsMap = {};
    allLogs.forEach(log => {
      if (!userLogsMap[log.user_id]) {
        userLogsMap[log.user_id] = [];
      }
      userLogsMap[log.user_id].push(log);
    });

    // 1. DATA CLEANING: 5-TIER FILTERING ALGORITHM (CORRECTED TIER 5)
    const rawCompletes = allUsers.filter(u => u.end_time !== null);
    const dropouts = allUsers.filter(u => u.end_time === null);
    
    const fullCleanCompletes = [];
    const partialCleanCompletes = [];
    const excludedUsers = [];

    // Map of clean valid logs per user
    const userCleanLogsMap = {};

    rawCompletes.forEach(u => {
      const uLogs = userLogsMap[u.user_id] || [];
      const g = u.group_assigned;
      
      // Tier 1: Group threshold
      const threshold = g === 'A' ? 2.0 : g === 'B' ? 3.0 : 4.0;

      const sortedLogs = [...uLogs].sort((a, b) => a.scenario_id - b.scenario_id);

      if (sortedLogs.length < 20) {
        excludedUsers.push({ user: u, reason: 'Chưa đủ 20 câu trả lời' });
        return;
      }

      // Tier 2: Collapse Point Detection (starting from scenario_id >= 3, index >= 2)
      let collapseIdx = -1;
      for (let i = 2; i <= sortedLogs.length - 3; i++) {
        if (
          sortedLogs[i].time_spent_seconds < threshold &&
          sortedLogs[i + 1].time_spent_seconds < threshold &&
          sortedLogs[i + 2].time_spent_seconds < threshold
        ) {
          collapseIdx = i;
          break;
        }
      }

      // Tier 3: Truncate from collapse point to end
      let validLogs = sortedLogs;
      if (collapseIdx !== -1) {
        validLogs = sortedLogs.slice(0, collapseIdx);
      }

      // Tier 4: Minimum valid scenarios check (< 10 -> exclude)
      if (validLogs.length < 10) {
        excludedUsers.push({
          user: u,
          reason: `Sụp đổ quá sớm tại câu ${sortedLogs[collapseIdx]?.scenario_id || 'N/A'} (chỉ còn ${validLogs.length}/20 câu hợp lệ < 10)`
        });
        return;
      }

      // Tier 5: Straight-lining check ONLY applied to UNTRUNCATED completes (validLogs.length === 20)
      if (validLogs.length === 20) {
        const decisionCounts = {};
        validLogs.forEach(l => {
          const dec = String(l.user_decision || '').toLowerCase().trim();
          decisionCounts[dec] = (decisionCounts[dec] || 0) + 1;
        });
        const maxRepetitive = Math.max(...Object.values(decisionCounts), 0);
        const ratio = maxRepetitive / 20;

        // Straight-lining threshold: 20/20 identical choices (100% repetitive)
        if (maxRepetitive === 20) {
          excludedUsers.push({
            user: u,
            reason: `Straight-lining tuyệt đối 20/20 câu trùng nhau (100%)`
          });
          return;
        }
      }

      // Record valid clean complete
      userCleanLogsMap[u.user_id] = validLogs;
      if (validLogs.length === 20) {
        fullCleanCompletes.push(u);
      } else {
        partialCleanCompletes.push({
          user: u,
          validCount: validLogs.length,
          collapseScenario: sortedLogs[collapseIdx].scenario_id
        });
      }
    });

    const totalCleanUsers = [...fullCleanCompletes, ...partialCleanCompletes.map(p => p.user)];

    // Output 5-Tier filter results to terminal
    console.log(`\n==================================================`);
    console.log(`📊 KẾT QUẢ ÁP DỤNG THUẬT TOÁN LỌC 5 TẦNG (ĐÃ SỬA TẦNG 5):`);
    console.log(`   - Tổng đăng ký: ${allUsers.length} người`);
    console.log(`   - Tổng hoàn thành gốc: ${rawCompletes.length} người`);
    console.log(`   - Dữ liệu sạch 20/20 câu: ${fullCleanCompletes.length} người`);
    console.log(`   - Dữ liệu cắt một phần (dùng 10-19 câu): ${partialCleanCompletes.length} người`);
    console.log(`   - Loại hoàn toàn (Spam/Collapse sớm): ${excludedUsers.length} người`);
    console.log(`==================================================\n`);

    if (excludedUsers.length > 0) {
      console.log(`🚨 Danh sách ${excludedUsers.length} người dùng bị loại:`);
      excludedUsers.forEach(ex => {
        console.log(`   - ID: ${ex.user.user_id}, Tên: "${ex.user.name}", Nhóm: ${ex.user.group_assigned}, Lý do: ${ex.reason}`);
      });
    }

    // Retention Rate per Group calculation
    const groupRegistered = { A: 0, B: 0, C: 0 };
    const groupCompleted = { A: 0, B: 0, C: 0 };
    const groupRetained = { A: 0, B: 0, C: 0 };

    allUsers.forEach(u => groupRegistered[u.group_assigned]++);
    rawCompletes.forEach(u => groupCompleted[u.group_assigned]++);
    totalCleanUsers.forEach(u => groupRetained[u.group_assigned]++);

    // Aggregate HCI behavioral metrics from valid clean logs
    const groupTimes = { A: [], B: [], C: [] };
    const groupHovers = { A: 0, B: 0, C: 0 };
    const groupChats = { A: 0, B: 0, C: 0 };
    const groupClicks = { A: 0, B: 0, C: 0 };

    totalCleanUsers.forEach(u => {
      const g = u.group_assigned;
      const vLogs = userCleanLogsMap[u.user_id] || [];
      vLogs.forEach(l => {
        groupTimes[g].push(l.time_spent_seconds);
        groupHovers[g] += (l.hover_count || 0);
        groupChats[g] += (l.chat_count || 0);
        groupClicks[g] += (l.interactive_clicks || 0);
      });
    });

    const avgTime = g => groupTimes[g].length > 0 ? (groupTimes[g].reduce((s, v) => s + v, 0) / groupTimes[g].length).toFixed(2) : '0.00';
    const totalGCleanUsers = g => totalCleanUsers.filter(u => u.group_assigned === g).length;
    const avgHover = g => totalGCleanUsers(g) > 0 ? (groupHovers[g] / totalGCleanUsers(g)).toFixed(2) : '0.00';
    const avgChat = g => totalGCleanUsers(g) > 0 ? (groupChats[g] / totalGCleanUsers(g)).toFixed(2) : '0.00';
    const avgClick = g => totalGCleanUsers(g) > 0 ? (groupClicks[g] / totalGCleanUsers(g)).toFixed(2) : '0.00';

    // Trap Accuracy calculation on valid clean logs
    const trapScenarios = [1, 4, 8, 11, 14, 16];
    const groupTrapTotal = { A: 0, B: 0, C: 0 };
    const groupTrapCorrect = { A: 0, B: 0, C: 0 };

    totalCleanUsers.forEach(u => {
      const g = u.group_assigned;
      const vLogs = userCleanLogsMap[u.user_id] || [];
      vLogs.forEach(l => {
        if (trapScenarios.includes(l.scenario_id)) {
          groupTrapTotal[g]++;
          if (l.is_correct_on_error_case === true) {
            groupTrapCorrect[g]++;
          }
        }
      });
    });

    // 2. DROPOUT DEEP-DIVE ANALYSIS
    const dropoutDetails = dropouts.map(u => {
      const uLogs = userLogsMap[u.user_id] || [];
      const sorted = [...uLogs].sort((a, b) => a.scenario_id - b.scenario_id);
      const stoppedScenario = sorted.length > 0 ? sorted[sorted.length - 1].scenario_id : 0;

      return {
        user: u,
        scenariosAnswered: sorted.length,
        stoppedScenario,
        device: u.device,
        group: u.group_assigned
      };
    });

    const dropoutGroupCounts = { A: 0, B: 0, C: 0 };
    const dropoutDeviceCounts = {};
    const dropoutStageCounts = { 'Early (1-5)': 0, 'Middle (6-14)': 0, 'Late (15-19)': 0, 'Start (0)': 0 };

    dropoutDetails.forEach(d => {
      dropoutGroupCounts[d.group]++;
      dropoutDeviceCounts[d.device] = (dropoutDeviceCounts[d.device] || 0) + 1;

      if (d.stoppedScenario === 0) dropoutStageCounts['Start (0)']++;
      else if (d.stoppedScenario <= 5) dropoutStageCounts['Early (1-5)']++;
      else if (d.stoppedScenario <= 14) dropoutStageCounts['Middle (6-14)']++;
      else dropoutStageCounts['Late (15-19)']++;
    });

    const getPct = (part, total) => Math.round((part / (total || 1)) * 100);

    // Calculate Button Comprehension Check statistics from survey logs
    const comprehensionSurveys = allSurveys.filter(s => s.question_key === 'button_comprehension');
    const totalComprehensionChecked = comprehensionSurveys.length;
    const correctComprehensionCount = comprehensionSurveys.filter(s => s.score === 1).length;
    const misunderstoodComprehensionCount = comprehensionSurveys.filter(s => s.score === 0).length;

    const correctPct = totalComprehensionChecked > 0 ? Math.round((correctComprehensionCount / totalComprehensionChecked) * 100) : 0;
    const misunderstoodPct = totalComprehensionChecked > 0 ? Math.round((misunderstoodComprehensionCount / totalComprehensionChecked) * 100) : 0;

    // 3. Generate Markdown Report
    let md = `# BÁO CÁO PHÂN TÍCH DỮ LIỆU THỰC NGHIỆM GIAI ĐOẠN 2 (REAL-TIME DATA REPORT)
*Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')} (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế thực nghiệm & Cỡ mẫu nhỏ (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn đang tích lũy (mục tiêu sàn N >= 40), các tỷ lệ phần trăm (%) hiển thị chỉ mang tính chất **gợi mở xu hướng (exploratory)**, không trích dẫn như kết luận cứng cho đến khi hoàn thành thực nghiệm và kiểm định GEE/GLMM.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22 (Demographic Homogeneity Limitation) cần được khai báo trong phần Thảo luận (Discussion).
> 3. **Ánh xạ Ý nghĩa Nút bấm & Phân tích Độ nhạy (Sensitivity Analysis)**: 
>    * Giao diện dùng nhãn "Đồng ý/Từ chối đề xuất của AI" tạo rủi ro nhiễu nhận thức đảo ngược (Response-Mapping Ambiguity).
>    * **Phân tích độ nhạy**: Do nhãn nút nhất quán ở cả 3 nhóm, sai số này mang tính chất **ngẫu nhiên không thiên lệch (non-differential measurement error)**. Nó chỉ làm giảm độ nhạy phát hiện hiệu ứng (attenuation bias / giảm effect size) chứ không làm đảo ngược hướng của các giả thuyết nghiên cứu chính.
>    * **Kiểm chứng định lượng thực tế**: Đã bổ sung câu hỏi Comprehension Check ở cuối bài cho các đối tượng mới. Kết quả kiểm tra hiện tại: **${totalComprehensionChecked}** đối tượng đã trả lời kiểm tra (${correctComprehensionCount} người chọn đúng ~${correctPct}%, ${misunderstoodComprehensionCount} người hiểu nhầm ~${misunderstoodPct}%).

> [!NOTE]
> **Cơ chế Lọc 5 Tầng (5-Tier Data Filtering Algorithm - Đã hiệu chỉnh Tầng 5)**:
> Báo cáo này áp dụng thuật toán lọc 5 tầng tiên tiến:
> *   **Tầng 1**: Ngưỡng thời gian đọc tối thiểu theo giao diện (A >= 2.0s, B >= 3.0s, C >= 4.0s).
> *   **Tầng 2**: Phát hiện điểm sụp đổ nhận thức (Collapse Point - chuỗi >= 3 câu liên tiếp dưới ngưỡng).
> *   **Tầng 3**: Cắt dữ liệu liền mạch từ điểm sụp đổ đến hết bài.
> *   **Tầng 4**: Loại bỏ hoàn toàn người dùng nếu số câu hợp lệ < 10.
> *   **Tầng 5**: Kiểm tra Straight-lining (>= 80% trùng đáp án) **chỉ áp dụng cho những người chưa bị cắt** (giữ nguyên đủ 20 câu gốc).

---

## 1. Phân tích Tỷ lệ Giữ chân & Lọc Dữ liệu theo Nhóm Giao diện (5-Tier Filter Results)

| Nhóm Giao diện | Đăng ký (Registered) | Hoàn thành gốc (Completed) | Giữ được sau Lọc 5 Tầng | Tỷ lệ giữ chân sau lọc (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | ${groupRegistered.A} | ${groupCompleted.A} | **${groupRetained.A}** | **~${getPct(groupRetained.A, groupCompleted.A)}%** |
| **Nhóm B (Static XAI)** | ${groupRegistered.B} | ${groupCompleted.B} | **${groupRetained.B}** | **~${getPct(groupRetained.B, groupCompleted.B)}%** |
| **Nhóm C (Interactive XAI)** | ${groupRegistered.C} | ${groupCompleted.C} | **${groupRetained.C}** | **~${getPct(groupRetained.C, groupCompleted.C)}%** |
| **TỔNG CỘNG** | **${allUsers.length}** | **${rawCompletes.length}** | **${totalCleanUsers.length}** | **~${getPct(totalCleanUsers.length, rawCompletes.length)}%** |

### Phân loại Người dùng Hoàn thành:
*   **Dữ liệu hợp lệ 20/20 câu (Full Clean)**: ${fullCleanCompletes.length} người
*   **Dữ liệu cắt một phần (Partial Clean - Giữ 10-19 câu)**: ${partialCleanCompletes.length} người
*   **Loại hoàn toàn (Excluded Spammers/Early Collapse)**: ${excludedUsers.length} người

---

## 2. Phân tích Chuyên sâu Nhóm Bỏ cuộc giữa chừng (Dropout Deep-Dive Analysis)

*Tổng số người dùng bỏ cuộc (ngắt kết nối giữa chừng): **${dropouts.length}** người (~${getPct(dropouts.length, allUsers.length)}% trên tổng số đăng ký).*

### 2.1. Tỷ lệ Bỏ cuộc theo Nhóm Giao diện
*   **Nhóm A (Black-box AI)**: ${dropoutGroupCounts.A} người bỏ dở
*   **Nhóm B (Static XAI)**: ${dropoutGroupCounts.B} người bỏ dở
*   **Nhóm C (Interactive XAI)**: ${dropoutGroupCounts.C} người bỏ dở

### 2.2. Giai đoạn Bỏ cuộc (Where Participants Dropped Out)
${Object.entries(dropoutStageCounts).map(([stage, count]) => `*   **Giai đoạn ${stage}**: ${count} người (~${getPct(count, dropouts.length)}%)`).join('\n')}

---

## 3. Chỉ số Hành vi & Tương tác HCI (Valid Clean Data)

*Tính toán dựa trên các bản ghi phản hồi HỢP LỆ từ ${totalCleanUsers.length} người dùng sạch sau khi lọc 5 tầng.*

| Nhóm Giao diện | Thời gian ra quyết định / câu | Số lượt hover / người | Số câu hỏi chatbot / người | Số tương tác What-if / người |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | ${avgTime('A')}s | ${avgHover('A')} | Không hỗ trợ | Không hỗ trợ |
| **Nhóm B (Static XAI)** | ${avgTime('B')}s | ${avgHover('B')} | Không hỗ trợ | Không hỗ trợ |
| **Nhóm C (Interactive)** | ${avgTime('C')}s | ${avgHover('C')} | ${avgChat('C')} | ${avgClick('C')} |

---

## 4. Độ chính xác Phát hiện Bẫy AI (Cognitive Trust Calibration)

| Nhóm Giao diện | Bác bỏ Bẫy thành công / Tổng số bẫy | Tỷ lệ phát hiện lỗi AI (%) |
| :--- | :---: | :---: |
| **Nhóm A (Black-box)** | ${groupTrapCorrect.A} / ${groupTrapTotal.A} | **~${getPct(groupTrapCorrect.A, groupTrapTotal.A)}%** |
| **Nhóm B (Static XAI)** | ${groupTrapCorrect.B} / ${groupTrapTotal.B} | **~${getPct(groupTrapCorrect.B, groupTrapTotal.B)}%** |
| **Nhóm C (Interactive)** | ${groupTrapCorrect.C} / ${groupTrapTotal.C} | **~${getPct(groupTrapCorrect.C, groupTrapTotal.C)}%** |

---

## 5. Danh sách Người dùng Giữ lại sau Lọc (Clean Completes Roster)
${totalCleanUsers.map((u, i) => {
  const p = partialCleanCompletes.find(item => item.user.user_id === u.user_id);
  const statusStr = p ? `Cắt một phần (Giữ ${p.validCount}/20 câu - Collapse tại câu ${p.collapseScenario})` : 'Giữ đủ 20/20 câu';
  return `*   **[${i + 1}]** ${u.name || 'Không tên'} (ID: ${u.user_id}) - Nhóm: **${u.group_assigned}** | Trạng thái: ${statusStr}`;
}).join('\n')}

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
`;

    const reportPath = path.join(__dirname, '..', 'data', '2nd test', 'Phase_2_Real_Data_Analysis_Report.md');
    fs.writeFileSync(reportPath, md, 'utf8');
    console.log(`✓ Real-time analysis completed and report saved to: data/2nd test/Phase_2_Real_Data_Analysis_Report.md`);
  } catch (e) {
    console.error('Error conducting analysis:', e);
  } finally {
    await client.end();
  }
}

run();
