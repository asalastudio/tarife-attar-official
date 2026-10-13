export type TerritoryId = 'EMBER' | 'PETAL' | 'TIDAL' | 'TERRA';

export function scoreTerritory(answers: Record<number, TerritoryId[]>): TerritoryId {
  const scores: Record<TerritoryId, number> = { EMBER: 0, PETAL: 0, TIDAL: 0, TERRA: 0 };
  for (const answer of Object.values(answers)) {
    for (const territory of answer) scores[territory]++;
  }
  return (Object.keys(scores) as TerritoryId[]).reduce((best, territory) =>
    scores[territory] > scores[best] ? territory : best, 'EMBER');
}
