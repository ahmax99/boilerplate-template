### Remote Caching

#### What is Remote Caching?

Remote Caching allows your team to share build outputs across different machines. Instead of rebuilding the same code multiple times, Turborepo stores the results in a shared cache that everyone can access.

#### Why Use It?

- **Faster builds:** Skip rebuilding code that someone else already built
- **Save CI/CD time:** GitHub Actions can reuse builds from your local machine or other PRs
- **Team efficiency:** If a teammate built something, you get instant results

#### How It Works

1. **First build:** You run `turbo build` → Turborepo builds your code and uploads the result to the remote cache
2. **Next build:** Your teammate runs `turbo build` → Turborepo finds the cached result and skips rebuilding (takes seconds instead of minutes)
3. **CI/CD:** GitHub Actions checks the cache before building, saving time and resources

#### Setup for Team Members

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

**Step 1: Create TURBO_TOKEN**

Go to [Vercel](https://vercel.com/account/settings/tokens) and create a new token with Full Account scope.

**Step 2: Login to Vercel**

```bash
npx turbo login
```
This opens your browser to authenticate with Vercel.

**Step 3: Link to Remote Cache**

```bash
npx turbo link
```

Select the team and project when prompted. That's it! You're now sharing cache with the team.

**Step 4: Verify it's working**

```bash
npx turbo build
```

First time: Normal build time
Second time: Should see `>>> FULL TURBO` and complete in seconds

#### CI/CD Setup (Already Configured)

Our GitHub Actions workflow is already configured with remote caching. It uses:

- `TURBO_TOKEN`: Secret token for authentication (configured in GitHub Secrets)
- `TURBO_TEAM`: Your Vercel team slug (configured in GitHub Variables)

No additional setup needed for CI/CD! Every PR automatically benefits from remote caching.

#### Troubleshooting

**Not seeing cache hits?**

- Make sure you ran `turbo login` and `turbo link`
- Check that you're on the correct Vercel team
- Verify `TURBO_TOKEN` and `TURBO_TEAM` are set in GitHub repository settings

**Want to force a fresh build?**

```bash
npx turbo build --force
```

This bypasses the cache and rebuilds everything.

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
