# Contributing to AI Maturity Assessment

Thank you for considering contributing to the AI Maturity Assessment application! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please help keep this project open and inclusive. By participating, you agree to:

- Be respectful and considerate in your communication
- Accept constructive criticism gracefully
- Focus on what is best for the community and project
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports:

1. Check the issue tracker to see if the problem has already been reported
2. Ensure you're using the latest version of the application
3. Collect relevant information about the issue (browser, OS, steps to reproduce)

When reporting a bug, please include:

- A clear and descriptive title
- Detailed steps to reproduce the behavior
- Expected behavior versus actual behavior
- Screenshots if applicable
- Any relevant console logs or errors

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear and detailed description of the proposed feature
- Explanation of why this feature would be useful to most users
- Possible implementation details if you have them

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (if available) and ensure the code lints
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Process

### Setup

Follow the [Setup Guide](docs/setup-guide.md) to get your development environment ready.

### Coding Standards

#### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow the existing code style (indentation, spacing, naming)
- Use ES6+ features where appropriate
- Include proper type annotations

#### React Components

- Use functional components with hooks rather than class components
- Keep components focused on a single responsibility
- Use appropriate component organization (UI vs. feature components)
- Document props with appropriate types

#### Styling

- Use Tailwind CSS for styling components
- Follow the BEM (Block Element Modifier) naming convention for custom CSS
- Use responsive design principles

### Commit Messages

- Use clear, descriptive commit messages
- Begin with a short summary (50 chars or less)
- Reference issues and pull requests when relevant

Example:
```
Add voice input functionality for assessment questions

- Implement VoiceRecorder component
- Add OpenAI Whisper integration for transcription
- Handle browser permissions for microphone
- Add visual feedback during recording

Fixes #42
```

### Testing

- Write tests for new functionality when applicable
- Ensure existing tests pass before submitting a pull request
- Test across different browsers and devices

## Documentation

- Update documentation when adding or changing features
- Use clear, concise language
- Include code examples where helpful
- Check for spelling and grammar

## Review Process

After you submit your pull request:

1. The maintainers will review your changes
2. You may be asked to make adjustments
3. Once approved, your changes will be merged

## License

By contributing to this project, you agree that your contributions will be licensed under the project's license.

## Questions?

If you have any questions or need help, please:

- Open an issue with your question
- Contact the project maintainers directly

Thank you for contributing to make the AI Maturity Assessment better!
