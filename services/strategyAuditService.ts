import { PROVEN_STRATEGIES } from '../constants/strategies';

export interface StrategyAuditResult {
  id: string;
  ok: boolean;
  message: string;
}

export const auditStrategies = (): StrategyAuditResult[] => {
  return PROVEN_STRATEGIES.map((s) => {
    if (!s.structure?.length) {
      return { id: s.id, ok: false, message: 'Sin estructura de adsets.' };
    }

    const pct = s.structure.reduce((acc, item) => acc + (item.budgetPercentage || 0), 0);
    if (pct <= 0) {
      return { id: s.id, ok: false, message: 'Presupuestos inválidos (<= 0).' };
    }

    if (!s.platforms?.length) {
      return { id: s.id, ok: false, message: 'Sin plataformas definidas.' };
    }

    return { id: s.id, ok: true, message: `OK (${s.structure.length} adsets, presupuesto ${pct}%)` };
  });
};
