export function getTimeInfo(eventDate: string): { label: string; value: string } {
  const date = new Date(eventDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return { label: 'Days Away', value: diffDays.toString() };

  let years = now.getFullYear() - date.getFullYear();
  let months = now.getMonth() - date.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  let value = '';
  if (years > 0) value += `${years} yr${years !== 1 ? 's' : ''}`;
  if (months > 0) value += `${years > 0 ? ', ' : ''}${months} mo${months !== 1 ? 's' : ''}`;
  return { label: 'Since then:', value: value || 'Today' };
}

export function formatDate(eventDate: string): string {
  return new Date(eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
