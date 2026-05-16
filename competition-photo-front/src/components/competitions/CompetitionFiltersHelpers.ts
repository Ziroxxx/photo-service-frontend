import type { Competition } from '../../types/competition';

export type CompetitionFilterValues = {
  query: string;
  startDateFrom: string;
  endDateTo: string;
  status: string;
  type: string;
  city: string;
};

export type CompetitionFilterOptions = {
  statuses: string[];
  types: string[];
  cities: string[];
};

export function createDefaultCompetitionFilters(): CompetitionFilterValues {
  return {
    query: '',
    startDateFrom: '',
    endDateTo: '',
    status: 'Все',
    type: 'Все',
    city: 'Все',
  };
}

export function buildCompetitionFilterOptions(
  competitions: Competition[],
): CompetitionFilterOptions {
  const statuses = Array.from(
    new Set(
      competitions
        .map((item) => item.status?.trim())
        .filter((item): item is string => Boolean(item)),
    ),
  );

  const types = Array.from(
    new Set(
      competitions
        .map((item) => item.type?.trim())
        .filter((item): item is string => Boolean(item)),
    ),
  );

  const cities = Array.from(
    new Set(
      competitions
        .map((item) => item.city?.trim())
        .filter((item): item is string => Boolean(item)),
    ),
  );

  return {
    statuses: ['Все', ...statuses],
    types: ['Все', ...types],
    cities: ['Все', ...cities],
  };
}

export function applyCompetitionFilters(
  competitions: Competition[],
  filters: CompetitionFilterValues,
): Competition[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return competitions.filter((competition) => {
    const title = competition.title?.toLowerCase() ?? '';
    const slug = competition.slug?.toLowerCase() ?? '';
    const city = competition.city?.trim() ?? '';
    const status = competition.status ?? '';
    const type = competition.type ?? '';

    const matchesQuery =
      !normalizedQuery ||
      title.includes(normalizedQuery) ||
      slug.includes(normalizedQuery);

    const matchesStatus =
      filters.status === 'Все' || status === filters.status;

    const matchesType =
      filters.type === 'Все' || type === filters.type;

    const matchesCity =
      filters.city === 'Все' || city === filters.city;

    const competitionStart = new Date(competition.startAt);
    const competitionEnd = new Date(competition.endAt);

    const matchesStartDate =
      !filters.startDateFrom ||
      competitionEnd >= new Date(`${filters.startDateFrom}T00:00:00`);

    const matchesEndDate =
      !filters.endDateTo ||
      competitionStart <= new Date(`${filters.endDateTo}T23:59:59`);

    return (
      matchesQuery &&
      matchesStatus &&
      matchesType &&
      matchesCity &&
      matchesStartDate &&
      matchesEndDate
    );
  });
}