# Changelog

## [1.1.0](https://github.com/ahmax99/boilerplate-template/compare/v1.0.0...v1.1.0) (2026-07-02)


### Features

* **ci:** multi-environment terraform pipeline (dev on merge, prod on tag) ([0d46cb4](https://github.com/ahmax99/boilerplate-template/commit/0d46cb4dc7b7ebba70be278c2d01aa8e887d6c89))
* **infra:** add terraform_plan and terraform_apply OIDC roles to github-oidc module ([412fd78](https://github.com/ahmax99/boilerplate-template/commit/412fd7863f8245507abbdb04593d0e1d6f2754e5))
* **infra:** make github-oidc terraform roles environment-aware (dev + prod) ([867672a](https://github.com/ahmax99/boilerplate-template/commit/867672a4b74ed97bf45d03e67de134648359223e))
* **workflows:** enhance auto-merge and security checks for PRs from specific branches ([6548864](https://github.com/ahmax99/boilerplate-template/commit/6548864448572cc576892ea69807faa261475915))


### Bug Fixes

* downgrade @hono/node-server to version 1.19.11 in bun.lock ([5fb8a3a](https://github.com/ahmax99/boilerplate-template/commit/5fb8a3a507850fe5f093f7e8ff0d167296a5d6be))
* **workflows:** add conditional check for pull request events in setup job ([f29fb14](https://github.com/ahmax99/boilerplate-template/commit/f29fb144f930c32c96691d62a777efa201395b69))
* **workflows:** specify repository in auto-merge check for non-.github files ([217a602](https://github.com/ahmax99/boilerplate-template/commit/217a602a20ced19069f630ef01888a797a5175b8))

## Changelog

All notable changes to this project will be documented in this file.

This file is automatically maintained by [release-please](https://github.com/googleapis/release-please).
