# Axios-Style Loading System

This document describes the comprehensive loading system implemented throughout the AI Finance Platform to provide better UX during data retrieval operations.

## 🎯 Overview

The loading system provides consistent, animated loading states across the entire application with multiple variants and sizes to match different use cases.

## 🧩 Components

### 1. LoadingSpinner

The main loading component with multiple variants and sizes.

```jsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Basic usage
<LoadingSpinner />

// With custom props
<LoadingSpinner 
  size="lg" 
  variant="dots" 
  text="Loading data..." 
  color="primary" 
/>
```

**Props:**

- `size`: "sm" | "default" | "lg" | "xl"
- `variant`: "spinner" | "dots" | "pulse" | "bars"
- `text`: Optional loading text
- `color`: "primary" | "secondary" | "success" | "warning" | "danger" | "white"
- `className`: Additional CSS classes

### 2. LoadingOverlay

Full-screen loading overlay with backdrop blur.

```jsx
import { LoadingOverlay } from "@/components/ui/loading-spinner";

<LoadingOverlay 
  isLoading={true}
  text="Processing..."
  variant="spinner"
>
  <YourComponent />
</LoadingOverlay>
```

### 3. Skeleton Components

Placeholder loading states for content.

```jsx
import { Skeleton, CardSkeleton, TableSkeleton } from "@/components/ui/loading-spinner";

// Basic skeleton
<Skeleton className="h-4 w-full" />

// Card skeleton
<CardSkeleton />

// Table skeleton
<TableSkeleton rows={5} />
```

### 4. ButtonLoading

Loading state for buttons.

```jsx
import { ButtonLoading } from "@/components/ui/loading-spinner";

<ButtonLoading loading={isLoading} className="btn-primary">
  Submit
</ButtonLoading>
```

## 🔄 Loading Variants

### 1. Spinner (Default)

Classic rotating spinner animation.

```jsx
<LoadingSpinner variant="spinner" />
```

### 2. Dots

Three dots with staggered animation.

```jsx
<LoadingSpinner variant="dots" />
```

### 3. Pulse

Single pulsing dot animation.

```jsx
<LoadingSpinner variant="pulse" />
```

### 4. Bars

Three animated bars.

```jsx
<LoadingSpinner variant="bars" />
```

## 🎨 Color Schemes

- `primary`: Blue (#3B82F6)
- `secondary`: Gray (#6B7280)
- `success`: Green (#10B981)
- `warning`: Yellow (#F59E0B)
- `danger`: Red (#EF4444)
- `white`: White (#FFFFFF)

## 📱 Size Options

- `sm`: 16px (w-4 h-4)
- `default`: 24px (w-6 h-6)
- `lg`: 32px (w-8 h-8)
- `xl`: 48px (w-12 h-12)

## 🌐 Global Loading Context

The application includes a global loading context for managing application-wide loading states.

```jsx
import { useLoading } from "@/lib/context/LoadingContext";

const { showLoading, hideLoading, withLoading } = useLoading();

// Show loading
showLoading("Processing data...", "dots");

// Hide loading
hideLoading();

// Wrap async function
const result = await withLoading(
  async () => {
    // Your async operation
    return await fetchData();
  },
  "Loading data...",
  "spinner"
);
```

## 📍 Implementation Examples

### 1. Form Submission

```jsx
const [loading, setLoading] = useState(false);

<Button 
  type="submit" 
  disabled={loading}
  className="w-full"
>
  {loading ? (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" variant="spinner" />
      <span>Saving...</span>
    </div>
  ) : (
    "Save Changes"
  )}
</Button>
```

### 2. Data Fetching

```jsx
const { data, loading, error } = useFetch(fetchData);

if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner variant="dots" text="Loading data..." />
    </div>
  );
}
```

### 3. Page Loading

```jsx
<Suspense
  fallback={
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner variant="bars" text="Loading page..." size="lg" />
    </div>
  }
>
  <YourPageComponent />
</Suspense>
```

### 4. Table Loading

```jsx
{deleteLoading && (
  <div className="flex items-center justify-center p-4">
    <LoadingSpinner variant="dots" text="Deleting transactions..." />
  </div>
)}
```

## 🔧 Enhanced useFetch Hook

The `useFetch` hook has been enhanced to provide better loading states:

```jsx
const {
  data,
  loading,
  isLoading,
  error,
  fn,
  setData,
  reset
} = useFetch(yourAsyncFunction);
```

**New Features:**

- `isLoading`: Additional loading state
- `reset()`: Function to clear all states
- Better error handling
- Consistent loading patterns

## 🎯 Best Practices

### 1. Use Appropriate Variants

- **Spinner**: For general loading states
- **Dots**: For data fetching operations
- **Pulse**: For quick operations
- **Bars**: For file uploads or heavy operations

### 2. Provide Context

Always include descriptive text with loading states:

```jsx
<LoadingSpinner text="Saving your changes..." />
```

### 3. Consistent Sizing

- Use `sm` for buttons and inline elements
- Use `default` for general loading states
- Use `lg` for page-level loading
- Use `xl` for full-screen loading

### 4. Color Coordination

- Use `primary` for general operations
- Use `success` for successful operations
- Use `danger` for destructive operations
- Use `white` for buttons with dark backgrounds

## 🚀 Performance Benefits

1. **Consistent UX**: All loading states follow the same design pattern
2. **Reduced Perceived Load Time**: Smooth animations make operations feel faster
3. **Better Feedback**: Users always know what's happening
4. **Accessibility**: Loading states provide clear feedback to screen readers

## 🔄 Migration Guide

### Before (Old Loading)

```jsx
{loading && <Loader2 className="animate-spin h-4 w-4" />}
```

### After (New Loading)

```jsx
{loading && <LoadingSpinner size="sm" variant="spinner" />}
```

## 📊 Usage Statistics

The loading system is implemented across:

- ✅ Header (WhatsApp modal)
- ✅ Transaction forms
- ✅ Receipt scanner
- ✅ Account creation
- ✅ Budget updates
- ✅ Transaction tables
- ✅ Dashboard loading
- ✅ Profile page
- ✅ Account pages
- ✅ Global loading context

## 🎨 Customization

You can customize the loading system by modifying the CSS classes in `components/ui/loading-spinner.jsx`:

```jsx
// Custom animation duration
const customTransition = {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut"
};

// Custom colors
const customColors = {
  brand: "text-purple-600",
  accent: "text-orange-600"
};
```

This comprehensive loading system ensures a consistent, professional user experience throughout the AI Finance Platform with smooth, animated loading states that provide clear feedback to users during data operations.
