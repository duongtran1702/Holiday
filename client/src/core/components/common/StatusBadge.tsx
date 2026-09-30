

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "PENDING": "bg-amber-50 text-amber-700 border-amber-200",
    "PENDING_PAYMENT": "bg-orange-50 text-orange-700 border-orange-200",
    "PAID": "bg-blue-50 text-blue-700 border-blue-200",
    "COMPLETED": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "CANCELLED": "bg-red-50 text-red-700 border-red-200",
    "Đã giao": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Hoàn thành": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Đã thanh toán": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Đang giao": "bg-blue-50 text-blue-700 border-blue-200",
    "Đang xử lý": "bg-amber-50 text-amber-700 border-amber-200",
    "Chờ duyệt": "bg-orange-50 text-orange-700 border-orange-200",
    "Đã hủy": "bg-red-50 text-red-700 border-red-200",
    "Hoạt động": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Vượt hạn mức": "bg-red-50 text-red-700 border-red-200",
    "Chưa thanh toán": "bg-red-50 text-red-700 border-red-200",
    "Thanh toán một phần": "bg-amber-50 text-amber-700 border-amber-200",
    "Tạm khóa": "bg-red-50 text-red-700 border-red-200",
  };
  
  const labelMap: Record<string, string> = {
    "PENDING": "Chờ xử lý",
    "PENDING_PAYMENT": "Chờ thanh toán",
    "PAID": "Đã thanh toán",
    "COMPLETED": "Hoàn thành",
    "CANCELLED": "Đã hủy"
  };

  const displayStatus = labelMap[status] || status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full ${map[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {displayStatus}
    </span>
  );
}