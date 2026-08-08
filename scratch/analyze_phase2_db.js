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

    // Filter out developer / admin test accounts
    const allUsers = usersRes.rows.filter(u => {
      const nameLower = (u.name || '').toLowerCase();
      const idLower = u.user_id.toLowerCase();
      return !nameLower.includes('test') && !idLower.includes('test') &&
             !nameLower.includes('nhân') && !nameLower.includes('quân') &&
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

    // 1. DATA CLEANING FILTER LAYER (Lọc Dữ liệu Rác / Làm ẩu)
    const rawCompletes = allUsers.filter(u => u.end_time !== null);
    const dropouts = allUsers.filter(u => u.end_time === null);
    
    const cleanCompletes = [];
    const flaggedSpammers = [];

    rawCompletes.forEach(u => {
      const uLogs = userLogsMap[u.user_id] || [];
      if (uLogs.length < 20) {
        return; // Incomplete response logs
      }

      // Calculate average decision time
      const totalTime = uLogs.reduce((sum, l) => sum + l.time_spent_seconds, 0);
      const avgTime = totalTime / 20;

      // Count decisions to check for straight-lining (repetitive choices)
      let approveCount = 0;
      let rejectCount = 0;
      uLogs.forEach(l => {
        if (l.user_decision === 'agree' || l.user_decision === 'approve') approveCount++;
        if (l.user_decision === 'reject') rejectCount++;
      });

      const isSpeedrunner = avgTime < 2.0; // speedrunning under 2 seconds per question
      const isStraightLiner = approveCount >= 19 || rejectCount >= 19; // chose almost the same answer for all

      if (isSpeedrunner || isStraightLiner) {
        let reason = "";
        if (isSpeedrunner && isStraightLiner) reason = "Làm ẩu: Tốc độ cực nhanh & chọn duy nhất 1 đáp án";
        else if (isSpeedrunner) reason = `Làm ẩu: Speedrun (tb ${avgTime.toFixed(2)}s/câu < 2s)`;
        else reason = `Làm ẩu: Straight-lining (chọn ${approveCount} duyệt / ${rejectCount} từ chối)`;

        flaggedSpammers.push({
          user: u,
          reason,
          avgTime
        });
      } else {
        cleanCompletes.push(u);
      }
    });

    // Output flagged spammers to terminal
    if (flaggedSpammers.length > 0) {
      console.log(`\n🚨 Phát hiện ${flaggedSpammers.length} ca làm ẩu (Flagged Low-Quality Submissions) bị loại khỏi phân tích chính thức:`);
      flaggedSpammers.forEach(f => {
        console.log(`   - ID: ${f.user.user_id}, Tên: "${f.user.name}", Nhóm: ${f.user.group_assigned}, Lý do: ${f.reason}`);
      });
    } else {
      console.log('\n✓ Không phát hiện ca làm ẩu nào trong dữ liệu hoàn thành.');
    }

    // Update variables based on clean completed data
    const cleanCompletesSet = new Set(cleanCompletes.map(u => u.user_id));
    const cleanLogs = allLogs.filter(l => cleanCompletesSet.has(l.user_id));
    const cleanSurveys = allSurveys.filter(s => cleanCompletesSet.has(s.user_id));

    const totalValidCount = cleanCompletes.length + dropouts.length;

    // 2. Aggregate Demographics (based on clean completed + active dropouts)
    const deviceCounts = {};
    const ageCounts = {};
    const freqCounts = {};
    const groupCounts = { A: 0, B: 0, C: 0 };
    const occupationCounts = {};

    const activeUsersList = [...cleanCompletes, ...dropouts];

    activeUsersList.forEach(u => {
      deviceCounts[u.device] = (deviceCounts[u.device] || 0) + 1;
      ageCounts[u.age_group] = (ageCounts[u.age_group] || 0) + 1;
      freqCounts[u.ai_frequency] = (freqCounts[u.ai_frequency] || 0) + 1;
      groupCounts[u.group_assigned]++;
      
      const occ = u.major || 'Chưa chọn';
      occupationCounts[occ] = (occupationCounts[occ] || 0) + 1;
    });

    // 3. HCI Behavioral Metrics per Group (for clean completes only)
    const groupTimes = { A: [], B: [], C: [] };
    const groupHovers = { A: 0, B: 0, C: 0 };
    const groupChats = { A: 0, B: 0, C: 0 };
    const groupClicks = { A: 0, B: 0, C: 0 };
    const groupActiveSecs = { A: [], B: [], C: [] };

    cleanLogs.forEach(l => {
      const u = cleanCompletes.find(user => user.user_id === l.user_id);
      if (!u) return;
      const g = u.group_assigned;
      groupTimes[g].push(l.time_spent_seconds);
      groupHovers[g] += (l.hover_count || 0);
      groupChats[g] += (l.chat_count || 0);
      groupClicks[g] += (l.interactive_clicks || 0);

      try {
        const telemetry = JSON.parse(l.telemetry_data || '{}');
        if (telemetry.raw_time_spent_seconds) {
          const raw = parseFloat(telemetry.raw_time_spent_seconds);
          const hidden = parseFloat(telemetry.hidden_time_seconds || 0);
          groupActiveSecs[g].push(Math.max(0.1, raw - hidden));
        } else {
          groupActiveSecs[g].push(l.time_spent_seconds);
        }
      } catch (e) {
        groupActiveSecs[g].push(l.time_spent_seconds);
      }
    });

    const avgTime = g => groupTimes[g].length > 0 ? (groupTimes[g].reduce((sum, v) => sum + v, 0) / groupTimes[g].length).toFixed(2) : '0.00';
    const avgActiveTime = g => groupActiveSecs[g].length > 0 ? (groupActiveSecs[g].reduce((sum, v) => sum + v, 0) / groupActiveSecs[g].length).toFixed(2) : '0.00';
    const totalGCompletes = g => cleanCompletes.filter(u => u.group_assigned === g).length;
    const avgHover = g => totalGCompletes(g) > 0 ? (groupHovers[g] / totalGCompletes(g)).toFixed(2) : '0.00';
    const avgChat = g => totalGCompletes(g) > 0 ? (groupChats[g] / totalGCompletes(g)).toFixed(2) : '0.00';
    const avgClick = g => totalGCompletes(g) > 0 ? (groupClicks[g] / totalGCompletes(g)).toFixed(2) : '0.00';

    // 4. Trap Scenario Calibration (for clean completes only)
    const trapScenarios = [1, 4, 8, 11, 14, 16];
    const groupTrapTotal = { A: 0, B: 0, C: 0 };
    const groupTrapCorrect = { A: 0, B: 0, C: 0 };

    cleanLogs.forEach(l => {
      const u = cleanCompletes.find(user => user.user_id === l.user_id);
      if (!u) return;
      const g = u.group_assigned;
      if (trapScenarios.includes(l.scenario_id)) {
        groupTrapTotal[g]++;
        if (l.is_correct_on_error_case === true) {
          groupTrapCorrect[g]++;
        }
      }
    });

    // 5. NASA-TLX Cognitive Load (for clean completes only)
    const tlxScores = { A: {}, B: {}, C: {} };
    cleanSurveys.forEach(s => {
      const u = cleanCompletes.find(user => user.user_id === s.user_id);
      if (!u) return;
      const g = u.group_assigned;
      if (!tlxScores[g][s.question_key]) {
        tlxScores[g][s.question_key] = [];
      }
      tlxScores[g][s.question_key].push(s.score);
    });

    const tlxAvg = (g, key) => {
      const scores = tlxScores[g][key];
      if (!scores || scores.length === 0) return 'N/A';
      return (scores.reduce((sum, v) => sum + v, 0) / scores.length).toFixed(2);
    };

    // Calculate rounded percentages for cleaner presentation on small samples
    const getPct = (part, total) => Math.round((part / (total || 1)) * 100);

    // 6. Generate Markdown report text
    let md = `# BÁO CÁO PHÂN TÍCH DỮ LIỆU THỰC NGHIỆM GIAI ĐOẠN 2 (REAL-TIME DATA REPORT)
*Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')} (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế cỡ mẫu nhỏ & Đồng nhất nhóm tuổi tác (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn còn nhỏ (nếu dưới 60), tất cả các tỷ lệ phần trăm (%) hiển thị trong báo cáo này chỉ mang tính chất **gợi mở xu hướng (exploratory)**, tuyệt đối không được trích dẫn như một kết luận cứng cho đến khi hoàn thành toàn bộ thực nghiệm và chạy kiểm định mô hình GEE/GLMM.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22. Đây là một hạn chế rõ rệt về mặt nhân khẩu học (Demographic Homogeneity Limitation) cần được khai báo trong phần thảo luận (Discussion) của khóa luận.

> [!NOTE]
> **Cơ chế Lọc Dữ liệu Rác (Post-Hoc Data Cleaning)**:
> Báo cáo này áp dụng bộ lọc tự động để loại bỏ các ca làm ẩu (Speedrun < 2.0 giây/câu hoặc chọn trùng một lựa chọn liên tục $\ge 19/20$ câu). Tổng cộng đã phát hiện và loại bỏ **${flaggedSpammers.length}** ca làm ẩu ra khỏi các tính năng thống kê hành vi và nhận diện bẫy lỗi để bảo đảm chất lượng dữ liệu sạch.

---

## 1. Phân tích Phân khúc Đối tượng tham gia (Demographics & Users Profile)

*   **Tổng số người dùng thực tế tham gia**: ${totalValidCount} người
*   **Hoàn thành hợp lệ (Clean Completes)**: ${cleanCompletes.length} người (~${getPct(cleanCompletes.length, totalValidCount)}%)
*   **Làm ẩu bị loại bỏ (Flagged Spam)**: ${flaggedSpammers.length} người
*   **Số lượng bỏ dở giữa chừng (Dropouts)**: ${dropouts.length} người (~${getPct(dropouts.length, totalValidCount)}%)

### Phân bố Nhóm Giao diện (Interface Group Assignment - Bao gồm cả Dropouts)
*   **Nhóm A (Black-box AI)**: ${groupCounts.A} người (Hoàn thành sạch: ${totalGCompletes('A')} - Bỏ dở: ${dropouts.filter(u => u.group_assigned === 'A').length})
*   **Nhóm B (Static XAI)**: ${groupCounts.B} người (Hoàn thành sạch: ${totalGCompletes('B')} - Bỏ dở: ${dropouts.filter(u => u.group_assigned === 'B').length})
*   **Nhóm C (Interactive XAI)**: ${groupCounts.C} người (Hoàn thành sạch: ${totalGCompletes('C')} - Bỏ dở: ${dropouts.filter(u => u.group_assigned === 'C').length})

### Phân bố Thiết bị sử dụng (Device Distribution - Toàn bộ mẫu)
${Object.entries(deviceCounts).map(([dev, count]) => `*   **${dev}**: ${count} người (~${getPct(count, totalValidCount)}%)`).join('\n')}

### Phân bố Nhóm Tuổi (Age Group Distribution - Toàn bộ mẫu)
${Object.entries(ageCounts).map(([age, count]) => `*   **${age}**: ${count} người (~${getPct(count, totalValidCount)}%)`).join('\n')}

### Phân bố Tần suất sử dụng công cụ AI (AI Exposure Frequency - Toàn bộ mẫu)
${Object.entries(freqCounts).map(([freq, count]) => `*   **${freq}**: ${count} người (~${getPct(count, totalValidCount)}%)`).join('\n')}

### Phân bố Chi tiết Nghề nghiệp (Detailed Occupation Distribution)
${Object.entries(occupationCounts).sort((a,b) => b[1] - a[1]).map(([occ, count]) => `*   **${occ}**: ${count} người`).join('\n')}

---

## 2. Phân tích Chỉ số Hành vi & HCI (HCI Engagement Metrics)

*Số liệu được tính trung bình trên mỗi đối tượng HOÀN THÀNH HỢP LỆ sau khi lọc.*

| Nhóm Giao diện | Thời gian ra quyết định / câu | Thời gian tương tác thực tế (Active Time) | Số lượt hover / người | Số câu hỏi chatbot / người | Số tương tác What-if / người |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | ${avgTime('A')} | ${avgActiveTime('A')} | ${avgHover('A')} | Không hỗ trợ | Không hỗ trợ |
| **Nhóm B (Static XAI)** | ${avgTime('B')} | ${avgActiveTime('B')} | ${avgHover('B')} | Không hỗ trợ | Không hỗ trợ |
| **Nhóm C (Interactive)** | ${avgTime('C')} | ${avgActiveTime('C')} | ${avgHover('C')} | ${avgChat('C')} | ${avgClick('C')} |

---

## 3. Độ chính xác Phát hiện Bẫy AI (Cognitive Trust Calibration)

*Tỷ lệ phần trăm thể hiện số lần người dùng phát hiện lỗi AI và bác bỏ thành công trên các câu bẫy.*

| Nhóm Giao diện | Quyết định bác bỏ AI / Tổng số lượt gặp bẫy | Tỷ lệ phát hiện lỗi AI (%) |
| :--- | :---: | :---: |
| **Nhóm A (Black-box)** | ${groupTrapCorrect.A} / ${groupTrapTotal.A} | **~${getPct(groupTrapCorrect.A, groupTrapTotal.A)}%** |
| **Nhóm B (Static XAI)** | ${groupTrapCorrect.B} / ${groupTrapTotal.B} | **~${getPct(groupTrapCorrect.B, groupTrapTotal.B)}%** |
| **Nhóm C (Interactive)** | ${groupTrapCorrect.C} / ${groupTrapTotal.C} | **~${getPct(groupTrapCorrect.C, groupTrapTotal.C)}%** |

*Chú thích: Tỷ lệ phần trăm trên đây chỉ biểu thị xu hướng phân bố thô trên mẫu thử hiện tại. Mối liên hệ có ý nghĩa thống kê thực tế sẽ được xác định thông qua kiểm định phương trình ước lượng tổng quát (GEE) trên bộ dữ liệu hoàn chỉnh.*

---

## 4. Tải lượng Nhận thức (NASA-TLX Cognitive Load)

*Khảo sát NASA-TLX cuối bài kiểm tra. Thang đo từ 1 (Rất nhẹ) đến 20 (Quá tải).*

| Chỉ số tải lượng nhận thức | Nhóm A (Black-box) | Nhóm B (Static XAI) | Nhóm C (Interactive XAI) |
| :--- | :---: | :---: | :---: |
| **Mental Demand (Yêu cầu trí óc)** | ${tlxAvg('A', 'mental_demand')} | ${tlxAvg('B', 'mental_demand')} | ${tlxAvg('C', 'mental_demand')} |
| **Temporal Demand (Yêu cầu thời gian)** | ${tlxAvg('A', 'temporal_demand')} | ${tlxAvg('B', 'temporal_demand')} | ${tlxAvg('C', 'temporal_demand')} |
| **Performance (Hiệu suất tự đánh giá)** | ${tlxAvg('A', 'performance')} | ${tlxAvg('B', 'performance')} | ${tlxAvg('C', 'performance')} |
| **Effort (Mức độ nỗ lực)** | ${tlxAvg('A', 'effort')} | ${tlxAvg('B', 'effort')} | ${tlxAvg('C', 'effort')} |
| **Frustration (Sự ức chế)** | ${tlxAvg('A', 'frustration')} | ${tlxAvg('B', 'frustration')} | ${tlxAvg('C', 'frustration')} |
| **Overall Load (Tải lượng tổng thể)** | ${tlxAvg('A', 'overall_load')} | ${tlxAvg('B', 'overall_load')} | ${tlxAvg('C', 'overall_load')} |

---

## 5. Danh sách người dùng hợp lệ (Completes Roster)
${cleanCompletes.map((u, i) => `*   **[${i + 1}]** ${u.name || 'Không tên'} (ID: ${u.user_id}) - Nhóm: **${u.group_assigned}** | Nghề: ${u.major || 'Chưa chọn'} | Thiết bị: ${u.device}`).join('\n')}

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).
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
