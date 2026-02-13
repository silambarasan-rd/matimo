/**
 * Commitlint configuration
 * 
 * Enforces conventional commit format:
 * <type>(<scope>): <subject>
 * 
 * Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
 * Scopes: Optional but recommended (core, cli, mcp, auth, etc.)
 * 
 * Examples:
 * - feat(core): add tool loader from YAML
 * - fix(executor): validate parameters before execution
 * - docs(readme): update quickstart guide
 * - test(decorator): add comprehensive decorator tests
 * - chore(deps): upgrade zod to v4
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',        // New feature
        'fix',         // Bug fix
        'docs',        // Documentation
        'style',       // Code style (no logic change)
        'refactor',    // Code refactor (no feature change)
        'perf',        // Performance improvement
        'test',        // Test additions/modifications
        'chore',       // Build, dependencies, tooling
        'ci',          // CI/CD configuration
        'revert',       // Revert previous commit
        'example',     // Example code changes
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['upper-case', 'start-case', 'pascal-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  }
};
