import type { CompetitionFormValues, StageFormValues } from '../../api/competitions';

export type CompetitionFieldErrors = {
  slug?: string;
  title?: string;
  type?: string;
  startAt?: string;
  endAt?: string;
};

export type StageFieldError = {
  name?: string;
  stageDate?: string;
  stageEndDate?: string;
};

export type CompetitionValidationResult = {
  isValid: boolean;
  fieldErrors: CompetitionFieldErrors;
  stageErrors: StageFieldError[];
  commonErrors: string[];
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function parseStageDate(value?: string) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function toDateOnlyTimestamp(value: string): number | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return timestamp;
}

export function validateCompetitionForm(
  values: CompetitionFormValues,
  stages: StageFormValues[],
): CompetitionValidationResult {
  const fieldErrors: CompetitionFieldErrors = {};
  const stageErrors: StageFieldError[] = stages.map(() => ({}));
  const commonErrors: string[] = [];

  if (!values.slug.trim()) {
    fieldErrors.slug = 'Укажите идентификатор соревнования';
  }

  if (!values.title.trim()) {
    fieldErrors.title = 'Укажите название соревнования';
  }

  if (!values.type.trim()) {
    fieldErrors.type = 'Укажите тип соревнования';
  }

  if (!values.startAt) {
    fieldErrors.startAt = 'Укажите дату начала';
  }

  if (!values.endAt) {
    fieldErrors.endAt = 'Укажите дату окончания';
  }

  let startDateTime: Date | null = null;
  let endDateTime: Date | null = null;

  if (values.startAt) {
    const parsed = new Date(values.startAt);
    if (Number.isNaN(parsed.getTime())) {
      fieldErrors.startAt = 'Некорректная дата начала';
    } else {
      startDateTime = parsed;
    }
  }

  if (values.endAt) {
    const parsed = new Date(values.endAt);
    if (Number.isNaN(parsed.getTime())) {
      fieldErrors.endAt = 'Некорректная дата окончания';
    } else {
      endDateTime = parsed;
    }
  }

  if (startDateTime && endDateTime && endDateTime.getTime() < startDateTime.getTime()) {
    commonErrors.push('Дата окончания должна быть больше или равна дате начала соревнования');
  }

  const competitionStartDateOnly = values.startAt ? values.startAt.slice(0, 10) : '';
  const competitionEndDateOnly = values.endAt ? values.endAt.slice(0, 10) : '';

  const startDateOnlyTs = toDateOnlyTimestamp(competitionStartDateOnly);
  const endDateOnlyTs = toDateOnlyTimestamp(competitionEndDateOnly);

  for (let index = 0; index < stages.length; index += 1) {
    const stage = stages[index];

    if (!stage.name.trim()) {
      stageErrors[index].name = 'Укажите название этапа';
    }

    if (!stage.stageDate) {
      stageErrors[index].stageDate = 'Укажите дату начала этапа';
    }
    
    if (!stage.stageEndDate) {
      stageErrors[index].stageEndDate = 'Укажите дату окончания этапа';
    }

    const stageDateTs = toDateOnlyTimestamp(stage.stageDate);

    if (stageDateTs === null) {
      stageErrors[index].stageDate = 'Некорректная дата этапа';
      continue;
    }

    if (startDateOnlyTs !== null && endDateOnlyTs !== null) {
      if (stageDateTs < startDateOnlyTs || stageDateTs > endDateOnlyTs) {
        stageErrors[index].stageDate =
          'Дата этапа должна находиться в диапазоне дат соревнования';
      }
    }

    const competitionStartRaw = values.startAt ? new Date(values.startAt) : null;
    const competitionEndRaw = values.endAt ? new Date(values.endAt) : null;

    const competitionStart =
      competitionStartRaw && !Number.isNaN(competitionStartRaw.getTime())
        ? startOfDay(competitionStartRaw)
        : null;

    const competitionEnd =
      competitionEndRaw && !Number.isNaN(competitionEndRaw.getTime())
        ? endOfDay(competitionEndRaw)
        : null;

    const stageStart = parseStageDate(stage.stageDate);
    const stageEnd = parseStageDate(stage.stageEndDate);

    if (stageStart && stageEnd && stageEnd < stageStart) {
      stageErrors[index].stageEndDate =
        'Дата окончания этапа должна быть не раньше даты начала';
    }
    
    if (competitionStart && competitionEnd && stageStart) {
      if (stageStart < competitionStart || stageStart > competitionEnd) {
        stageErrors[index].stageDate =
          'Дата начала этапа должна быть в периоде соревнования';
      }
    }
    
    if (competitionStart && competitionEnd && stageEnd) {
      if (stageEnd < competitionStart || stageEnd > competitionEnd) {
        stageErrors[index].stageEndDate =
          'Дата окончания этапа должна быть в периоде соревнования';
      }
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const hasStageErrors = stageErrors.some((item) => Object.keys(item).length > 0);
  const hasCommonErrors = commonErrors.length > 0;

  return {
    isValid: !hasFieldErrors && !hasStageErrors && !hasCommonErrors,
    fieldErrors,
    stageErrors,
    commonErrors,
  };
}