# Contributing to ShopApp

First off, thank you for considering contributing to ShopApp! It's people like you that make this showcase project a great reference for Senior React Native patterns.

## Development Workflow

1. **Fork & Clone**: Fork the repository and clone it to your local machine.
2. **Install Dependencies**: Run `npm install` and `cd ios && pod install && cd ..`.
3. **Branch Naming**: We follow a strict branching convention:
   - `feature/your-feature-name`
   - `fix/your-bug-fix`
   - `refactor/your-refactor`
4. **Code Quality**: Ensure your code passes all linting (`npm run lint`) and TypeScript checks (`npx tsc --noEmit`).
5. **Testing**: Add or update Jest unit tests. Ensure `npm test` passes.
6. **Pull Request**: Open a PR using our provided template. Ensure you check off the DSGVO/Accessibility checkboxes if applicable.

## Architecture

Please review `docs/ARCHITECTURE.md` before making sweeping changes to the state management or offline-sync mechanisms.

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance (deps, etc.)

## German DACH Market Focus

When adding new UI features, please remember:
1. Ensure strings are properly internationalized (`i18n`) for both `en` and `de`.
2. Do not introduce tracking without checking the `PrivacyModal` consent hooks.
