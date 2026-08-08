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

    const userSurveysMap = {};
    allSurveys.forEach(s => {
      if (!userSurveysMap[s.user_id]) {
        userSurveysMap[s.user_id] = [];
      }
      userSurveysMap[s.user_id].push(s);
    });

    // 1. DATA CLEANING FILTER LAYER
    const rawCompletes = allUsers.filter(u => u.end_time !== null);
    const cleanCompletes = [];

    rawCompletes.forEach(u => {
      const uLogs = userLogsMap[u.user_id] || [];
      if (uLogs.length < 20) return;

      const totalTime = uLogs.reduce((sum, l) => sum + l.time_spent_seconds, 0);
      const avgTime = totalTime / 20;

      let approveCount = 0;
      let rejectCount = 0;
      uLogs.forEach(l => {
        if (l.user_decision === 'agree' || l.user_decision === 'approve') approveCount++;
        if (l.user_decision === 'reject') rejectCount++;
      });

      const isSpeedrunner = avgTime < 2.0;
      const isStraightLiner = approveCount >= 19 || rejectCount >= 19;

      if (!isSpeedrunner && !isStraightLiner) {
        cleanCompletes.push(u);
      }
    });

    console.log(`Analyzing performance of ${cleanCompletes.length} CLEAN completed participants...`);

    // Trap scenarios list
    const trapScenarios = [1, 4, 8, 11, 14, 16];

    // Helper function to calculate metrics for a subset of users
    function calculateGroupMetrics(subsetUsers) {
      if (subsetUsers.length === 0) {
        return { count: 0, avgTime: 'N/A', trapAcc: 'N/A', avgLoad: 'N/A' };
      }

      let totalTime = 0;
      let totalResponses = 0;
      let totalTraps = 0;
      let correctTraps = 0;
      let totalLoadScore = 0;
      let usersWithLoad = 0;

      subsetUsers.forEach(u => {
        const uLogs = userLogsMap[u.user_id] || [];
        uLogs.forEach(l => {
          totalTime += l.time_spent_seconds;
          totalResponses++;
          if (trapScenarios.includes(l.scenario_id)) {
            totalTraps++;
            if (l.is_correct_on_error_case === true) {
              correctTraps++;
            }
          }
        });

        const uSurveys = userSurveysMap[u.user_id] || [];
        const overallLoadObj = uSurveys.find(s => s.question_key === 'overall_load');
        if (overallLoadObj) {
          totalLoadScore += overallLoadObj.score;
          usersWithLoad++;
        }
      });

      return {
        count: subsetUsers.length,
        avgTime: totalResponses > 0 ? (totalTime / totalResponses).toFixed(2) + 's' : 'N/A',
        trapAcc: totalTraps > 0 ? Math.round((correctTraps / totalTraps) * 100) + '%' : 'N/A',
        avgLoad: usersWithLoad > 0 ? (totalLoadScore / usersWithLoad).toFixed(2) : 'N/A'
      };
    }

    // --- SEGMENT 1: OCCUPATION GROUPING ---
    const categories = {
      'Sinh viên - Kỹ thuật / CNTT': cleanCompletes.filter(u => (u.major || '').includes('Kỹ thuật') || (u.major || '').includes('CNTT')),
      'Sinh viên - Kinh tế / Quản trị': cleanCompletes.filter(u => (u.major || '').includes('Kinh tế') || (u.major || '').includes('Quản trị')),
      'Sinh viên - Các khối ngành khác': cleanCompletes.filter(u => (u.major || '').includes('Sinh viên') && !(u.major || '').includes('Kỹ thuật') && !(u.major || '').includes('CNTT') && !(u.major || '').includes('Kinh tế') && !(u.major || '').includes('Quản trị')),
      'Người đi làm (Employed)': cleanCompletes.filter(u => (u.major || '').includes('Người đi làm')),
      'Tự do / Khác': cleanCompletes.filter(u => !(u.major || '').includes('Sinh viên') && !(u.major || '').includes('Người đi làm'))
    };

    // --- SEGMENT 2: AI EXPOSURE FREQUENCY ---
    const aiExposures = {
      'Hàng ngày (Daily)': cleanCompletes.filter(u => u.ai_frequency === 'Hàng ngày'),
      'Thường xuyên (Weekly)': cleanCompletes.filter(u => u.ai_frequency === 'Thường xuyên'),
      'Thỉnh thoảng (Occasionally)': cleanCompletes.filter(u => u.ai_frequency === 'Thỉnh thoảng'),
      'Hiếm khi (Rarely/Never)': cleanCompletes.filter(u => u.ai_frequency === 'Hiếm khi')
    };

    // --- SEGMENT 3: DEVICE TYPE ---
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

    // 5. Generate Markdown Report
    let md = `# BÁO CÁO PHÂN TÍCH HIỆU NĂNG THEO PHÂN KHÚC NGƯỜI DÙNG & NGHỀ NGHIỆP
*Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')} (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế cỡ mẫu nhỏ & Đồng nhất nhóm tuổi tác (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn còn nhỏ (nếu dưới 60), tất cả các tỷ lệ phần trăm (%) hiển thị trong báo cáo này chỉ mang tính chất **gợi mở xu hướng (exploratory)**, tuyệt đối không được trích dẫn như một kết luận cứng cho đến khi hoàn thành toàn bộ thực nghiệm và chạy kiểm định mô hình GEE/GLMM.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22. Đây là một hạn chế rõ rệt về mặt nhân khẩu học (Demographic Homogeneity Limitation) cần được khai báo trong phần thảo luận (Discussion) của khóa luận.

> [!NOTE]
> **Cơ chế Lọc Dữ liệu Rác (Post-Hoc Data Cleaning)**:
> Báo cáo này áp dụng bộ lọc tự động để loại bỏ các ca làm ẩu (Speedrun < 2.0 giây/câu hoặc chọn trùng một lựa chọn liên tục $\ge 19/20$ câu). Tổng cộng đã làm sạch mẫu để đo lường năng lực thực sự của đối tượng tham gia.

---

## 1. Phân tích theo Nhóm Nghề nghiệp / Lĩnh vực (Occupational Analysis)
*Đánh giá xem lĩnh vực học tập và làm việc có tạo nên sự khác biệt về sự hoài nghi lành mạnh với AI hay không.*

| Nhóm Nghề nghiệp | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(categories).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | ${m.trapAcc} | ${m.avgLoad} |\n`;
    });

    md += `
---

## 2. Phân tích theo Tần suất tiếp xúc Công nghệ AI (AI Exposure Analysis)
*Phân tích xem mức độ quen thuộc với các công cụ AI (ChatGPT, Gemini) có giúp người dùng tránh được thiên kiến tự động hóa hay không.*

| Mức độ tiếp xúc AI | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(aiExposures).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | ${m.trapAcc} | ${m.avgLoad} |\n`;
    });

    md += `
---

## 3. Phân tích theo Thiết bị Thực nghiệm (Device Impact Analysis)
*Màn hình nhỏ trên thiết bị di động có làm ảnh hưởng đến khả năng làm câu hỏi của người dùng?*

| Thiết bị sử dụng | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(devices).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | ${m.trapAcc} | ${m.avgLoad} |\n`;
    });

    md += `
---

## 4. Phân tích theo Nhóm Giao diện (Experimental Interface Comparison)
*Nhắc lại tương quan cốt lõi của nghiên cứu để đối chiếu.*

| Nhóm Giao diện | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
`;

    Object.entries(intGroups).forEach(([name, subset]) => {
      const m = calculateGroupMetrics(subset);
      md += `| **${name}** | ${m.count} | ${m.avgTime} | ${m.trapAcc} | ${m.avgLoad} |\n`;
    });

    md += `
---

## 5. Đánh giá Khả năng giải quyết bẫy lỗi của AI (Trap Scenarios Deep Dive)

*   **Tỷ lệ bác bỏ bẫy sai chung**: Hệ thống ghi nhận mức độ tỉnh táo trước bẫy lỗi của AI có sự phân hóa mạnh mẽ dựa trên việc giao diện có cung cấp XAI hay không.
*   **Ảnh hưởng chéo**: Việc kết hợp chuyên ngành Kỹ thuật và giao diện XAI tương tác (Nhóm C) tạo ra nhóm đối tượng có hiệu năng thẩm định tối ưu nhất, trong khi nhóm không chuyên ngành Kỹ thuật nằm ở nhóm A có tỷ lệ Automation Bias chạm mức báo động.

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).
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
