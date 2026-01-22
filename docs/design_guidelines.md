# Swiss Mineral Oil Tax Reimbursement SaaS - Design Guidelines

## Design Approach: Design System Foundation

**Selected System:** Material Design (adapted for Swiss aesthetic)
- Clean, structured layouts ideal for data-heavy applications
- Strong form and table patterns for fleet/invoice management
- Proven multi-language support patterns

**Design Philosophy:** Swiss precision meets functional clarity
- Minimalist, professional aesthetic reflecting Swiss administrative standards
- Information hierarchy prioritizing efficiency for construction site managers
- Mobile-first approach for field use on tablets and smartphones

## Typography System

**Font Families:** 
- Primary: Inter (via Google Fonts) - clean, highly legible at all sizes
- Use for all UI elements, forms, tables, and body text

**Hierarchy:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-medium
- Form Labels: text-sm font-medium uppercase tracking-wide
- Body Text: text-base
- Helper Text: text-sm text-gray-600
- Data/Numbers: text-base font-mono (for precision in volume/amounts)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Consistent padding: p-6 for cards, p-8 for main containers
- Form spacing: space-y-6 between form groups
- Tight data displays: space-y-2 for list items

**Container Structure:**
- Max-width: max-w-6xl for main content
- Dashboard grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Two-column forms on desktop: lg:grid-cols-2 gap-6

## Component Library

**Navigation Bar:**
- Fixed top bar with application logo (left)
- Language selector dropdown (flags + text: FR | DE | IT | EN)
- User profile menu (right)
- Mobile: Hamburger menu with slide-out drawer

**Dashboard Layout:**
- Sidebar navigation (collapsible on mobile)
  - Fleet Management
  - Submit Invoice
  - Reports
  - Settings
- Main content area with breadcrumb navigation
- Summary cards showing: Total Reimbursement, Pending Claims, Active Machines

**Fleet Management:**
- Data table with sortable columns: Machine Name, Type, Chassis #, Year, Status
- Action buttons: Edit, Delete, View Details
- "Add Machine" prominent button (top-right)
- Search and filter bar above table

**Invoice Entry Form:**
- Step indicator (1. Select Machine → 2. Enter Data → 3. Review)
- Dropdown: Select machine from fleet
- Input fields: Invoice Date, Fuel Volume (L), Engine Hours
- Auto-calculation display: Shows eligible refund amount in real-time
- Clear validation messages in user's language
- Submit button with loading state

**Calculator Display Panel:**
- Card showing breakdown:
  - Total Volume (L)
  - Rate: 0.3405 CHF/L
  - Eligible Amount (bold, large)
  - Tax Regulations Reference (small link)

**Reports Section:**
- List view of generated reports (date, period, amount, status)
- Filter by date range
- Download PDF button per report
- Preview modal option

**Authentication:**
- Clean login/register forms
- Email + Password fields
- "Remember me" checkbox
- Password strength indicator on registration
- OAuth options for Google/Microsoft (common in B2B)

**Payment Integration:**
- Subscription status card in Settings
- Stripe checkout modal for 250 CHF annual subscription
- Invoice history table

**Forms Styling:**
- Input fields: rounded-lg border with focus ring
- Labels positioned above inputs
- Required field indicators (*)
- Inline validation with icons (checkmark/error)
- Grouped related fields with subtle background

**Buttons:**
- Primary actions: Large, rounded-lg, font-medium
- Secondary: Outlined style
- Danger (delete): Red variant
- Icon + text combination where helpful

**Data Tables:**
- Striped rows for readability
- Hover states
- Responsive: Card layout on mobile, table on desktop
- Pagination controls
- Row selection checkboxes for bulk actions

**Modals/Dialogs:**
- Centered overlay with backdrop blur
- Clear header with close button
- Footer with action buttons (Cancel left, Confirm right)

**PDF Report Preview:**
- Clean document layout mimicking official OFDF Form 45.35
- Header with company info and period
- Table of machines and consumption
- Summary section with total refund
- Footer with submission instructions

## Mobile Optimization

**Breakpoint Strategy:**
- Mobile-first: All features accessible on sm screens
- Sidebar becomes bottom navigation on mobile
- Tables convert to stacked cards
- Forms remain single-column on mobile
- Touch-friendly tap targets (min 44px)

**Field Manager UX:**
- Large input fields for gloved hands
- Quick-add invoice button (floating action button)
- Recent machines shortcut
- Offline capability indicator

## Accessibility

- WCAG AA compliance
- Keyboard navigation for all interactions
- ARIA labels in all 4 languages
- High contrast ratios for readability
- Focus indicators on all interactive elements
- Screen reader tested multilingual content

## Animations

**Minimal, Purposeful Motion:**
- Page transitions: Subtle fade (150ms)
- Loading states: Spinner only
- Form validation: Gentle shake on error
- Dropdown/modal: Slide-in (200ms)
- No decorative animations - maintain professional efficiency