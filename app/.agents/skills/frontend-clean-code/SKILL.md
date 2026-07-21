---
name: frontend-clean-code
description: Clean code conventions for this project's frontend. Covers file separation (types, constants, hooks, utilities), SCREAM architecture folder structure, prohibition of `any`, and React patterns for maintainable Next.js code.
---

# Frontend Clean Code

## Core Rules

### 1. No `any`
Never use `type any`. Every value must have an explicit TypeScript type or interface. If you're unsure of the type, create an interface or use proper generics.

```typescript
// BAD
function handleSubmit(e: any) { ... }
const [data, setData] = useState<any>(null);

// GOOD
function handleSubmit(e: React.FormEvent<HTMLFormElement>) { ... }
const [data, setData] = useState<Project | null>(null);
```

### 2. Event Handlers
Always use the correct React synthetic event type:

```typescript
// GOOD
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) { ... }
function handleChange(e: React.ChangeEvent<HTMLInputElement>) { ... }
function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) { ... }
```

Never use `any` for event parameters.

## File Separation

Every feature folder follows this structure:

```
app/[feature]/
├── page.tsx             # SSR - no 'use client'
├── components/          # JSX/UI components (thin, presentation-only)
│   ├── FeatureForm.tsx
│   └── index.ts
├── hooks/               # Custom React hooks (logic + state management)
│   └── useFeatureForm.ts
├── types.ts             # All TypeScript types/interfaces for the feature
├── constants.ts          # Const values, maps, magic strings
└── utils/               # Pure utility/helper functions
```

### What goes where

| Concern | File | Example |
|---|---|---|
| Types & interfaces | `types.ts` | `FormState`, `FormAction`, `Project` |
| Const values & maps | `constants.ts` | `AUDIENCE_MAP`, `BACKEND_URL`, `INITIAL_STATE` |
| Logic + side effects | `hooks/use*.ts` | API calls, auth, form validation, state management |
| JSX/presentation | `components/*.tsx` | Should be thin — reads from hook return, dispatches actions |
| Pure helpers | `utils/*.ts` | String formatting, date parsing, validation functions |

### Component rules

- Components are **thin**: they only render JSX and wire props/events from the hook.
- All business logic (fetch, submit, validation) lives in the custom hook.
- Components should not contain `useState`, `useEffect`, or complex logic — delegate to the hook.

```typescript
// components/FeatureForm.tsx — GOOD: thin component
export function FeatureForm() {
  const { state, dispatch, handleSubmit } = useFeatureForm();

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.name}
        onChange={(e) => dispatch({ type: "SET_NAME", payload: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## State Management

### useReducer over multiple useState
When a component needs 3+ related state fields, use `useReducer` with a single state object instead of multiple `useState` calls.

```typescript
// BAD — scattered state
const [message, setMessage] = useState("");
const [file, setFile] = useState<File | null>(null);
const [submitting, setSubmitting] = useState(false);

// GOOD — unified reducer
interface FormState {
  message: string;
  file: File | null;
  submitting: boolean;
  error: string | null;
}

type FormAction =
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_FILE"; payload: File | null }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    // ... one reducer to rule them all
  }
}
```

## SCREAM Architecture

Each page owns its folder with everything it needs:

```
app/[page]/
├── page.tsx             # Server component (no 'use client')
├── components/          # Page-specific components
├── actions.ts           # Server actions (when applicable)
├── hooks/               # Custom React hooks
├── types.ts             # Page-specific types
├── constants.ts         # Page-specific constants
└── utils/               # Page-specific utilities
```

Shared code across pages goes to `lib/`:

```
lib/
├── components/ui/       # Reusable UI primitives
├── hooks/               # Shared hooks
├── utils/               # Shared utilities
└── auth/                # Auth config
```

### Key rules
- `page.tsx` must NEVER have `'use client'` — it is always a Server Component.
- Client components go in `components/` and have `'use client'`.
- Event handlers and side effects go in hooks, not directly in components.

## Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Files | kebab-case | `use-project-form.ts` |
| Components | PascalCase | `ProjectForm.tsx` |
| Functions/variables | camelCase | `handleSubmit`, `targetAudience` |
| Types/Interfaces | PascalCase | `FormState`, `ProjectResponse` |
| Constants | UPPER_SNAKE_CASE | `BACKEND_URL`, `INITIAL_STATE` |
| CSS classes | kebab-case | `bg-blue-600`, `text-slate-400` |

## Anti-Patterns to Avoid

1. **No `any`** — always type explicitly
2. **No logic in components** — extract to hooks
3. **No raw `useState` beyond 2-3 fields** — use `useReducer`
4. **No `'use client'` on `page.tsx`** — keep SSR
5. **No barrel imports for everything** — only `index.ts` for public API surfaces
6. **No mixing concerns in one file** — types, consts, hooks, and utils each get their own file
