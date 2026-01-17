export function getFiscalYear(): number {
  return new Date().getFullYear() - 1;
}

export function getFiscalYearLabel(): string {
  return `${getFiscalYear()}`;
}

export function isUrgentPeriod(): boolean {
  const now = new Date();
  const month = now.getMonth();
  return month >= 0 && month <= 2;
}

export function getExportFilename(clientName: string): string {
  const fiscalYear = getFiscalYear();
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Client';
  return `MineralTax_Export_${fiscalYear}_${safeName}.csv`;
}
