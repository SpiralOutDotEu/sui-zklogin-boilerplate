# UI Component Guidelines

## 🎯 Component Organization Strategy

This project uses **Centralized UI** with **Atomic Design** principles.

### 📁 Structure

```
shared/ui/
├── atoms/          # Basic building blocks (Button, Input, Avatar)
├── molecules/      # Simple combinations (ConnectWalletButton, DropdownMenu)
├── organisms/      # Complex components (UserWalletButton, NotificationContainer)
└── index.ts        # Main barrel export
```

### 🧩 Atomic Design Levels

#### **Atoms** (`shared/ui/atoms/`)

- **Purpose**: Basic building blocks that can't be broken down further
- **Examples**: `Button`, `Input`, `Avatar`, `Icon`
- **Rules**:
  - ✅ Highly reusable across the entire app
  - ✅ No business logic
  - ✅ Minimal dependencies
  - ✅ Single responsibility

#### **Molecules** (`shared/ui/molecules/`)

- **Purpose**: Simple combinations of atoms
- **Examples**: `ConnectWalletButton`, `DropdownMenu`, `NotificationItem`
- **Rules**:
  - ✅ Composed of 2-3 atoms
  - ✅ Reusable across multiple features
  - ✅ May contain some business logic
  - ✅ Specific functionality

#### **Organisms** (`shared/ui/organisms/`)

- **Purpose**: Complex components made of molecules and atoms
- **Examples**: `UserWalletButton`, `NotificationContainer`
- **Rules**:
  - ✅ Complex UI sections
  - ✅ May be feature-specific but still reusable
  - ✅ Can contain significant business logic
  - ✅ Often represent complete UI patterns

### 🚫 What NOT to Put in Shared UI

- **Feature-specific components** that are never reused
- **Page-level components** (put these in `features/*/routes/`)
- **One-off components** with no reusability

### ✅ Where to Put Different Components

| Component Type     | Location                   | Example                |
| ------------------ | -------------------------- | ---------------------- |
| Reusable button    | `shared/ui/atoms/`         | `Button.tsx`           |
| Auth-specific form | `features/auth/routes/`    | `LoginForm.tsx`        |
| Reusable dropdown  | `shared/ui/molecules/`     | `DropdownMenu.tsx`     |
| Profile page       | `features/profile/routes/` | `Profile.tsx`          |
| Complex wallet UI  | `shared/ui/organisms/`     | `UserWalletButton.tsx` |

### 📦 Import Strategy

```typescript
// ✅ Good - Use barrel exports
import { Button, Input } from '@/shared/ui/atoms';
import { ConnectWalletButton } from '@/shared/ui/molecules';
import { UserWalletButton } from '@/shared/ui/organisms';

// ✅ Good - Use main barrel export
import { Button, ConnectWalletButton, UserWalletButton } from '@/shared/ui';

// ❌ Bad - Direct file imports
import Button from '@/shared/ui/atoms/Button';
```

### 🎨 Component Guidelines

1. **Consistent Props**: Use similar prop patterns across components
2. **TypeScript**: Always provide proper TypeScript interfaces
3. **Accessibility**: Include proper ARIA attributes
4. **Styling**: Use Tailwind classes consistently
5. **Documentation**: Include JSDoc comments
6. **Testing**: Write tests for reusable components

### 🔄 When to Move Components

- **To Shared UI**: When a component is used in 2+ features
- **To Feature Routes**: When a component is only used in one feature
- **Refactor**: When a component grows too complex, split into smaller parts
