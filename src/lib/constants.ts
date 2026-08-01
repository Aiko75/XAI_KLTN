export const WELCOME_TITLE = "Chào mừng bạn đến với Thực nghiệm HCI";

export const WELCOME_DESCRIPTION = 
  "Bạn sẽ đóng vai trò là một Chuyên viên tín dụng ngân hàng. Hãy cân nhắc thông tin hồ sơ của khách hàng và đề xuất của hệ thống AI để đưa ra quyết định duyệt hoặc từ chối cấp tín dụng cho 20 hồ sơ.";

export const SIDEBAR_TIPS = [
  "Xem kỹ hồ sơ tín dụng ở cột bên trái trước khi đưa ra quyết định.",
  "Đề xuất của AI chỉ mang tính chất tham khảo dựa trên thuật toán học máy.",
  "Bạn có toàn quyền lựa chọn đồng ý hoặc phản bác đề xuất của AI.",
];

export interface SurveyQuestion {
  key: string;
  label: string;
  lowLabel: string;
  highLabel: string;
  description: string;
}

export const NASA_TLX_QUESTIONS: SurveyQuestion[] = [
  {
    key: "mental_demand",
    label: "Đòi hỏi trí óc (Mental Demand)",
    lowLabel: "Rất thấp",
    highLabel: "Rất cao",
    description: "Bạn phải suy nghĩ, lựa chọn, ghi nhớ, tính toán hay tập trung nhiều như thế nào?",
  },
  {
    key: "temporal_demand",
    label: "Đòi hỏi thời gian (Temporal Demand)",
    lowLabel: "Rất thong thả",
    highLabel: "Rất áp lực",
    description: "Bạn có cảm thấy áp lực về mặt thời gian do nhịp độ làm việc hay không?",
  },
  {
    key: "performance",
    label: "Hiệu quả công việc (Performance)",
    lowLabel: "Rất kém",
    highLabel: "Rất tốt",
    description: "Bạn tự đánh giá mức độ thành công trong việc phát hiện chính xác các lỗi sai của AI?",
  },
  {
    key: "effort",
    label: "Sự nỗ lực (Effort)",
    lowLabel: "Rất ít",
    highLabel: "Rất nhiều",
    description: "Bạn phải bỏ ra bao nhiêu công sức (trí óc) để hoàn thành các câu hỏi thực nghiệm?",
  },
  {
    key: "frustration",
    label: "Sự ức chế (Frustration)",
    lowLabel: "Thoải mái",
    highLabel: "Căng thẳng",
    description: "Bạn có cảm thấy bực mình, nản lòng, căng thẳng hay áp lực trong quá trình làm test?",
  },
  {
    key: "overall_load",
    label: "Gánh nặng chung (Overall Load)",
    lowLabel: "Rất nhẹ nhàng",
    highLabel: "Rất nặng nề",
    description: "Nhìn chung, gánh nặng nhận thức tổng quát bạn phải trải qua là bao nhiêu?",
  },
];

export const NASA_TLX_QUESTIONS_EN: SurveyQuestion[] = [
  {
    key: "mental_demand",
    label: "Mental Demand",
    lowLabel: "Very Low",
    highLabel: "Very High",
    description: "How much mental and perceptual activity was required (e.g. thinking, deciding, calculating, remembering, looking, searching, etc.)?",
  },
  {
    key: "temporal_demand",
    label: "Temporal Demand",
    lowLabel: "Very Low",
    highLabel: "Very High",
    description: "How much time pressure did you feel due to the rate or pace at which the tasks occurred?",
  },
  {
    key: "performance",
    label: "Performance",
    lowLabel: "Failure",
    highLabel: "Perfect",
    description: "How successful do you think you were in detecting the errors of the AI system?",
  },
  {
    key: "effort",
    label: "Effort",
    lowLabel: "Very Low",
    highLabel: "Very High",
    description: "How hard did you have to work (mentally and physically) to accomplish your level of performance?",
  },
  {
    key: "frustration",
    label: "Frustration Level",
    lowLabel: "Very Low",
    highLabel: "Very High",
    description: "How insecure, discouraged, irritated, stressed, and annoyed did you feel during the task?",
  },
  {
    key: "overall_load",
    label: "Overall Load",
    lowLabel: "Very Low",
    highLabel: "Very High",
    description: "Overall, how heavy was the general cognitive workload you experienced?",
  },
];
