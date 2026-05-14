import type { Grade, GradeLabel } from '../../types/domain';

export function gradeFromLabel(label: GradeLabel | undefined): Grade {
  switch (label) {
    case '안심':
    case '충분':
      return 'SAFE';
    case '양호':
    case '보통':
      return 'NORMAL';
    case '주의':
    case '부족':
      return 'CAUTION';
    case '경고':
    case '위험':
      return 'DANGER';
    default:
      return 'NORMAL';
  }
}

export function gradeClassName(grade: Grade): string {
  return `grade-${grade.toLowerCase()}`;
}

export function gradeTextClassName(grade: Grade): string {
  return `text-grade-${grade.toLowerCase()}`;
}
