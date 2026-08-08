const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Read .env file to get DATABASE_URL
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
  console.log('Connecting to Supabase database...');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    // 2. Fetch all users and response logs
    console.log('Fetching users and response logs...');
    const usersRes = await client.query('SELECT * FROM users');
    const logsRes = await client.query('SELECT * FROM response_logs ORDER BY created_at ASC');

    const allUsers = usersRes.rows;
    const allLogs = logsRes.rows;

    const completes = [];
    const dropouts = [];
    const zeroResponses = [];

    // Group logs by user_id
    const userLogsMap = {};
    allLogs.forEach(log => {
      if (!userLogsMap[log.user_id]) {
        userLogsMap[log.user_id] = [];
      }
      userLogsMap[log.user_id].push(log);
    });

    console.log(`Analyzing ${allUsers.length} user records...`);

    for (const user of allUsers) {
      // Exclude local test accounts from analysis to keep stats clean
      const isTestUser = 
        user.name?.toLowerCase().includes('test') || 
        user.user_id.toLowerCase().includes('test') || 
        user.name?.toLowerCase().includes('nhân') ||
        user.name?.toLowerCase().includes('quân');

      if (isTestUser) {
        // Skip test accounts from stats
        continue;
      }

      const userLogs = userLogsMap[user.user_id] || [];
      const count = userLogs.length;

      if (count === 0) {
        zeroResponses.push(user);
      } else if (count === 20) {
        completes.push({ user, logs: userLogs });
      } else {
        // Find last answered scenario and timestamp
        const lastLog = userLogs[userLogs.length - 1];
        dropouts.push({
          user,
          completedCount: count,
          lastScenarioId: lastLog.scenario_id,
          lastActive: lastLog.created_at,
          logs: userLogs
        });
      }
    }

    // 3. Clean up zero-response users (Delete from Supabase)
    if (zeroResponses.length > 0) {
      console.log(`\n🧹 Found ${zeroResponses.length} users with 0 responses. Cleaning them up...`);
      for (const user of zeroResponses) {
        await client.query('DELETE FROM users WHERE user_id = $1', [user.user_id]);
        console.log(`   Deleted user: ID=${user.user_id}, Name="${user.name}", Group=${user.group_assigned}`);
      }
      console.log('✓ Clean-up completed.');
    } else {
      console.log('\n🧹 No 0-response users found to delete.');
    }

    // 4. Summarize results
    const groupCompletes = { A: 0, B: 0, C: 0 };
    const groupDropouts = { A: 0, B: 0, C: 0 };

    completes.forEach(c => groupCompletes[c.user.group_assigned]++);
    dropouts.forEach(d => groupDropouts[d.user.group_assigned]++);

    console.log('\n==================================================');
    console.log('       BÁO CÁO THỐNG KÊ ĐỢT THỰC NGHIỆM CHÍNH THỨC');
    console.log('==================================================');
    console.log(`Tổng số người dùng thực tế hợp lệ: ${completes.length + dropouts.length}`);
    console.log(`* Hoàn thành (Completes): ${completes.length}`);
    console.log(`* Bỏ dở (Dropouts): ${dropouts.length}`);
    console.log(`* Tỷ lệ bỏ dở chung (Overall Dropout Rate): ${((dropouts.length / (completes.length + dropouts.length || 1)) * 100).toFixed(1)}%`);

    console.log('\n--------------------------------------------------');
    console.log('1. THỐNG KÊ THEO NHÓM GIAO DIỆN (Group Performance)');
    console.log('--------------------------------------------------');
    const groups = ['A', 'B', 'C'];
    for (const g of groups) {
      const comp = groupCompletes[g];
      const drop = groupDropouts[g];
      const total = comp + drop;
      const rate = total > 0 ? ((drop / total) * 100).toFixed(1) : '0.0';
      console.log(`Nhóm Giao diện ${g}:`);
      console.log(`  - Hoàn thành: ${comp} người`);
      console.log(`  - Bỏ dở: ${drop} người`);
      console.log(`  - Tỷ lệ bỏ dở nhóm: ${rate}%`);
    }

    console.log('\n--------------------------------------------------');
    console.log('2. DANH SÁCH CHI TIẾT CÁC CA BỎ DỞ (Dropout Details)');
    console.log('--------------------------------------------------');
    if (dropouts.length === 0) {
      console.log('Không có ca bỏ dở nào.');
    } else {
      dropouts.forEach((d, idx) => {
        const timeSpentStr = d.logs.reduce((sum, l) => sum + l.time_spent_seconds, 0).toFixed(1);
        console.log(`[${idx + 1}] ID: ${d.user.user_id}`);
        console.log(`    Tên: ${d.user.name || 'Không rõ'}`);
        console.log(`    Nhóm Giao diện: ${d.user.group_assigned}`);
        console.log(`    Nghề nghiệp: ${d.user.major || 'Chưa chọn'}`);
        console.log(`    Thiết bị: ${d.user.device || 'Desktop'}`);
        console.log(`    Số câu đã hoàn thành: ${d.completedCount} / 20`);
        console.log(`    Bỏ dở tại câu (Scenario ID): ${d.lastScenarioId + 1}`);
        console.log(`    Tổng thời gian đã làm: ${timeSpentStr} giây`);
        console.log(`    Hoạt động cuối cùng: ${new Date(d.lastActive).toLocaleString('vi-VN')}`);
        console.log('    --------------------------------------------');
      });
    }

    console.log('\n--------------------------------------------------');
    console.log('3. PHÂN TÍCH NGUYÊN NHÂN BỎ DỞ (Dropout Insights)');
    console.log('--------------------------------------------------');
    // Calculate scenario where people drop out most
    const scenarioDrops = {};
    dropouts.forEach(d => {
      const dropScenario = d.lastScenarioId + 1;
      scenarioDrops[dropScenario] = (scenarioDrops[dropScenario] || 0) + 1;
    });

    console.log('Tần suất bỏ dở theo số câu:');
    Object.entries(scenarioDrops).sort((a,b) => b[1] - a[1]).forEach(([scenario, count]) => {
      console.log(`  - Dừng lại tại câu ${scenario}: ${count} người`);
    });

    console.log('\n[Kỳ vọng Nghiên cứu]:');
    console.log('  * Nếu Nhóm C (Interactive XAI) có tỷ lệ bỏ dở cao hơn, có thể kết luận rằng các công cụ');
    console.log('    giải thích tương tác mạnh mẽ gây ra hiện tượng QUÁ TẢI NHẬN THỨC (Cognitive Overload).');
    console.log('  * Nếu Nhóm A (Black-box) có tỷ lệ bỏ dở cao, có thể là do sự nhàm chán hoặc thiếu minh bạch');
    console.log('    khiến người dùng không có động lực hoàn thành thực nghiệm.');

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

run();
