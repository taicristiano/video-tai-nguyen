/**
 * src/templates/human-insight/cinematic-light/templateDependencies.ts
 *
 * HAY & ĐẸP. — Template Static Dependency Contract
 * Single source of truth is templateDependenciesRuntime.mjs.
 * This TypeScript module re-exports types and the authoritative runtime implementation.
 */

export type {
  TemplateStaticDependencyContract,
  EffectiveTemplateConfig,
  DependencyResolverOptions,
} from './templateDependenciesRuntime.mjs';

export {
  CINEMATIC_LIGHT_DEPENDENCIES,
  resolveEffectiveTemplateConfig,
  resolveTemplateDependencies,
} from './templateDependenciesRuntime.mjs';
