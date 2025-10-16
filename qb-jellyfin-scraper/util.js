/**
 * 格式化时间
 * @param date
 * @param format yyyy-MM-dd HH:mm:ss
 * @returns
 */
const formatDateToStr = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  });
  // 创建时间对象
  const parts = formatter.formatToParts(date instanceof Date ? date : new Date(date || Date.now()));

  const formattedDate = parts.reduce((result, part) => {
    switch (part.type) {
      case 'year':
        return result.replace('yyyy', part.value);
      case 'month':
        return result.replace('MM', part.value);
      case 'day':
        return result.replace('dd', part.value);
      case 'hour':
        return result.replace('HH', part.value === '24' ? '00' : part.value);
      case 'minute':
        return result.replace('mm', part.value);
      case 'second':
        return result.replace('ss', part.value);
      default:
        return result;
    }
  }, format || 'yyyy-MM-dd HH:mm:ss');

  return formattedDate;
};

module.exports = { formatDateToStr };
