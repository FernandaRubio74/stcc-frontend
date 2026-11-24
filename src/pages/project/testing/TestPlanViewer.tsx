import type { ReactNode } from 'react';
import type { TestPlanContent } from '../../../types/testing';
import { Badge } from '../../../components/Badge';
import { Icon } from '../../../components/icons';

const RISK_TONE: Record<string, 'danger' | 'warning' | 'success'> = {
  alto: 'danger',
  medio: 'warning',
  bajo: 'success',
};

const SECURITY_LABELS: Record<string, string> = {
  permisos: 'Permisos',
  'id-adivinado': 'ID adivinado',
  'token-vencido': 'Token vencido',
};

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-lg shadow-sm">
      <h3 className="flex items-center gap-space-xs text-headline-sm font-semibold text-on-surface">
        <Icon name={icon} className="text-secondary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-body-sm text-on-surface-variant">{text}</p>;
}

export function TestPlanViewer({ content }: { content: TestPlanContent }) {
  return (
    <div className="flex flex-col gap-space-lg">
      <Section icon="analytics" title="Estrategia">
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div>
            <p className="text-label-sm uppercase tracking-wider text-outline">Dentro del alcance</p>
            {content.strategy.inScope.length === 0 ? (
              <EmptyRow text="Sin datos." />
            ) : (
              <ul className="mt-1 list-disc pl-5 text-body-sm text-on-surface">
                {content.strategy.inScope.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-label-sm uppercase tracking-wider text-outline">Fuera del alcance</p>
            {content.strategy.outOfScope.length === 0 ? (
              <EmptyRow text="Sin exclusiones." />
            ) : (
              <ul className="mt-1 list-disc pl-5 text-body-sm text-on-surface">
                {content.strategy.outOfScope.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {content.strategy.riskPriorities.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            <p className="text-label-sm uppercase tracking-wider text-outline">Riesgos priorizados</p>
            {content.strategy.riskPriorities.map((risk, i) => (
              <div key={i} className="flex items-start gap-space-sm rounded-lg bg-surface-container p-2.5">
                <Badge tone={RISK_TONE[risk.risk] ?? 'neutral'}>{risk.risk}</Badge>
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-on-surface">{risk.item}</p>
                  <p className="text-label-sm text-on-surface-variant">{risk.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="fact_check" title="Casos de aceptación (Dado / Cuando / Entonces)">
        {content.acceptanceCases.length === 0 ? (
          <EmptyRow text="Todavía no hay casos de aceptación." />
        ) : (
          <div className="flex flex-col gap-2">
            {content.acceptanceCases.map((c) => (
              <div key={c.id} className="rounded-lg bg-surface-container p-space-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-code-sm text-on-surface-variant">
                    {c.id}
                  </span>
                  <span className="text-label-sm text-outline">{c.ruleRef}</span>
                </div>
                <p className="mt-1 text-body-sm text-on-surface">
                  <strong className="text-on-surface-variant">Dado</strong> {c.given}{' '}
                  <strong className="text-on-surface-variant">cuando</strong> {c.when}{' '}
                  <strong className="text-on-surface-variant">entonces</strong> {c.then}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="data_object" title="Casos por endpoint">
        {content.endpointCases.length === 0 ? (
          <EmptyRow text="Todavía no hay casos por endpoint." />
        ) : (
          <div className="flex flex-col gap-2">
            {content.endpointCases.map((c, i) => (
              <div key={i} className="rounded-lg bg-surface-container p-space-sm">
                <span className="font-mono text-code-sm font-semibold text-primary">{c.endpointRef}</span>
                <dl className="mt-1 space-y-0.5 text-body-sm text-on-surface-variant">
                  <div>
                    <span className="font-medium text-tertiary">Camino feliz: </span>
                    {c.happyPath}
                  </div>
                  <div>
                    <span className="font-medium text-warning">Datos inválidos: </span>
                    {c.invalidData}
                  </div>
                  <div>
                    <span className="font-medium text-danger">No autorizado: </span>
                    {c.unauthorized}
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="dashboard" title="Casos por pantalla">
        {content.screenCases.length === 0 ? (
          <EmptyRow text="Todavía no hay casos por pantalla." />
        ) : (
          <div className="flex flex-col gap-2">
            {content.screenCases.map((c, i) => (
              <div key={i} className="rounded-lg bg-surface-container p-space-sm">
                <span className="text-body-sm font-semibold text-on-surface">{c.screenRef}</span>
                <dl className="mt-1 space-y-0.5 text-body-sm text-on-surface-variant">
                  <div>
                    <span className="font-medium text-secondary">Carga: </span>
                    {c.loading}
                  </div>
                  <div>
                    <span className="font-medium text-outline">Vacío: </span>
                    {c.empty}
                  </div>
                  <div>
                    <span className="font-medium text-danger">Error: </span>
                    {c.error}
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="route" title="Flujos de punta a punta">
        {content.e2eFlows.length === 0 ? (
          <EmptyRow text="Todavía no hay flujos de punta a punta." />
        ) : (
          <div className="flex flex-col gap-2">
            {content.e2eFlows.map((flow, i) => (
              <div key={i} className="rounded-lg bg-surface-container p-space-sm">
                <p className="text-body-sm font-semibold text-on-surface">{flow.name}</p>
                <ol className="mt-1 list-decimal pl-5 text-body-sm text-on-surface-variant">
                  {flow.steps.map((step, j) => (
                    <li key={j}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="security" title="Casos de seguridad">
        {content.securityCases.length === 0 ? (
          <EmptyRow text="Todavía no hay casos de seguridad." />
        ) : (
          <div className="flex flex-col gap-2">
            {content.securityCases.map((c) => (
              <div key={c.id} className="flex items-start gap-space-sm rounded-lg bg-surface-container p-space-sm">
                <Badge tone="danger">{SECURITY_LABELS[c.type] ?? c.type}</Badge>
                <p className="text-body-sm text-on-surface">{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="block" title="Casos negativos (lo que el sistema debe rechazar)">
        {content.negativeCases.length === 0 ? (
          <EmptyRow text="Todavía no hay casos negativos." />
        ) : (
          <div className="flex flex-col gap-2">
            {content.negativeCases.map((c) => (
              <div key={c.id} className="rounded-lg bg-surface-container p-space-sm text-body-sm">
                <span className="text-on-surface">{c.description}</span>
                <span className="text-on-surface-variant"> → {c.expectedRejection}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="accessibility_new" title="Usabilidad y accesibilidad básica">
        {content.usabilityCases.length === 0 ? (
          <EmptyRow text="Todavía no hay casos de usabilidad." />
        ) : (
          <ul className="list-disc pl-5 text-body-sm text-on-surface">
            {content.usabilityCases.map((c) => (
              <li key={c.id}>{c.description}</li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon="database" title="Datos de prueba necesarios">
        {content.testData.length === 0 ? (
          <EmptyRow text="Todavía no se registraron necesidades de datos de prueba." />
        ) : (
          <div className="flex flex-col gap-1.5">
            {content.testData.map((d, i) => (
              <div key={i} className="flex items-center gap-space-sm rounded-lg bg-surface-container p-2.5 text-body-sm">
                <span className="font-mono text-code-sm text-primary">{d.entity}</span>
                <Badge tone="info">{d.environment}</Badge>
                <span className="text-on-surface-variant">{d.description}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon="link" title="Matriz de trazabilidad">
        {content.traceabilityMatrix.length === 0 ? (
          <EmptyRow text="Todavía no hay matriz de trazabilidad." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="text-left text-label-sm text-outline">
                  <th className="pb-1 pr-2">Requisito / regla</th>
                  <th className="pb-1">Casos que lo prueban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {content.traceabilityMatrix.map((entry, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-2 text-on-surface">{entry.requirementRef}</td>
                    <td className="py-1.5 font-mono text-code-sm text-on-surface-variant">
                      {entry.caseIds.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
