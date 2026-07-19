# Changelog

## [1.1.1](https://github.com/ahmax99/boilerplate-template/compare/v1.1.0...v1.1.1) (2026-07-19)


### Bug Fixes

* update release automation to use GitHub App authentication and document changes ([#130](https://github.com/ahmax99/boilerplate-template/issues/130)) ([1450460](https://github.com/ahmax99/boilerplate-template/commit/1450460e67186f4966063f54e89919f409312eda))
* update release-please job permissions to allow write access for contents ([#132](https://github.com/ahmax99/boilerplate-template/issues/132)) ([8816b34](https://github.com/ahmax99/boilerplate-template/commit/8816b347814a08bd8e548096048f09a292265325))

## [1.1.0](https://github.com/ahmax99/boilerplate-template/compare/v1.0.0...v1.1.0) (2026-07-19)


### Features

* add empty-state message to blog list page ([#94](https://github.com/ahmax99/boilerplate-template/issues/94)) ([5241224](https://github.com/ahmax99/boilerplate-template/commit/524122401cef7aa77f0f2b23360885b1ce0bc2d1))
* auto-delete Cognito user on account deletion ([#95](https://github.com/ahmax99/boilerplate-template/issues/95)) ([ce528fd](https://github.com/ahmax99/boilerplate-template/commit/ce528fd41f7e5ffac7a9cd42b811e3ccbf26eb5b))
* build once, deploy many — eliminate NEXT_PUBLIC envs ([#105](https://github.com/ahmax99/boilerplate-template/issues/105)) ([3c11b47](https://github.com/ahmax99/boilerplate-template/commit/3c11b478afaf0eae8b76462846e11d0fa40459d0))
* **ci:** multi-environment terraform pipeline (dev on merge, prod on tag) ([0d46cb4](https://github.com/ahmax99/boilerplate-template/commit/0d46cb4dc7b7ebba70be278c2d01aa8e887d6c89))
* **infra:** add terraform_plan and terraform_apply OIDC roles to github-oidc module ([412fd78](https://github.com/ahmax99/boilerplate-template/commit/412fd7863f8245507abbdb04593d0e1d6f2754e5))
* **infra:** harden prod deployment ([#121](https://github.com/ahmax99/boilerplate-template/issues/121)) ([7ffd6a8](https://github.com/ahmax99/boilerplate-template/commit/7ffd6a8dd1110c403299dce32395ad1bd903ec4c))
* **infra:** harden prod deployment ([#122](https://github.com/ahmax99/boilerplate-template/issues/122)) ([465c2c9](https://github.com/ahmax99/boilerplate-template/commit/465c2c9cf83fc60fbd3513d11260d9ff72a5e373))
* **infra:** make github-oidc terraform roles environment-aware (dev + prod) ([867672a](https://github.com/ahmax99/boilerplate-template/commit/867672a4b74ed97bf45d03e67de134648359223e))
* integrate graphify for persistent codebase knowledge graph ([b3e9a6a](https://github.com/ahmax99/boilerplate-template/commit/b3e9a6ab29e72c7616b543976e30ed00337b8ae9))
* redesign homepage as a boilerplate showcase and add admin post delete ([#80](https://github.com/ahmax99/boilerplate-template/issues/80)) ([f7c5bbb](https://github.com/ahmax99/boilerplate-template/commit/f7c5bbb43c6b9b7f8b7c3a84ab8bed1695dfb178))
* **workflows:** enhance auto-merge and security checks for PRs from specific branches ([6548864](https://github.com/ahmax99/boilerplate-template/commit/6548864448572cc576892ea69807faa261475915))


### Bug Fixes

* add central ECR account ID input for static assets deployment ([#127](https://github.com/ahmax99/boilerplate-template/issues/127)) ([cd6248d](https://github.com/ahmax99/boilerplate-template/commit/cd6248d1e70562a3b0fd45cfb2ab1a011f990add))
* add static assets bucket ID and policy for CloudFront access ([#129](https://github.com/ahmax99/boilerplate-template/issues/129)) ([775ab87](https://github.com/ahmax99/boilerplate-template/commit/775ab878e61d8035066d5b84b0abba7344d0dc39))
* authorize the Lambda@Edge signer role on the frontend Function URL ([#77](https://github.com/ahmax99/boilerplate-template/issues/77)) ([ea0d3db](https://github.com/ahmax99/boilerplate-template/commit/ea0d3dbc7760b41b04150b4e2f076768eb949bf0))
* **ci:** assume dedicated terraform roles, not the deploy role ([9f02800](https://github.com/ahmax99/boilerplate-template/commit/9f028002a18d00404ece7df0ec43cfdc60c50fc5))
* clarify homepage create-post CTA is admin-only ([#98](https://github.com/ahmax99/boilerplate-template/issues/98)) ([05f0a35](https://github.com/ahmax99/boilerplate-template/commit/05f0a35d0090511020b20e805eff5be6801619d4))
* downgrade @hono/node-server to version 1.19.11 in bun.lock ([5fb8a3a](https://github.com/ahmax99/boilerplate-template/commit/5fb8a3a507850fe5f093f7e8ff0d167296a5d6be))
* grant the Lambda@Edge signer lambda:InvokeFunction on the frontend Function URL ([#78](https://github.com/ahmax99/boilerplate-template/issues/78)) ([9bcdc3e](https://github.com/ahmax99/boilerplate-template/commit/9bcdc3e0ccde4a3c2fceb89e4eec4947a9bcba86))
* **infra:** exclude latest tag from ECR immutability ([f8fe32a](https://github.com/ahmax99/boilerplate-template/commit/f8fe32aeaf183b2cb7d283cb717b29c32f8b1857))
* **infra:** grant terraform_apply role logs:* account-wide ([f557057](https://github.com/ahmax99/boilerplate-template/commit/f5570571d6b97d80a34cd29025a5c12a7ad913be))
* keep frontend OAC as an unreferenced resource for one deploy cycle ([#75](https://github.com/ahmax99/boilerplate-template/issues/75)) ([22a507b](https://github.com/ahmax99/boilerplate-template/commit/22a507bcf8ea5080d784975d5a14da0899bd1f48))
* relabel account 'Accounts' tab as 'Danger Zone' ([#99](https://github.com/ahmax99/boilerplate-template/issues/99)) ([97a0ae7](https://github.com/ahmax99/boilerplate-template/commit/97a0ae7d605cc486be2e53cffc533a329f2b3ecd))
* remove the now-orphaned frontend CloudFront OAC ([#76](https://github.com/ahmax99/boilerplate-template/issues/76)) ([6d70ff8](https://github.com/ahmax99/boilerplate-template/commit/6d70ff80f793ed576bc720ca95e55a16e3989c7a))
* remove unused secrets from security.yml package-audit job ([#57](https://github.com/ahmax99/boilerplate-template/issues/57)) ([bb49590](https://github.com/ahmax99/boilerplate-template/commit/bb495909cb9e5c5be787bde0bb84db1c5f4ca392))
* restore graceful prepare when lefthook cannot install ([765afac](https://github.com/ahmax99/boilerplate-template/commit/765afac3a5b7ea741fd1af7d0c90807e747b5a6b))
* sign frontend Lambda origin requests with edge SigV4 to fix write failures ([#74](https://github.com/ahmax99/boilerplate-template/issues/74)) ([1cf3220](https://github.com/ahmax99/boilerplate-template/commit/1cf322019f179d377813362a80ac8c682e409695))
* specify repository in merge command for Dependabot major-version PRs ([2335b2e](https://github.com/ahmax99/boilerplate-template/commit/2335b2ef8cb8b740c0fab30aae45c8cccc2d116d))
* split PKCE state into its own cookie to stop login soft-lock ([#100](https://github.com/ahmax99/boilerplate-template/issues/100)) ([fe96dac](https://github.com/ahmax99/boilerplate-template/commit/fe96dacea86a322690675f6118ab62aff127eaae))
* stop custom --spacing-* tokens from shadowing Tailwind's max-w-*/w-* scale ([#86](https://github.com/ahmax99/boilerplate-template/issues/86)) ([df9c045](https://github.com/ahmax99/boilerplate-template/commit/df9c04519d6117d704212539295987e6ff3bed8f)), closes [#81](https://github.com/ahmax99/boilerplate-template/issues/81)
* stop tracking graphify-out/** in git ([#85](https://github.com/ahmax99/boilerplate-template/issues/85)) ([86ac2cc](https://github.com/ahmax99/boilerplate-template/commit/86ac2ccb8a86474960da62a26d080b959a992e7b))
* update conditions for commit linting and neon branch creation workflows ([d37c27d](https://github.com/ahmax99/boilerplate-template/commit/d37c27dbc7a77954f6cd59e6f39736e93a32c279))
* update ECR pull repository ARNs to include backend and frontend images ([#128](https://github.com/ahmax99/boilerplate-template/issues/128)) ([8022d9a](https://github.com/ahmax99/boilerplate-template/commit/8022d9a6d434b4ee4b1416d773d240464a8e9a01))
* update terraform local ([#123](https://github.com/ahmax99/boilerplate-template/issues/123)) ([ab124b8](https://github.com/ahmax99/boilerplate-template/commit/ab124b80a311fba044bfeb007c28de9549449dac))
* **workflows:** add conditional check for pull request events in setup job ([f29fb14](https://github.com/ahmax99/boilerplate-template/commit/f29fb144f930c32c96691d62a777efa201395b69))
* **workflows:** specify repository in auto-merge check for non-.github files ([217a602](https://github.com/ahmax99/boilerplate-template/commit/217a602a20ced19069f630ef01888a797a5175b8))

## Changelog

All notable changes to this project will be documented in this file.

This file is automatically maintained by [release-please](https://github.com/googleapis/release-please).
