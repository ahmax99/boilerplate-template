# Changelog

## [1.1.0](https://github.com/ahmax99/boilerplate-template/compare/v1.0.0...v1.1.0) (2026-06-13)


### Features

* add auto-merge workflow for Dependabot PRs and update default deploy environment to dev ([cf0548d](https://github.com/ahmax99/boilerplate-template/commit/cf0548de43cb66ba4975e7b022dcb498a52c445f))
* add detect-affected action and script for determining affected apps during deployment ([52b88eb](https://github.com/ahmax99/boilerplate-template/commit/52b88eb20bfa2d05a3c75a85017c08b44d44c764))
* **branch:** implement action to delete merged branches with protection checks ([5af68fa](https://github.com/ahmax99/boilerplate-template/commit/5af68fa8b608a0e276caa37c6a6d60b44c671016))
* **images:** enhance image fetching with proper content type and caching headers ([6bc8c90](https://github.com/ahmax99/boilerplate-template/commit/6bc8c90720d754985c570e68b6f94f458bfb2573))
* **images:** refactor image fetching API and update routes for profile and post images ([d4bcac0](https://github.com/ahmax99/boilerplate-template/commit/d4bcac0ee092dc5f6336c8e48a598fc40479c972))
* **images:** refactor image fetching logic and introduce new API routes for profile and post images ([fd4e407](https://github.com/ahmax99/boilerplate-template/commit/fd4e40724c6a6fc535970b7fb65d51caf8cee4d6))
* **logging:** integrate pino for structured logging and update image URL handling ([3698657](https://github.com/ahmax99/boilerplate-template/commit/3698657a4cd65039b2e53fe5f99a55e7edbcb2f0))


### Bug Fixes

* add ECR login to deploy-static-assets action ([b95c9ba](https://github.com/ahmax99/boilerplate-template/commit/b95c9ba1d456366252025dbabb506caf98dcdb8c))
* **auth:** grant Cognito admin perms; replace hand-rolled SigV4 with aws4fetch ([946fe0f](https://github.com/ahmax99/boilerplate-template/commit/946fe0f174fcbbce8b660f6fe1a9b65e6ffe7df6))
* **auth:** prevent Next.js prefetch from triggering logout on load ([d3eebf2](https://github.com/ahmax99/boilerplate-template/commit/d3eebf2f06b575abb2bfce8fd030a007c3d6f962))
* **auth:** replace server action logout with GET route navigation ([eb8a9f7](https://github.com/ahmax99/boilerplate-template/commit/eb8a9f749ee41a261479343c98b97034059821d9))
* handle case when no affected packages are found to skip deployment ([fb50831](https://github.com/ahmax99/boilerplate-template/commit/fb5083170811ec94ed566f7871bb18d921a0d76a))
* **iam:** grant lambda:InvokeFunction in addition to InvokeFunctionUrl for SSR-to-backend calls ([8c61d90](https://github.com/ahmax99/boilerplate-template/commit/8c61d908a371e596cd54b6dd75ff922baf2ed8e9))
* **sigv4:** sign host header and use X-Id-Token to avoid Authorization clash ([1560a4c](https://github.com/ahmax99/boilerplate-template/commit/1560a4c548752d79fe2df1855e6d99754a6ea2d1))

## Changelog

All notable changes to this project will be documented in this file.

This file is automatically maintained by [release-please](https://github.com/googleapis/release-please).
