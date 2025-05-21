# Project Naming & Coding Standards

## 1. General Principles
- **Clarity & Consistency:** All names should be descriptive, concise, and consistent across the codebase.
- **English Only:** Use English for all code, comments, and documentation.
- **No Abbreviations:** Avoid non-standard abbreviations unless industry-accepted.
- **Case Sensitivity:** Follow case conventions strictly (see below).

---

## 2. File & Folder Naming
- **React Components:** `PascalCase` (e.g., `UserProfile.tsx`)
- **Utility/Helper Files:** `camelCase` or `kebab-case` (e.g., `dateUtils.ts`, `api-client.ts`)
- **CSS/Styles:** `kebab-case` (e.g., `main-layout.css`)
- **Folders:** `kebab-case` (e.g., `designer/`, `contexts/`, `services/`)
- **Test Files:** Match the file under test, with `.test.tsx` or `.spec.tsx` suffix.

---

## 3. Variable Naming
- **Variables:** `camelCase` (e.g., `userName`, `isLoading`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_ATTEMPTS`)
- **React State:** `camelCase` with `set` prefix for setters (e.g., `user, setUser`)
- **Booleans:** Prefix with `is`, `has`, `can`, `should` (e.g., `isActive`, `hasPermission`)

---

## 4. Function & Method Naming
- **Functions:** `camelCase` (e.g., `fetchUserData`)
- **Event Handlers:** Prefix with `handle` (e.g., `handleSubmit`, `handleInputChange`)
- **React Hooks:** Prefix with `use` (e.g., `useAuth`, `useFetchData`)
- **Async Functions:** Suffix with `Async` (e.g., `fetchDataAsync`)

---

## 5. Class & Interface Naming
- **Classes/Interfaces/Types:** `PascalCase` (e.g., `UserProfile`, `QuestionnaireContext`)
- **Enums:** `PascalCase` for enum name, `UPPER_SNAKE_CASE` for values.

---

## 6. Component Naming (React)
- **Component Files:** One component per file, named after the component.
- **Component Names:** `PascalCase` (e.g., `QuestionnaireDesigner`)
- **Props:** Use `PascalCase` for interface, `camelCase` for prop names.
- **Children:** Use `children` as prop for nested content.

---

## 7. CSS & Tailwind Naming
- **CSS Classes:** `kebab-case` (e.g., `main-header`, `form-section`)
- **Tailwind:** Use utility classes in JSX; avoid custom classes unless necessary.
- **Custom CSS:** Place in `index.css` or component-specific CSS files.
- **No Inline Styles:** Prefer Tailwind or CSS modules over inline styles.

---

## 8. Additional Guidelines
Please refer to the following detailed guidelines documents:

1. **Architecture & Project Structure:** See `ARCHITECTURE_GUIDELINES.md`
2. **Code Writing Style:** See `CODE_STYLE_GUIDELINES.md`
3. **Feature Development:** See `FEATURE_DEVELOPMENT_GUIDELINES.md`

These documents contain comprehensive information about their respective topics and should be consulted when working on the project.

---

## 14. Example Naming Table
| Element         | Convention         | Example                      |
|-----------------|-------------------|------------------------------|
| Component       | PascalCase        | `UserProfile.tsx`            |
| Variable        | camelCase         | `userName`                   |
| Constant        | UPPER_SNAKE_CASE  | `MAX_ATTEMPTS`               |
| Function        | camelCase         | `fetchUserData`              |
| Class/Interface | PascalCase        | `UserProfile`                |
| Enum            | PascalCase/UPPER  | `ControlType.Numeric`        |
| CSS Class       | kebab-case        | `main-header`                |
| Folder          | kebab-case        | `designer/`                  |

---

_This standard is mandatory for all contributors. For questions, contact the project maintainer: BRG
