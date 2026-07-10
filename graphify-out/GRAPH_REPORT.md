# Graph Report - wt-issue-79  (2026-07-10)

## Corpus Check
- 298 files · ~37,347 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1058 nodes · 1755 edges · 83 communities (57 shown, 26 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `924dae18`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_auth.ts|auth.ts]]
- [[_COMMUNITY_errorHandler.ts|errorHandler.ts]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_update-graph.sh|update-graph.sh]]
- [[_COMMUNITY_correctness|correctness]]
- [[_COMMUNITY_test_loop_progress.py|test_loop_progress.py]]
- [[_COMMUNITY_ContactForm.tsx|ContactForm.tsx]]
- [[_COMMUNITY_tasks|tasks]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_suspicious|suspicious]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_Boilerplate Template|Boilerplate Template]]
- [[_COMMUNITY_post.model.ts|post.model.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_withRequestLogging|withRequestLogging]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_requestLogging.ts|requestLogging.ts]]
- [[_COMMUNITY_useSortedAttributes|useSortedAttributes]]
- [[_COMMUNITY_biome.json|biome.json]]
- [[_COMMUNITY_.fallowrc.json|.fallowrc.json]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_formatter|formatter]]
- [[_COMMUNITY_formatter|formatter]]
- [[_COMMUNITY_test_verifiers.sh|test_verifiers.sh]]
- [[_COMMUNITY_assist|assist]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_bootstrap_labels.sh|bootstrap_labels.sh]]
- [[_COMMUNITY_tsconfig.json|tsconfig.json]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_release-please-config.json|release-please-config.json]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_client.ts|client.ts]]
- [[_COMMUNITY_overrides|overrides]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_verify_qa_gate.sh|verify_qa_gate.sh]]
- [[_COMMUNITY_javascript|javascript]]
- [[_COMMUNITY_verifier_template.sh|verifier_template.sh]]
- [[_COMMUNITY_vcs|vcs]]
- [[_COMMUNITY_protect-env.sh|protect-env.sh]]
- [[_COMMUNITY_session-start.sh|session-start.sh]]
- [[_COMMUNITY_.mcp.json|.mcp.json]]
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
- [[_COMMUNITY_verify_example.sh|verify_example.sh]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_useAccountActions.ts|useAccountActions.ts]]
- [[_COMMUNITY_CommentForm.tsx|CommentForm.tsx]]
- [[_COMMUNITY_AccountManagement.tsx|AccountManagement.tsx]]
- [[_COMMUNITY_env.ts|env.ts]]
- [[_COMMUNITY_ActionButton.tsx|ActionButton.tsx]]
- [[_COMMUNITY_CommentSection.tsx|CommentSection.tsx]]
- [[_COMMUNITY_useCommentActions.ts|useCommentActions.ts]]
- [[_COMMUNITY_AppError|AppError]]
- [[_COMMUNITY_session.ts|session.ts]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 53 edges
2. `suspicious` - 35 edges
3. `correctness` - 29 edges
4. `env` - 20 edges
5. `compilerOptions` - 16 edges
6. `getMe()` - 14 edges
7. `scripts` - 14 edges
8. `formatter` - 13 edges
9. `withRequestLogging()` - 12 edges
10. `PUBLIC_ROUTES` - 11 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  apps/nextjs-boilerplate/src/app/layout.tsx → apps/nextjs-boilerplate/src/utils/mergeClass.ts
- `FieldInput()` --calls--> `register()`  [INFERRED]
  apps/nextjs-boilerplate/src/features/account/client/components/AccountForm.tsx → apps/nextjs-boilerplate/src/instrumentation.ts
- `FieldInput()` --calls--> `register()`  [INFERRED]
  apps/nextjs-boilerplate/src/features/mailing/client/components/ContactForm.tsx → apps/nextjs-boilerplate/src/instrumentation.ts
- `FieldInput()` --calls--> `register()`  [INFERRED]
  apps/nextjs-boilerplate/src/features/post/client/components/PostForm.tsx → apps/nextjs-boilerplate/src/instrumentation.ts
- `EditAccountPage()` --calls--> `getMe()`  [EXTRACTED]
  apps/nextjs-boilerplate/src/app/(authorized)/account/edit/page.tsx → apps/nextjs-boilerplate/src/features/auth/server/api/index.ts

## Import Cycles
- 1-file cycle: `apps/nextjs-boilerplate/src/components/atoms/Button.tsx -> apps/nextjs-boilerplate/src/components/atoms/Button.tsx`
- 1-file cycle: `apps/nextjs-boilerplate/src/components/atoms/Separator.tsx -> apps/nextjs-boilerplate/src/components/atoms/Separator.tsx`
- 1-file cycle: `apps/nextjs-boilerplate/src/components/molecules/Avatar.tsx -> apps/nextjs-boilerplate/src/components/molecules/Avatar.tsx`
- 1-file cycle: `apps/nextjs-boilerplate/src/components/molecules/Tabs.tsx -> apps/nextjs-boilerplate/src/components/molecules/Tabs.tsx`

## Communities (83 total, 26 thin omitted)

### Community 0 - "auth.ts"
Cohesion: 0.15
Nodes (24): GET, GET, getOIDCClient(), AuthModel, CallbackParams, SessionData, createUser(), getValidTokenData() (+16 more)

### Community 1 - "errorHandler.ts"
Cohesion: 0.07
Nodes (38): env, logger, loggerPlugin(), AppError, errorHandler, captureError(), catchAsyncError(), mapToAppError() (+30 more)

### Community 2 - "cn"
Cohesion: 0.24
Nodes (11): Button(), buttonVariants, Input(), Spinner(), Textarea(), AlertDialogOverlay(), Avatar(), AvatarImage() (+3 more)

### Community 3 - "update-graph.sh"
Cohesion: 0.50
Nodes (3): GRAPHIFY_RUNNING, PATH, update-graph.sh script

### Community 4 - "correctness"
Cohesion: 0.04
Nodes (47): noAdjacentSpacesInRegex, noExtraBooleanCast, noUselessCatch, noUselessEscapeInRegex, noUselessTypeConstraint, noChildrenProp, noConstantCondition, noConstAssign (+39 more)

### Community 5 - "test_loop_progress.py"
Cohesion: 0.19
Nodes (5): blueprint_box(), _main(), phase_breadcrumb(), progress_bar(), _vwidth()

### Community 6 - "ContactForm.tsx"
Cohesion: 0.08
Nodes (30): GlobalErrorProps, metadata, OAuth2Start(), safeRelativePath(), useErrorHandler(), handleClientAuthError(), handleClientError(), mapToAppError() (+22 more)

### Community 7 - "tasks"
Cohesion: 0.08
Nodes (26): cache, dependsOn, env, inputs, outputs, dependsOn, cache, env (+18 more)

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
Cohesion: 0.06
Nodes (34): devDependencies, @biomejs/biome, @commitlint/cli, @commitlint/config-conventional, lefthook, turbo, typescript, engines (+26 more)

### Community 13 - "Boilerplate Template"
Cohesion: 0.07
Nodes (27): AI-Driven Development, Apps (`apps/`), Authorization & Storage, Backend, `backend-boilerplate`, Boilerplate Template, Build, Code Quality (+19 more)

### Community 14 - "post.model.ts"
Cohesion: 0.07
Nodes (21): ErrorCode, ErrorDefinition, Comment, CommentIdParams, CommentModel, CreateCommentBody, EmailModel, EmailUser (+13 more)

### Community 15 - "page.tsx"
Cohesion: 0.07
Nodes (35): EditAccountPage(), metadata, AccountPage(), metadata, AuthorizedLayoutContent(), CreatePostPage(), metadata, PublicLayoutContent() (+27 more)

### Community 16 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib (+9 more)

### Community 17 - "withRequestLogging"
Cohesion: 0.13
Nodes (14): GET, DELETE, PUT, GET, DELETE, GET, POST, deleteUser() (+6 more)

### Community 18 - "package.json"
Cohesion: 0.12
Nodes (15): dependencies, zod, devDependencies, @shared/typescript-config, @types/node, typescript, main, name (+7 more)

### Community 19 - "page.tsx"
Cohesion: 0.10
Nodes (24): DELETE, GET, GET, GET, POST, geistMono, geistSans, RootLayout() (+16 more)

### Community 20 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, babel-plugin-react-compiler, pino-pretty, postcss, shadcn, @shared/typescript-config, tailwindcss, @tailwindcss/postcss (+4 more)

### Community 21 - "requestLogging.ts"
Cohesion: 0.16
Nodes (11): GET, logger, fetchImage(), log, logAfterResponse(), logBeforeRequest(), RouteHandler, baseConfig (+3 more)

### Community 22 - "useSortedAttributes"
Cohesion: 0.50
Nodes (4): sortOrder, useSortedAttributes, level, options

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

### Community 45 - "vcs"
Cohesion: 0.50
Nodes (4): vcs, clientKind, enabled, useIgnoreFile

### Community 46 - "protect-env.sh"
Cohesion: 0.83
Nodes (3): is_allowlisted_env(), match(), protect-env.sh script

### Community 48 - ".mcp.json"
Cohesion: 0.22
Nodes (9): PATH, bunx, docker, graphify-mcp, graphify, next-devtools, playwright, terraform (+1 more)

### Community 52 - "linter"
Cohesion: 0.67
Nodes (3): linter, enabled, includes

### Community 72 - "index.ts"
Cohesion: 0.15
Nodes (5): Separator(), Skeleton(), CommentSection(), PostDetail(), PostDetailProps

### Community 73 - "useAccountActions.ts"
Cohesion: 0.09
Nodes (26): FormCard(), FormField(), deleteUser(), fetchProfileImage(), updateUser(), uploadProfileImage(), AccountFormConfig, AccountFormProps (+18 more)

### Community 74 - "CommentForm.tsx"
Cohesion: 0.20
Nodes (13): Label(), dedupeErrorMessages(), Field(), FieldContent(), FieldError(), FieldErrorItem, FieldLabel(), FieldTitle() (+5 more)

### Community 75 - "AccountManagement.tsx"
Cohesion: 0.18
Nodes (10): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), DeleteAccountButton(), useAccountActions(), ActionResult (+2 more)

### Community 76 - "env.ts"
Cohesion: 0.22
Nodes (8): env, FieldInput(), FieldInput(), FieldInput(), register(), cognitoClient, extends, $schema

### Community 77 - "ActionButton.tsx"
Cohesion: 0.32
Nodes (10): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+2 more)

### Community 78 - "CommentSection.tsx"
Cohesion: 0.26
Nodes (9): Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), FormCardProps, CommentSectionProps (+1 more)

### Community 79 - "useCommentActions.ts"
Cohesion: 0.22
Nodes (10): ActionButton(), createComment(), deleteComment(), CommentForm(), CommentFormConfig, DeleteCommentButton(), DeleteCommentButtonProps, useCommentActions() (+2 more)

### Community 80 - "AppError"
Cohesion: 0.38
Nodes (4): ERROR_DISPLAY, ErrorStore, useErrorStore, AppError

### Community 82 - "compilerOptions"
Cohesion: 0.50
Nodes (4): compilerOptions, allowJs, jsx, noEmit

## Knowledge Gaps
- **487 isolated node(s):** `auto-format.sh script`, `paths`, `protect-bash.sh script`, `stop-typecheck.sh script`, `bootstrap_labels.sh script` (+482 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `env` connect `env.ts` to `auth.ts`, `ContactForm.tsx`, `useAccountActions.ts`, `CommentSection.tsx`, `AppError`, `session.ts`, `page.tsx`, `requestLogging.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `rules` connect `correctness` to `suspicious`, `linter`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `index.ts`, `CommentForm.tsx`, `AccountManagement.tsx`, `ActionButton.tsx`, `CommentSection.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `auto-format.sh script`, `paths`, `protect-bash.sh script` to the rest of the system?**
  _487 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `errorHandler.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07191780821917808 - nodes in this community are weakly interconnected._
- **Should `correctness` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `ContactForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07529411764705882 - nodes in this community are weakly interconnected._