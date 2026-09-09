import type { Bi } from "./i18n";
import type { Project, StackGroup } from "./content";

/* ══════════════════════════════════════════════════════════════
   STACK CON EVIDENCIA

   La página nueva no muestra "dominio 90/82/62": muestra en qué
   proyectos aparece cada tecnología. Todo se calcula desde
   `projects[].tags` por coincidencia exacta; las categorías del `stack`
   sólo sirven para agrupar cuando el nombre coincide. Una tecnología
   que aparezca en varios proyectos no es un porcentaje de maestría —
   es un dato.
   ══════════════════════════════════════════════════════════════ */

export type TechEvidence = {
  name: string;
  projectIds: string[];
};

export type ExpertiseGroup = {
  label: Bi;
  items: TechEvidence[];
};

export const OTHER_GROUP: Bi = {
  es: "Herramientas y servicios",
  en: "Tools and services",
};

export function buildExpertise(
  projects: readonly Pick<Project, "id" | "tags">[],
  stack: readonly StackGroup[],
): ExpertiseGroup[] {
  const byTag = new Map<string, string[]>();
  projects.forEach((p) => {
    p.tags.forEach((tag) => {
      const list = byTag.get(tag) ?? [];
      if (!list.includes(p.id)) list.push(p.id);
      byTag.set(tag, list);
    });
  });

  const sortItems = (items: TechEvidence[]) =>
    items.sort(
      (a, b) =>
        b.projectIds.length - a.projectIds.length || a.name.localeCompare(b.name),
    );

  const placed = new Set<string>();
  const groups: ExpertiseGroup[] = [];

  stack.forEach((group) => {
    const items: TechEvidence[] = [];
    group.items.forEach((item) => {
      const ids = byTag.get(item.name);
      if (!ids) return; // sin proyecto que lo respalde, no se muestra
      items.push({ name: item.name, projectIds: [...ids] });
      placed.add(item.name);
    });
    if (items.length) groups.push({ label: group.label, items: sortItems(items) });
  });

  const rest: TechEvidence[] = [];
  byTag.forEach((ids, tag) => {
    if (!placed.has(tag)) rest.push({ name: tag, projectIds: [...ids] });
  });
  if (rest.length) groups.push({ label: OTHER_GROUP, items: sortItems(rest) });

  return groups;
}
