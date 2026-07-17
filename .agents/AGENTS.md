# Project Specific Rules

- **Changelog Rule**: After making any significant code changes, features, or bug fixes, you MUST document those changes in the `d:\Holiday\update.md` file using markdown format. Include the date and a brief summary of the files modified and the logic added.
- **File Preservation Rule**: NEVER delete any files from the workspace, even if they seem messy, outdated, or unused. Keep everything intact unless the user EXPLICITLY requests a file deletion.
- **Best Recommendation Rule**: Whenever analyzing options or presenting choices to the user, you MUST always conclude by explicitly recommending the "best" option based on the project's specific context and constraints.
- **Production-Ready Mindset Rule**: Always aim for production-level quality in both code and user experience (UX). When implementing features, consider edge cases, performance, error handling, loading states (like using toasts or skeletons), and scalable architecture. Proactively offer practical, production-level advice rather than settling for a "working MVP".
- **Strict Validation Rule**: Always prioritize correctness. Every input from the user must be validated carefully and strictly, "thừa hơn thiếu, phòng hơn chữa" (better safe than sorry).
- **SOLID Architecture Rule**: Always apply SOLID principles in both Server and Client code. Separate concerns (SRP) by extracting API calls, WebSocket handling, UI logic into separate components/hooks/services. Use dependency inversion, interfaces, and open/closed principles where applicable to ensure maintainable and scalable code.

- **Zero Warning Rule (OCD)**: The user is extremely strict about clean code and modern standards (OCD level). You MUST proactively eliminate all IDE warnings, yellow/red highlights, lint errors, and unresolved properties in both server and client code. Do not leave dead code or unused imports behind.

- **Clean Imports Rule**: NEVER use Fully Qualified Class Names (FQCN) (e.g. java.util.List, org.springframework.context.annotation.Bean) inside the code body. ALWAYS import the classes at the top of the file and use their simple names in the code.
