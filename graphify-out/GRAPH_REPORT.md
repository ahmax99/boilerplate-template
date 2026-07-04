# Graph Report - boilerplate-template  (2026-07-04)

## Corpus Check
- 299 files · ~34,859 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1017 nodes · 1684 edges · 78 communities (57 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `223d7ffa`
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
- [[_COMMUNITY_organizeImports|organizeImports]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_useAccountActions.ts|useAccountActions.ts]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_PageHeader.tsx|PageHeader.tsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_CommentForm.tsx|CommentForm.tsx]]
- [[_COMMUNITY_useAccountActions.ts|useAccountActions.ts]]
- [[_COMMUNITY_biome.json|biome.json]]
- [[_COMMUNITY_.fallowrc.json|.fallowrc.json]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_formatter|formatter]]
- [[_COMMUNITY_formatter|formatter]]
- [[_COMMUNITY_rules|rules]]
- [[_COMMUNITY_assist|assist]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_page.tsx|page.tsx]]
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
- [[_COMMUNITY_AuthActionButton.tsx|AuthActionButton.tsx]]
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
- [[_COMMUNITY_PostForm.tsx|PostForm.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_AccountForm.tsx|AccountForm.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_style|style]]
- [[_COMMUNITY_useSortedAttributes|useSortedAttributes]]

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

## Communities (78 total, 21 thin omitted)

### Community 0 - "auth.ts"
Cohesion: 0.05
Nodes (51): GET(), GET(), GET(), GET(), geistMono, geistSans, RootLayout(), env (+43 more)

### Community 1 - "errorHandler.ts"
Cohesion: 0.07
Nodes (38): env, logger, loggerPlugin(), AppError, errorHandler, captureError(), catchAsyncError(), mapToAppError() (+30 more)

### Community 2 - "cn"
Cohesion: 0.07
Nodes (43): Button(), buttonVariants, ButtonLink(), Input(), Label(), Separator(), Skeleton(), Spinner() (+35 more)

### Community 3 - "page.tsx"
Cohesion: 0.22
Nodes (9): EditAccountPage(), metadata, AccountPage(), metadata, CreatePostPage(), metadata, PageTemplate(), PageTemplateProps (+1 more)

### Community 4 - "correctness"
Cohesion: 0.07
Nodes (29): noChildrenProp, noConstantCondition, noConstAssign, noEmptyCharacterClassInRegex, noEmptyPattern, noGlobalObjectCalls, noInvalidBuiltinInstantiation, noInvalidConstructorSuper (+21 more)

### Community 5 - "page.tsx"
Cohesion: 0.23
Nodes (10): GET(), GET(), POST(), metadata, PostsListPage(), createPostServer(), fetchAllPosts(), fetchPreSignedUrl() (+2 more)

### Community 6 - "ContactForm.tsx"
Cohesion: 0.08
Nodes (29): GlobalErrorProps, metadata, ERROR_DISPLAY, handleClientAuthError(), handleClientError(), ErrorStore, useErrorStore, AppError (+21 more)

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

### Community 15 - "organizeImports"
Cohesion: 0.23
Nodes (9): AuthorizedLayoutContent(), PublicLayoutContent(), PageHeader(), AbilityProvider(), getUserPermissions(), ErrorScreenProvider(), Action, AppAbility (+1 more)

### Community 16 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib (+9 more)

### Community 17 - "useAccountActions.ts"
Cohesion: 0.26
Nodes (10): dedupeErrorMessages(), Field(), FieldContent(), FieldError(), FieldErrorItem, FieldLabel(), FieldTitle(), fieldVariants (+2 more)

### Community 18 - "package.json"
Cohesion: 0.12
Nodes (15): dependencies, zod, devDependencies, @shared/typescript-config, @types/node, typescript, main, name (+7 more)

### Community 19 - "PageHeader.tsx"
Cohesion: 0.24
Nodes (9): Logo(), PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES, PUBLIC_ROUTES, LogoutButton(), config, isProtectedPath(), protectedPaths (+1 more)

### Community 20 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, babel-plugin-react-compiler, pino-pretty, postcss, react-doctor, shadcn, @shared/typescript-config, tailwindcss (+5 more)

### Community 21 - "CommentForm.tsx"
Cohesion: 0.29
Nodes (9): createComment(), deleteComment(), CommentFieldConfig, CommentForm(), CommentFormProps, useCommentActions(), CommentFormModel, CreateCommentSchema (+1 more)

### Community 22 - "useAccountActions.ts"
Cohesion: 0.29
Nodes (6): deleteUser(), updateUser(), uploadProfileImage(), createPostClient(), uploadImage(), apiClient

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

### Community 28 - "rules"
Cohesion: 0.17
Nodes (12): noAdjacentSpacesInRegex, noExtraBooleanCast, noUselessCatch, noUselessEscapeInRegex, noUselessTypeConstraint, rules, useSortedClasses, complexity (+4 more)

### Community 29 - "assist"
Cohesion: 0.22
Nodes (9): source, assist, actions, enabled, includes, groups, level, options (+1 more)

### Community 30 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, outDir, rootDir, target, exclude, extends, include

### Community 31 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, outDir, rootDir, target, exclude, extends, include

### Community 32 - "page.tsx"
Cohesion: 0.29
Nodes (8): GET(), generateMetadata(), PostDetailPage(), PostDetailPageProps, generatePageMetadata(), GeneratePageMetadataProps, fetchPostImage(), fetchPost()

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

### Community 42 - "page.tsx"
Cohesion: 0.22
Nodes (7): CommentFormConfig, DeleteCommentButton(), DeleteCommentButtonProps, CommentSection(), CommentSectionProps, PostDetail(), PostDetailProps

### Community 43 - "javascript"
Cohesion: 0.50
Nodes (4): javascript, globals, parser, unsafeParameterDecoratorsEnabled

### Community 44 - "AuthActionButton.tsx"
Cohesion: 0.24
Nodes (7): ActionButton(), AccountForm(), DeleteAccountButton(), useAccountActions(), ActionResult, AuthActionButton(), AuthActionButtonProps

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

### Community 71 - "PostForm.tsx"
Cohesion: 0.27
Nodes (8): FieldConfig, PostForm(), PostFormConfig, PostFormProps, PostFormSchema, usePostActions(), CreatePostSchema, PostFormModel

### Community 72 - "route.ts"
Cohesion: 0.39
Nodes (6): GET(), DELETE(), PUT(), deleteUser(), fetchPresignedUrl(), updateUser()

### Community 73 - "index.ts"
Cohesion: 0.39
Nodes (6): DELETE(), GET(), POST(), createComment(), deleteComment(), fetchAllComments()

### Community 74 - "AccountForm.tsx"
Cohesion: 0.31
Nodes (7): FormCard(), FormField(), AccountFormConfig, AccountFormProps, FieldConfig, AccountFormModel, UpdateProfileSchema

### Community 76 - "style"
Cohesion: 0.33
Nodes (6): style, noCommonJs, noNamespace, useArrayLiterals, useAsConstAssertion, useBlockStatements

### Community 77 - "useSortedAttributes"
Cohesion: 0.50
Nodes (4): sortOrder, useSortedAttributes, level, options

## Knowledge Gaps
- **462 isolated node(s):** `auto-format.sh script`, `paths`, `protect-bash.sh script`, `stop-typecheck.sh script`, `$schema` (+457 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `auth.ts`, `useAccountActions.ts`, `page.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `env` connect `auth.ts` to `page.tsx`, `useAccountActions.ts`, `ContactForm.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `rules` connect `rules` to `suspicious`, `linter`, `correctness`, `style`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `auto-format.sh script`, `paths`, `protect-bash.sh script` to the rest of the system?**
  _462 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050949367088607596 - nodes in this community are weakly interconnected._
- **Should `errorHandler.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07191780821917808 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.06783511846802986 - nodes in this community are weakly interconnected._