export interface Schedule {
  id: string;
  courseId: string;
  courseName: string;
  professorId: string;
  professorName: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  semester: number;
  academicYear: string;
}

export interface CreateScheduleDto {
  courseId: string;
  professorId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  semester: number;
  academicYear: string;
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {} 