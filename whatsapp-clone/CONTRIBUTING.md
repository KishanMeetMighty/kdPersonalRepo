# Contributing to WhatsApp Clone

We love your input! We want to make contributing to WhatsApp Clone as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. **Fork the repo** and create your branch from `main`.
2. **If you've added code** that should be tested, add tests.
3. **If you've changed APIs**, update the documentation.
4. **Ensure the test suite passes**.
5. **Make sure your code lints**.
6. **Issue that pull request**!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/your-username/whatsapp-clone/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/your-username/whatsapp-clone/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

### Backend Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/whatsapp-clone.git
   cd whatsapp-clone/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Mobile App Development

1. **Navigate to mobile directory**
   ```bash
   cd whatsapp-clone/mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

## Code Style

### Backend (Node.js)
- Use **ES6+** features
- Follow **ESLint** configuration
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Add **JSDoc** comments for functions

### Mobile (Flutter/Dart)
- Follow **Dart** style guide
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **snake_case** for file names
- Add **documentation comments** for public APIs

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Mobile Testing
```bash
cd mobile
flutter test
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that do not affect the meaning of the code
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools

**Examples:**
```
feat: add message reactions functionality
fix: resolve socket connection timeout issue
docs: update API documentation for chat endpoints
```

## Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Provide detailed description** of the feature
3. **Explain the use case** and why it would be valuable
4. **Consider the scope** - is it a breaking change?

## Code Review Process

1. **All submissions** require review before merging
2. **Maintainers** will review your PR within 48 hours
3. **Address feedback** promptly to keep the PR active
4. **Squash commits** before merging if requested

## Community Guidelines

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Stay on topic** in discussions
- **Follow the code of conduct**

## Getting Help

- **Documentation**: Check the README and docs
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server

## Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **Special thanks** in project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to WhatsApp Clone! 🚀