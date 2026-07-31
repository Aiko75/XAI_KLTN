import { NextRequest, NextResponse } from "next/server";
import scenariosData from "@/data/scenarios.json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { scenario_id, message } = body;

    if (typeof scenario_id !== "number") {
      return NextResponse.json({ detail: "scenario_id must be an integer" }, { status: 400 });
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json({ detail: "message must be a non-empty string" }, { status: 400 });
    }

    // Find the scenario
    const scenario = scenariosData.scenarios.find((s) => s.scenario_id === scenario_id);
    if (!scenario) {
      return NextResponse.json({ detail: "scenario not found" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // 🌟 FALLBACK: If GEMINI_API_KEY is not set, use keyword-matching over the pre-generated QA
      console.warn("⚠️ GEMINI_API_KEY is not configured. Falling back to rule-based Q&A matching.");
      const msgLower = message.toLowerCase();
      
      let matchedQa = scenario.interactive_qa[0]; // Default to Q1 (Why AI decision)
      if (msgLower.includes("rủi ro") || msgLower.includes("thuận lợi") || msgLower.includes("chú ý") || msgLower.includes("lưu ý") || msgLower.includes("xấu")) {
        matchedQa = scenario.interactive_qa[1];
      } else if (msgLower.includes("tin cậy") || msgLower.includes("đúng") || msgLower.includes("sai") || msgLower.includes("giải thích") || msgLower.includes("bẫy")) {
        matchedQa = scenario.interactive_qa[2];
      }

      return NextResponse.json({
        answer: `[Fallback AI Assist] ${matchedQa.answer}`,
      });
    }

    // Format scenario data for the model
    const profile = scenario.profile;
    const aiPred = scenario.ai_prediction;
    const shapText = scenario.shap_summary.text;

    const caseContext = `
[HỒ SƠ KHÁCH HÀNG XIN VAY VỐN]
- Tuổi: ${profile.Age} tuổi
- Thu nhập hàng tháng: ${profile.MonthlyIncome.toLocaleString("vi-VN")} VND
- Số tiền vay: ${profile.LoanAmount.toLocaleString("vi-VN")} VND
- Điểm tín dụng (FICO): ${profile.CreditScore} điểm
- Tỷ lệ nợ trên thu nhập (DTI): ${Math.round(profile.TotalDebtToIncomeRatio * 100)}%
- Số lần nợ quá hạn nợ xấu trước đây: ${profile.PreviousLoanDefaults} lần
- Lịch sử phá sản: ${profile.BankruptcyHistory === 1 ? "Có tiền án phá sản" : "Không có lịch sử phá sản"}
- Tình trạng việc làm: ${profile.EmploymentStatus}
- Đề xuất mô hình AI: ${aiPred.decision === "approve" ? "DUYỆT" : "TỪ CHỐI"} (Độ tin cậy: ${aiPred.confidence_percent}%)
- Tác động đặc trưng (SHAP): ${shapText}
`;

    const systemInstruction = `Bạn là Trợ lý AI giải thích tín dụng của ngân hàng. Nhiệm vụ của bạn là giải đáp thắc mắc của chuyên viên tín dụng về đề xuất của mô hình máy học.
QUY TẮC BẮT BUỘC:
1. ĐÓNG VAI NHẤT QUÁN: Đề xuất của mô hình AI đối với hồ sơ này là ${aiPred.decision === "approve" ? "DUYỆT" : "TỪ CHỐI"}. Bạn phải luôn giải thích dựa trên góc nhìn ủng hộ quyết định này của mô hình. Tuyệt đối không được nói "AI đã đoán sai", "AI bị lỗi" hoặc "Thực tế là Từ chối/Duyệt".
2. BIỆN MINH LOGIC: Nếu khách hàng có các thông số xấu (như nợ xấu, DTI cao) nhưng AI vẫn Duyệt, hãy giải thích là do các yếu tố tốt khác (như thu nhập lớn, điểm tín dụng cao) đã bù đắp rủi ro trong mắt của mô hình toán học.
3. NGẮN GỌN & THỰC TẾ: Trả lời ngắn gọn từ 2 đến 3 câu tiếng Việt lịch sự. Chỉ sử dụng thông tin được cung cấp trong hồ sơ khách hàng. Không được bịa đặt thông tin.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Hồ sơ tín dụng:\n${caseContext}\n\nCâu hỏi của tôi: ${message}`,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: systemInstruction,
          },
        ],
      },
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.2,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned error: ${errorText}`);
    }

    const responseData = await response.json();
    const answer = responseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
                   "Tôi xin lỗi, hiện tại tôi không thể đưa ra lời giải thích cho hồ sơ này.";

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in AI Chat Route:", error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
