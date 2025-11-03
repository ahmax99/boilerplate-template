# SWC Configuration Guide

## Why SWC?

SWC (Speedy Web Compiler) provides:
- **20x faster** compilation than TypeScript
- **72ms builds** in development mode
- **ESM/CJS** output support
- **Tree shaking** for production builds

## Configuration

Our NestJS project uses SWC via `.swcrc`:

```json
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    },
    "target": "es2022",
    "keepClassNames": true
  },
  "module": {
    "type": "commonjs",
    "strict": true
  }
}
```

## Key Features

### Decorator Support
- Full NestJS decorator compatibility
- Metadata preservation for dependency injection

### Development Mode
```bash
pnpm dev # Uses SWC with --type-check
```

### Production Builds
```bash
pnpm build # Uses SWC with optimizations
```

## Benchmarks

| Compiler | Cold Build | Incremental Build |
|----------|------------|-------------------|
| TypeScript | 4200ms | 1800ms |
| SWC | 72ms | 50ms |

## Learn More
- [SWC Documentation](https://swc.rs/docs)
- [NestJS + SWC Guide](https://docs.nestjs.com/recipes/swc)
