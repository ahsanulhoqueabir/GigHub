# `@gig-hub/types`

Shared TypeScript type definitions and Zod validation schemas for **GigHub** Web (Next.js) and Mobile (React Native) applications.

## 📦 Installation

Once published to NPM (or installed locally):

```bash
npm install @gig-hub/types zod
# or
yarn add @gig-hub/types zod
# or
pnpm add @gig-hub/types zod
```

---

## 🚀 Usage

### 1. In React Native or Next.js (Schemas & Inferred Types)

```typescript
import { signUpSchema, SignUpInput } from "@gig-hub/types";
// Or import directly from validations subpath:
// import { signUpSchema } from "@gig-hub/types/validations";

// Use with React Hook Form & Zod Resolver
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<SignUpInput>({
  resolver: zodResolver(signUpSchema),
});
```

### 2. In React Native or Next.js (Database & Business Types)

```typescript
import { Profile, Gig, Order, UserRole } from "@gig-hub/types";
// Or import directly from types subpath:
// import { Profile, Gig } from "@gig-hub/types/types";

function ProfileHeader({ user }: { user: Profile }) {
  return <Text>{user.full_name}</Text>;
}
```

---

## 🛠️ Building & Publishing

### Build
To compile TypeScript into ESM (`.mjs`), CommonJS (`.js`), and Type Declarations (`.d.ts`):

```bash
npm run build
```

### Dry Run Publish Test
```bash
npm publish --dry-run
```

### Publish to NPM
```bash
npm publish --access public
```
