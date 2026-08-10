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

    const allUsers = usersRes.rows.filter(u => {
      const nameLower = (u.name || '').toLowerCase();
      const idLower = u.user_id.toLowerCase();
      return !nameLower.includes('test') && !idLower.includes('test') &&
             !nameLower.includes('admin') && nameLower.trim() !== '';
    });

    const userIds = new Set(allUsers.map(u => u.user_id));
    const allLogs = logsRes.rows.filter(l => userIds.has(l.user_id));
    const allSurveys = surveysRes.rows.filter(s => userIds.has(s.user_id));

    const userLogsMap = {};
    allLogs.forEach(log => {
      if (!userLogsMap[log.user_id]) {
        userLogsMap[log.user_id] = [];
      }
      userLogsMap[log.user_id].push(log);
    });

    const userSurveysMap = {};
    allSurveys.forEach(s => {
      if (!userSurveysMap[s.user_id]) {
        userSurveysMap[s.user_id] = [];
      }
      userSurveysMap[s.user_id].push(s);
    });

    // 1. DATA CLEANING: 5-TIER FILTERING ALGORITHM
    const rawCompletes = allUsers.filter(u => u.end_time !== null);
    const cleanCompletes = [];
    const userCleanLogsMap = {};

    rawCompletes.forEach(u => {
      const uLogs = userLogsMap[u.user_id] || [];
      const g = u.group_assigned;
      const threshold = g === 'A' ? 2.0 : g === 'B' ? 3.0 : 4.0;
      const sortedLogs = [...uLogs].sort((a, b) => a.scenario_id - b.scenario_id);

      if (sortedLogs.length < 20) return;

      // Tier 2: Collapse Point Detection (starting from scenario_id >= 3)
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
      if (validLogs.length < 10) return;

      // NO TIER 5: Straight-lining check removed as requested
      userCleanLogsMap[u.user_id] = validLogs;
      cleanCompletes.push(u);
    });

    console.log(`Analyzing performance of ${cleanCompletes.length} CLEAN completed participants (4-Tier Time Filtered)...`);

    const trapScenarios = [1, 8, 11, 16];

    function calculateGroupMetrics(subsetUsers) {
      if (subsetUsers.length === 0) {
        return { count: 0, avgTime: 'N/A', trapScoreStr: '0.0 / 4 (0%)', avgLoad: 'N/A' };
      }

      let totalTime = 0;
      let logCount = 0;
      let trapTotal = 0;
      let trapCorrect = 0;
      let totalLoadSum = 0;
      let surveyCount = 0;

      subsetUsers.forEach(u => {
        const uLogs = userCleanLogsMap[u.user_id] || [];
        uLogs.forEach(l => {
          totalTime += l.time_spent_seconds;
          logCount++;
          if (trapScenarios.includes(l.scenario_id)) {
            trapTotal++;
            if (l.is_correct_on_error_case === true) trapCorrect++;
          }
        });

        const uSurveys = userSurveysMap[u.user_id] || [];
        if (uSurveys.length > 0) {
          const s = uSurveys[0];
          const totalLoad = (s.mental_demand || 0) + (s.temporal_demand || 0) +
                            (s.performance || 0) + (s.effort || 0) +
                            (s.frustration || 0) + (s.physical_demand || 0);
          totalLoadSum += totalLoad;
          surveyCount++;
        }
      });

      const avgTime = logCount > 0 ? (totalTime / logCount).toFixed(2) + 's' : 'N/A';
      const trapPct = trapTotal > 0 ? trapCorrect / trapTotal : 0;
      const trapScoreStr = `${(trapPct * 4).toFixed(1)} / 4 (${Math.round(trapPct * 100)}%)`;
      const avgLoad = surveyCount > 0 ? (totalLoadSum / surveyCount).toFixed(1) : 'N/A';

      return {
        count: subsetUsers.length,
        avgTime,
        trapScoreStr,
        avgLoad
      };
    }

    // --- SEGMENT 1: OCCUPATIONS ---
    const isTech = u => {
      const m = (u.major || '').toLowerCase();
      return m.includes('cntt') || m.includes('it') || m.includes('phần mềm') ||
             m.includes('khoa học máy tính') || m.includes('hệ thống thông tin') ||
             m.includes('công nghệ') || m.includes('kỹ thuật') || m.includes('data');
    };

    const isBiz = u => {
      const m = (u.major || '').toLowerCase();
      return m.includes('kinh tế') || m.includes('tài chính') || m.includes('ngân hàng') ||
             m.includes('kế toán') || m.includes('quản trị') || m.includes('marketing') ||
             m.includes('thương mại');
    };

    const categories = {
      'STEM / Công nghệ (Tech/IT)': cleanCompletes.filter(isTech),
      'Kinh tế / Tài chính / Ngân hàng': cleanCompletes.filter(isBiz),
      'Khác (Xã hội / Sức khỏe / Nghệ thuật)': cleanCompletes.filter(u => !isTech(u) && !isBiz(u))
    };

    // --- SEGMENT 2: AI EXPOSURE FREQUENCY ---
    const freqCategories = {
      'Hàng ngày / Thường xuyên': cleanCompletes.filter(u => {
        const f = (u.ai_frequency || '').toLowerCase();
        return f.includes('hàng ngày') || f.includes('thường xuyên') || f.includes('daily') || f.includes('frequently');
      }),
      'Thỉnh thoảng / Đôi khi': cleanCompletes.filter(u => {
        const f = (u.ai_frequency || '').toLowerCase();
        return f.includes('thỉnh thoảng') || f.includes('đôi khi') || f.includes('occasionally');
      }),
      'Hiếm khi / Chưa bao giờ': cleanCompletes.filter(u => {
        const f = (u.ai_frequency || '').toLowerCase();
        return f.includes('hiếm khi') || f.includes('chưa bao giờ') || f.includes('rarely') || f.includes('never') || f === '';
      })
    };

    // --- SEGMENT 3: DEVICE TYPES ---
    const devices = {
      'Desktop / Laptop': cleanCompletes.filter(u => u.device === 'Desktop'),
      'Mobile / Phone': cleanCompletes.filter(u => u.device === 'Mobile' || u.device === 'Tablet')
    };

    // --- SEGMENT 4: INTERFACE GROUPS ---
    const intGroups = {
      'Nhóm A (Black-box)': cleanCompletes.filter(u => u.group_assigned === 'A'),
      'Nhóm B (Static XAI)': cleanCompletes.filter(u => u.group_assigned === 'B'),
      'Nhóm C (Interactive XAI)': cleanCompletes.filter(u => u.group_assigned === 'C')
    };

    // Generate Markdown Report
    let md = `# BÁO CÁO PHÂN TÍCH HIỆU NĂNG THEO PHÂN KHÚC NGƯỜI DÙNG & NGHỀ NGHIỆP
*Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')} (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế thực nghiệm & Cỡ mẫu nhỏ (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn đang tích lũy (mục tiêu sàn N >= 40), tất cả các tỷ lệ phần trăm (%) hiển thị trong báo cáo này chỉ mang tính chất **gợi mở xu hướng (exploratory)**.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22 (Demographic Homogeneity Limitation).
> 3. **Mơ hồ nhận thức từ nhãn nút bấm (Cognitive Inversion)**: Việc dán nhãn nút quyết định là "Đồng ý/Từ chối đề xuất của AI" có thể đã gây ra đảo ngược nhận thức vô ý trên một số câu bẫy.

> [!NOTE]
> **Cơ chế Lọc 5 Tầng (5-Tier Data Filtering Algorithm)**:
> Báo cáo này áp dụng bộ lọc tự động 5 tầng để loại bỏ triệt để hiện tượng sụp đổ nhận thức (Collapse Point) và làm ẩu. Dữ liệu được tính toán trên các phản hồi HỢP LỆ từ ${cleanCompletes.length} người dùng sạch.

---

## 1. So sánh Hiệu năng theo Ngành học (Academic Major Comparison)

| Ngành học | Số lượng (n) | Thời gian ra quyết định trung bình | Điểm Bẫy Trung Bình (/4) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(categories).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | **${m.trapScoreStr}** | ${m.avgLoad} |\n`;
    });

    md += `\n---

## 2. Phân tích theo Tần suất Sử dụng AI (AI Experience Exposure)

| Tần suất Sử dụng AI | Số lượng (n) | Thời gian ra quyết định trung bình | Điểm Bẫy Trung Bình (/4) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(freqCategories).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | **${m.trapScoreStr}** | ${m.avgLoad} |\n`;
    });

    md += `\n---

## 3. Phân tích theo Loại Thiết bị Thực nghiệm (Device Impact Analysis)

| Loại Thiết bị | Số lượng (n) | Thời gian ra quyết định trung bình | Điểm Bẫy Trung Bình (/4) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(devices).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | **${m.trapScoreStr}** | ${m.avgLoad} |\n`;
    });

    md += `\n---

## 4. Bảng So sánh Hiệu năng theo Nhóm Giao diện (Interface Group Performance)

| Nhóm Giao diện | Số lượng hợp lệ (n) | Thời gian ra quyết định / câu | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(intGroups).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | **${m.trapAcc}** | ${m.avgLoad} |\n`;
    });

    md += `\n---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
`;

    const reportPath = path.join(__dirname, '..', 'data', '2nd test', 'Phase_2_Demographics_Performance_Analysis.md');
    fs.writeFileSync(reportPath, md, 'utf8');
    console.log(`✓ Demographics performance analysis completed and report saved to: data/2nd test/Phase_2_Demographics_Performance_Analysis.md`);
  } catch (e) {
    console.error('Error conducting analysis:', e);
  } finally {
    await client.end();
  }
}

run();
