import type { Attribute, Entity } from '../../../types/dataModel';

interface EntityEditorProps {
  entities: Entity[];
  onChange: (entities: Entity[]) => void;
  disabled: boolean;
}

function emptyAttribute(): Attribute {
  return { name: '', type: 'string', primaryKey: false, unique: false, nullable: true, foreignKey: null };
}

function emptyEntity(): Entity {
  return { name: '', attributes: [emptyAttribute()], indexes: [] };
}

// STCC-115 (T-022.2): edicion inline de entidades/atributos. Este
// componente solo maneja el estado local del borrador (array de
// entidades) via `onChange`; quien lo contiene (DataModelPage) decide
// cuando persistirlo con PATCH /data-model/entities (US-020).
export function EntityEditor({ entities, onChange, disabled }: EntityEditorProps) {
  function updateEntity(entityIndex: number, updater: (entity: Entity) => Entity) {
    onChange(entities.map((entity, i) => (i === entityIndex ? updater(entity) : entity)));
  }

  function updateAttribute(entityIndex: number, attributeIndex: number, updater: (attribute: Attribute) => Attribute) {
    updateEntity(entityIndex, (entity) => ({
      ...entity,
      attributes: entity.attributes.map((attribute, i) => (i === attributeIndex ? updater(attribute) : attribute)),
    }));
  }

  function addEntity() {
    onChange([...entities, emptyEntity()]);
  }

  function removeEntity(entityIndex: number) {
    onChange(entities.filter((_, i) => i !== entityIndex));
  }

  function addAttribute(entityIndex: number) {
    updateEntity(entityIndex, (entity) => ({ ...entity, attributes: [...entity.attributes, emptyAttribute()] }));
  }

  function removeAttribute(entityIndex: number, attributeIndex: number) {
    updateEntity(entityIndex, (entity) => ({
      ...entity,
      attributes: entity.attributes.filter((_, i) => i !== attributeIndex),
    }));
  }

  return (
    <div className="space-y-4">
      {entities.map((entity, entityIndex) => (
        <div key={entityIndex} className="space-y-3 rounded-card border border-outline-variant/30 bg-surface-container-low p-4 font-mono">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`entity-name-${entityIndex}`}>
              Nombre de la entidad {entityIndex + 1}
            </label>
            <input
              id={`entity-name-${entityIndex}`}
              value={entity.name}
              disabled={disabled}
              onChange={(e) => updateEntity(entityIndex, (ent) => ({ ...ent, name: e.target.value }))}
              placeholder="Nombre de la entidad"
              className="flex-1 rounded-control border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm font-medium text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeEntity(entityIndex)}
                className="rounded-control border border-danger/30 px-2 py-1 text-label-sm font-medium text-danger hover:bg-danger-container/20"
              >
                Eliminar entidad
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-label-sm text-on-surface-variant">
                  <th className="pr-2">Atributo</th>
                  <th className="pr-2">Tipo</th>
                  <th className="pr-2">PK</th>
                  <th className="pr-2">Unique</th>
                  <th className="pr-2">Nullable</th>
                  <th className="pr-2">FK → entidad.atributo</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {entity.attributes.map((attribute, attributeIndex) => (
                  <tr key={attributeIndex}>
                    <td className="pr-2 py-1">
                      <label className="sr-only" htmlFor={`attr-name-${entityIndex}-${attributeIndex}`}>
                        Nombre del atributo {attributeIndex + 1} de {entity.name || `entidad ${entityIndex + 1}`}
                      </label>
                      <input
                        id={`attr-name-${entityIndex}-${attributeIndex}`}
                        value={attribute.name}
                        disabled={disabled}
                        onChange={(e) =>
                          updateAttribute(entityIndex, attributeIndex, (a) => ({ ...a, name: e.target.value }))
                        }
                        className="w-28 rounded-control border border-outline-variant bg-surface-container-lowest px-2 py-1 text-on-surface disabled:opacity-60"
                      />
                    </td>
                    <td className="pr-2 py-1">
                      <label className="sr-only" htmlFor={`attr-type-${entityIndex}-${attributeIndex}`}>
                        Tipo del atributo {attributeIndex + 1} de {entity.name || `entidad ${entityIndex + 1}`}
                      </label>
                      <input
                        id={`attr-type-${entityIndex}-${attributeIndex}`}
                        value={attribute.type}
                        disabled={disabled}
                        onChange={(e) =>
                          updateAttribute(entityIndex, attributeIndex, (a) => ({ ...a, type: e.target.value }))
                        }
                        className="w-24 rounded-control border border-outline-variant bg-surface-container-lowest px-2 py-1 text-on-surface disabled:opacity-60"
                      />
                    </td>
                    <td className="pr-2 py-1 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${attribute.name || 'atributo'} es primary key`}
                        checked={attribute.primaryKey}
                        disabled={disabled}
                        onChange={(e) =>
                          updateAttribute(entityIndex, attributeIndex, (a) => ({ ...a, primaryKey: e.target.checked }))
                        }
                      />
                    </td>
                    <td className="pr-2 py-1 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${attribute.name || 'atributo'} es unique`}
                        checked={attribute.unique}
                        disabled={disabled}
                        onChange={(e) =>
                          updateAttribute(entityIndex, attributeIndex, (a) => ({ ...a, unique: e.target.checked }))
                        }
                      />
                    </td>
                    <td className="pr-2 py-1 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${attribute.name || 'atributo'} es nullable`}
                        checked={attribute.nullable}
                        disabled={disabled}
                        onChange={(e) =>
                          updateAttribute(entityIndex, attributeIndex, (a) => ({ ...a, nullable: e.target.checked }))
                        }
                      />
                    </td>
                    <td className="pr-2 py-1">
                      <div className="flex gap-1">
                        <input
                          aria-label={`${attribute.name || 'atributo'} FK entidad referenciada`}
                          value={attribute.foreignKey?.entity ?? ''}
                          disabled={disabled}
                          placeholder="entidad"
                          onChange={(e) =>
                            updateAttribute(entityIndex, attributeIndex, (a) => ({
                              ...a,
                              foreignKey: e.target.value
                                ? { entity: e.target.value, attribute: a.foreignKey?.attribute ?? 'id' }
                                : null,
                            }))
                          }
                          className="w-20 rounded-control border border-outline-variant bg-surface-container-lowest px-2 py-1 text-on-surface disabled:opacity-60"
                        />
                        <input
                          aria-label={`${attribute.name || 'atributo'} FK atributo referenciado`}
                          value={attribute.foreignKey?.attribute ?? ''}
                          disabled={disabled || !attribute.foreignKey}
                          placeholder="atributo"
                          onChange={(e) =>
                            updateAttribute(entityIndex, attributeIndex, (a) =>
                              a.foreignKey ? { ...a, foreignKey: { ...a.foreignKey, attribute: e.target.value } } : a,
                            )
                          }
                          className="w-20 rounded-control border border-outline-variant bg-surface-container-lowest px-2 py-1 text-on-surface disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </td>
                    <td className="py-1">
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removeAttribute(entityIndex, attributeIndex)}
                          className="text-label-sm font-medium text-danger hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={() => addAttribute(entityIndex)}
              className="text-label-sm font-medium text-primary hover:underline"
            >
              + Agregar atributo
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={addEntity}
          className="rounded-control border border-dashed border-outline-variant px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
        >
          + Agregar entidad
        </button>
      )}
    </div>
  );
}
