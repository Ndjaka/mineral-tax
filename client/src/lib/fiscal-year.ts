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
  return `export_mineraltax_${fiscalYear}_directives_OFDF.csv`;
}
