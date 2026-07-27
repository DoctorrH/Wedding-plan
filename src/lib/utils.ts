export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortVND(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return `${amount} ₫`;
}

export function getDaysRemaining(targetDateStr: string): { days: number; isPassed: boolean } {
  const target = new Date(targetDateStr);
  const now = new Date();
  
  // Reset hours for pure day difference
  target.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    days: Math.abs(diffDays),
    isPassed: diffDays < 0,
  };
}

export function getMonthYearString(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `Tháng ${month}/${year}`;
}

export function printSection(title: string) {
  window.print();
}
