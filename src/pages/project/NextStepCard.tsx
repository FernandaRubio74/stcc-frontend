import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Icon } from '../../components/icons';
import type { NextStage } from './projectStages';

/**
 * Panel de "que sigue" en la pantalla del proyecto.
 *
 * Problema que resuelve: al crear un proyecto se caia en una pantalla con
 * el stepper de 8 etapas y el panel de miembros, sin ninguna indicacion de
 * por donde empezar - la accion real (contar la idea) estaba escondida
 * detras del primer paso del stepper. Ahora lo primero que se ve es una
 * sola accion, con el texto de lo que va a pasar al tocarla.
 */

const COPY: Record<string, { title: string; body: string; cta: string }> = {
  wizard: {
    title: 'Contanos tu idea',
    body: 'Vas a conversar con el asistente sobre qué problema querés resolver y para quién. Con eso se arma la base de todo lo demás: no hace falta que tengas nada escrito ni que sepas términos técnicos.',
    cta: 'Empezar a describir la idea',
  },
  'data-model': {
    title: 'Definí el modelo de datos',
    body: 'A partir de tu idea se propone qué información guarda el producto y cómo se relaciona entre sí. Vas a poder revisarlo y ajustarlo antes de aprobarlo.',
    cta: 'Ir al modelo de datos',
  },
  'api-spec': {
    title: 'Definí la API',
    body: 'Se derivan los endpoints necesarios a partir del modelo de datos que aprobaste, con sus códigos de respuesta y permisos.',
    cta: 'Ir a la especificación de API',
  },
  screens: {
    title: 'Diseñá el mapa de pantallas',
    body: 'Se proponen las pantallas del producto y cómo se navega entre ellas, conectadas a los datos y endpoints que ya existen.',
    cta: 'Ir al mapa de pantallas',
  },
  architecture: {
    title: 'Elegí la arquitectura',
    body: 'Se recomienda una arquitectura según el alcance de tu MVP, con la justificación de por qué conviene esa y no otra.',
    cta: 'Ir a arquitectura',
  },
  testing: {
    title: 'Armá el plan de pruebas',
    body: 'Se derivan los casos de prueba de todo lo aprobado: requisitos, endpoints, pantallas y casos de seguridad.',
    cta: 'Ir a pruebas',
  },
  review: {
    title: 'Revisá el proyecto completo',
    body: 'Todas las etapas están completas. Falta la revisión final para confirmar que no quedaron contradicciones entre ellas.',
    cta: 'Ir a la revisión final',
  },
  documents: {
    title: 'Generá la documentación final',
    body: 'El proyecto está listo. Podés generar y descargar los documentos para entregárselos a quien vaya a implementarlo.',
    cta: 'Ir a documentos finales',
  },
};

interface Props {
  next: NextStage;
}

export function NextStepCard({ next }: Props) {
  const navigate = useNavigate();
  const copy = COPY[next.id] ?? COPY.wizard;
  const progress = Math.round((next.completed / next.total) * 100);

  return (
    <section
      className="relative overflow-hidden rounded-card border border-primary/20 bg-primary-container/15 p-space-lg shadow-sm"
      aria-labelledby="next-step-title"
    >
      <div className="flex flex-col gap-space-lg md:flex-row md:items-center md:justify-between">
        <div className="flex gap-space-md">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Icon name={next.isStart ? 'lightbulb' : 'arrow_forward'} />
          </span>
          <div className="min-w-0">
            <p className="text-label-sm uppercase tracking-wider text-primary">
              {next.isStart ? 'Primer paso' : `Paso ${next.completed + 1} de ${next.total}`}
            </p>
            <h2 id="next-step-title" className="text-title-lg font-semibold text-on-surface">
              {copy.title}
            </h2>
            <p className="mt-1 max-w-prose text-body-sm text-on-surface-variant">{copy.body}</p>
          </div>
        </div>

        <Button onClick={() => navigate(next.to)} className="shrink-0 self-start md:self-auto">
          {copy.cta}
          <Icon name="arrow_forward" className="text-[16px]" />
        </Button>
      </div>

      {!next.isStart && (
        <div className="mt-space-lg">
          <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
            <span>Progreso del proyecto</span>
            <span>
              {next.completed} de {next.total} etapas
            </span>
          </div>
          <div
            className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-container-high"
            role="progressbar"
            aria-valuenow={next.completed}
            aria-valuemin={0}
            aria-valuemax={next.total}
            aria-label="Etapas completas"
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </section>
  );
}
