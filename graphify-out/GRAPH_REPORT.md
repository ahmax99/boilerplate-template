# Graph Report - boilerplate-template  (2026-07-04)

## Corpus Check
- 296 files · ~34,538 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1009 nodes · 1664 edges · 65 communities (44 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b690f36d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_auth.ts|auth.ts]]
- [[_COMMUNITY_errorHandler.ts|errorHandler.ts]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_correctness|correctness]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_ContactForm.tsx|ContactForm.tsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_suspicious|suspicious]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_Boilerplate Template|Boilerplate Template]]
- [[_COMMUNITY_post.model.ts|post.model.ts]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_useAccountActions.ts|useAccountActions.ts]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_biome.json|biome.json]]
- [[_COMMUNITY_.fallowrc.json|.fallowrc.json]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_formatter|formatter]]
- [[_COMMUNITY_formatter|formatter]]
- [[_COMMUNITY_assist|assist]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_tsconfig.json|tsconfig.json]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_release-please-config.json|release-please-config.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_client.ts|client.ts]]
- [[_COMMUNITY_overrides|overrides]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_javascript|javascript]]
- [[_COMMUNITY_organizeImports|organizeImports]]
- [[_COMMUNITY_vcs|vcs]]
- [[_COMMUNITY_protect-env.sh|protect-env.sh]]
- [[_COMMUNITY_session-start.sh|session-start.sh]]
- [[_COMMUNITY_graphify|graphify]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_WelcomeEmail.tsx|WelcomeEmail.tsx]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_linter|linter]]
- [[_COMMUNITY_json-field.ts|json-field.ts]]
- [[_COMMUNITY_protect-destructive.sh|protect-destructive.sh]]
- [[_COMMUNITY_deploy-static-assets.sh|deploy-static-assets.sh]]
- [[_COMMUNITY_detect-affected.sh|detect-affected.sh]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_CHANGELOG|CHANGELOG.md]]
- [[_COMMUNITY_auto-format.sh|auto-format.sh]]
- [[_COMMUNITY_protect-bash.sh|protect-bash.sh]]
- [[_COMMUNITY_stop-typecheck.sh|stop-typecheck.sh]]
- [[_COMMUNITY_build-and-push.sh|build-and-push.sh]]
- [[_COMMUNITY_deploy-lambda.sh|deploy-lambda.sh]]
- [[_COMMUNITY_terraform-bootstrap.sh|terraform-bootstrap.sh]]
- [[_COMMUNITY_terraform-ecr-check.sh|terraform-ecr-check.sh]]
- [[_COMMUNITY_terraform-plan-comment.sh|terraform-plan-comment.sh]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 53 edges
2. `suspicious` - 35 edges
3. `correctness` - 29 edges
4. `env` - 20 edges
5. `compilerOptions` - 16 edges
6. `scripts` - 15 edges
7. `getMe()` - 14 edges
8. `formatter` - 13 edges
9. `handleCallback()` - 12 edges
10. `PUBLIC_ROUTES` - 11 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  apps/nextjs-boilerplate/src/app/layout.tsx → apps/nextjs-boilerplate/src/utils/mergeClass.ts
- `EditAccountPage()` --calls--> `getMe()`  [EXTRACTED]
  apps/nextjs-boilerplate/src/app/(authorized)/account/edit/page.tsx → apps/nextjs-boilerplate/src/features/auth/server/api/index.ts
- `AccountPage()` --calls--> `getMe()`  [EXTRACTED]
  apps/nextjs-boilerplate/src/app/(authorized)/account/page.tsx → apps/nextjs-boilerplate/src/features/auth/server/api/index.ts
- `AuthorizedLayoutContent()` --calls--> `getSessionData()`  [EXTRACTED]
  apps/nextjs-boilerplate/src/app/(authorized)/layout.tsx → apps/nextjs-boilerplate/src/features/auth/server/services/session.ts
- `PublicLayoutContent()` --calls--> `getUserPermissions()`  [EXTRACTED]
  apps/nextjs-boilerplate/src/app/(public)/(main)/layout.tsx → apps/nextjs-boilerplate/src/features/auth/lib/permission.ts

## Import Cycles
- 1-file cycle: `apps/nextjs-boilerplate/src/components/atoms/Button.tsx -> apps/nextjs-boilerplate/src/components/atoms/Button.tsx`
- 1-file cycle: `apps/nextjs-boilerplate/src/components/atoms/Separator.tsx -> apps/nextjs-boilerplate/src/components/atoms/Separator.tsx`
- 1-file cycle: `apps/nextjs-boilerplate/src/components/molecules/Avatar.tsx -> apps/nextjs-boilerplate/src/components/molecules/Avatar.tsx`
- 1-file cycle: `apps/nextjs-boilerplate/src/components/molecules/Tabs.tsx -> apps/nextjs-boilerplate/src/components/molecules/Tabs.tsx`

## Communities (65 total, 21 thin omitted)

### Community 0 - "auth.ts"
Cohesion: 0.08
Nodes (37): GET(), GET(), GET(), env, logger, COOKIE_OPTIONS, SESSION_CONFIG, getOIDCClient() (+29 more)

### Community 1 - "errorHandler.ts"
Cohesion: 0.07
Nodes (38): env, logger, loggerPlugin(), AppError, errorHandler, captureError(), catchAsyncError(), mapToAppError() (+30 more)

### Community 2 - "cn"
Cohesion: 0.05
Nodes (61): Button(), buttonVariants, ButtonLink(), Input(), Label(), Separator(), Skeleton(), Spinner() (+53 more)

### Community 3 - "page.tsx"
Cohesion: 0.08
Nodes (34): DELETE(), PUT(), EditAccountPage(), metadata, AccountPage(), metadata, AuthorizedLayoutContent(), CreatePostPage() (+26 more)

### Community 4 - "correctness"
Cohesion: 0.04
Nodes (47): noAdjacentSpacesInRegex, noExtraBooleanCast, noUselessCatch, noUselessEscapeInRegex, noUselessTypeConstraint, noChildrenProp, noConstantCondition, noConstAssign (+39 more)

### Community 5 - "page.tsx"
Cohesion: 0.06
Nodes (38): GET(), DELETE(), GET(), POST(), GET(), GET(), GET(), GET() (+30 more)

### Community 6 - "ContactForm.tsx"
Cohesion: 0.14
Nodes (18): metadata, handleApiError(), ContactForm(), ContactFormConfig, ContactFormProps, FieldConfig, useContactActions(), ContactFormModel (+10 more)

### Community 7 - "devDependencies"
Cohesion: 0.05
Nodes (37): husky.sh script, devDependencies, @biomejs/biome, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, turbo (+29 more)

### Community 8 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, @aws-sdk/client-s3, @aws-sdk/client-secrets-manager, @aws-sdk/s3-request-presigner, @bogeychan/elysia-logger, @casl/ability, @casl/prisma, elysia (+26 more)

### Community 9 - "suspicious"
Cohesion: 0.06
Nodes (35): suspicious, noAsyncPromiseExecutor, noCatchAssign, noClassAssign, noCommentText, noCompareNegZero, noConstantBinaryExpressions, noControlCharactersInRegex (+27 more)

### Community 10 - "scripts"
Cohesion: 0.06
Nodes (31): dependencies, @neondatabase/serverless, @prisma/adapter-neon, @prisma/client, ws, devDependencies, prisma, @shared/typescript-config (+23 more)

### Community 11 - "dependencies"
Cohesion: 0.07
Nodes (30): dependencies, aws4fetch, @aws-sdk/client-cognito-identity-provider, @base-ui/react, @casl/ability, @casl/react, class-variance-authority, clsx (+22 more)

### Community 12 - "scripts"
Cohesion: 0.07
Nodes (28): engines, node, lint-staged, *.{ts,tsx,js,jsx,yml,yaml}, name, overrides, picomatch, packageManager (+20 more)

### Community 13 - "Boilerplate Template"
Cohesion: 0.07
Nodes (27): AI-Driven Development, Apps (`apps/`), Authorization & Storage, Backend, `backend-boilerplate`, Boilerplate Template, Build, Code Quality (+19 more)

### Community 14 - "post.model.ts"
Cohesion: 0.07
Nodes (21): ErrorCode, ErrorDefinition, Comment, CommentIdParams, CommentModel, CreateCommentBody, EmailModel, EmailUser (+13 more)

### Community 16 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib (+9 more)

### Community 17 - "useAccountActions.ts"
Cohesion: 0.05
Nodes (43): GlobalErrorProps, ActionButton(), FormCard(), FormField(), deleteUser(), updateUser(), uploadProfileImage(), AccountForm() (+35 more)

### Community 18 - "package.json"
Cohesion: 0.12
Nodes (15): dependencies, zod, devDependencies, @shared/typescript-config, @types/node, typescript, main, name (+7 more)

### Community 20 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, babel-plugin-react-compiler, pino-pretty, postcss, react-doctor, shadcn, @shared/typescript-config, tailwindcss (+5 more)

### Community 23 - "biome.json"
Cohesion: 0.18
Nodes (10): css, parser, files, ignoreUnknown, selfCloseVoidElements, html, formatter, overrides (+2 more)

### Community 24 - ".fallowrc.json"
Cohesion: 0.18
Nodes (10): duplicates, ignore, minOccurrences, mode, entry, ignoreDependencies, rules, $schema (+2 more)

### Community 25 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, module, outDir, paths, rootDir, exclude, extends, include (+1 more)

### Community 26 - "formatter"
Cohesion: 0.20
Nodes (10): formatter, enabled, expand, formatWithErrors, includes, indentStyle, indentWidth, lineEnding (+2 more)

### Community 27 - "formatter"
Cohesion: 0.20
Nodes (10): arrowParentheses, attributePosition, bracketSameLine, bracketSpacing, jsxQuoteStyle, quoteProperties, quoteStyle, semicolons (+2 more)

### Community 29 - "assist"
Cohesion: 0.22
Nodes (9): source, assist, actions, enabled, includes, groups, level, options (+1 more)

### Community 30 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, outDir, rootDir, target, exclude, extends, include

### Community 31 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, outDir, rootDir, target, exclude, extends, include

### Community 33 - "tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, paths, plugins, exclude, extends, include, @/*

### Community 34 - "CLAUDE.md"
Cohesion: 0.29
Nodes (5): Codebase graph, Commands, Context management, Rules, Tooling notes

### Community 35 - "release-please-config.json"
Cohesion: 0.29
Nodes (6): changelog-path, include-component-in-tag, include-v-in-tag, packages, release-type, $schema

### Community 36 - "package.json"
Cohesion: 0.33
Nodes (5): ignoreScripts, name, trustedDependencies, type, version

### Community 37 - "client.ts"
Cohesion: 0.40
Nodes (4): createPrismaClient(), getPrismaClient(), globalForPrisma, prisma

### Community 38 - "overrides"
Cohesion: 0.40
Nodes (5): overrides, fast-uri, hono, @hono/node-server, path-to-regexp

### Community 39 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, check-types, dev, doctor, start

### Community 40 - "package.json"
Cohesion: 0.40
Nodes (4): name, publishConfig, access, version

### Community 43 - "javascript"
Cohesion: 0.50
Nodes (4): javascript, globals, parser, unsafeParameterDecoratorsEnabled

### Community 44 - "organizeImports"
Cohesion: 0.50
Nodes (4): sortOrder, useSortedAttributes, level, options

### Community 45 - "vcs"
Cohesion: 0.50
Nodes (4): vcs, clientKind, enabled, useIgnoreFile

### Community 46 - "protect-env.sh"
Cohesion: 0.83
Nodes (3): is_allowlisted_env(), match(), protect-env.sh script

### Community 48 - "graphify"
Cohesion: 0.29
Nodes (7): PATH, bunx, graphify-mcp, graphify, next-devtools, playwright, @playwright/mcp

### Community 52 - "linter"
Cohesion: 0.67
Nodes (3): linter, enabled, includes

## Knowledge Gaps
- **462 isolated node(s):** `auto-format.sh script`, `paths`, `protect-bash.sh script`, `stop-typecheck.sh script`, `$schema` (+457 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `rules` connect `correctness` to `suspicious`, `linter`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `linter` connect `linter` to `correctness`, `biome.json`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `auto-format.sh script`, `paths`, `protect-bash.sh script` to the rest of the system?**
  _462 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08051948051948052 - nodes in this community are weakly interconnected._
- **Should `errorHandler.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07191780821917808 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.05216067009328003 - nodes in this community are weakly interconnected._