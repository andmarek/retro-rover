# Card Ordering System - Implementation Plan

## Overview

Implement a dual ordering system for retro board cards that allows users to choose between:
1. **Manual Ordering** - Drag and drop cards to specific positions (persisted via fractional indexing)
2. **Vote-based Ordering** - Sort cards by number of likes (highest first)

Both ordering methods are always stored in the database, and users can toggle between them in the UI.

---

## Database Schema Changes

### Add Position Column to Comments Table

```sql
ALTER TABLE comments 
ADD COLUMN position DECIMAL(10, 5) DEFAULT 0;
```

**Key Points:**
- Use `DECIMAL(10, 5)` for fractional indexing precision
- Position is scoped per column (cards in different columns have independent positions)
- New cards get assigned a position based on their insertion point
- Existing `comment_likes` column remains unchanged for voting

### Migration Strategy

For existing cards without positions:
```sql
-- Assign initial positions based on creation date
WITH numbered_cards AS (
  SELECT 
    comment_id,
    ROW_NUMBER() OVER (PARTITION BY board_id, column_id ORDER BY created_at ASC) as row_num
  FROM comments
)
UPDATE comments c
SET position = nc.row_num * 1.0
FROM numbered_cards nc
WHERE c.comment_id = nc.comment_id;
```

---

## Fractional Indexing Implementation

### How It Works

Cards maintain positions as decimal numbers. To insert between two cards, use the midpoint:

```
Current state:
Card A: position = 1.0
Card B: position = 2.0
Card C: position = 3.0

Insert new card between A and B:
New Card: position = (1.0 + 2.0) / 2 = 1.5

Result:
Card A: position = 1.0
New Card: position = 1.5
Card B: position = 2.0
Card C: position = 3.0
```

### Position Calculation Algorithm

```typescript
function calculateNewPosition(
  aboveCard: { position: number } | null,
  belowCard: { position: number } | null
): number {
  if (!aboveCard && !belowCard) {
    // First card in empty column
    return 1.0;
  }
  
  if (!aboveCard) {
    // Inserting at top
    return belowCard!.position - 1.0;
  }
  
  if (!belowCard) {
    // Inserting at bottom
    return aboveCard.position + 1.0;
  }
  
  // Inserting between two cards
  return (aboveCard.position + belowCard.position) / 2;
}
```

### Precision Exhaustion & Rebalancing

When precision runs low (positions get too close), rebalance the entire column:

```typescript
function shouldRebalance(position1: number, position2: number): boolean {
  return Math.abs(position1 - position2) < 0.00001;
}

async function rebalanceColumnPositions(boardId: string, columnId: number) {
  // Fetch all cards sorted by current position
  const cards = await getCardsSortedByPosition(boardId, columnId);
  
  // Reassign evenly spaced positions
  const updates = cards.map((card, index) => ({
    comment_id: card.comment_id,
    position: (index + 1) * 1.0
  }));
  
  // Batch update
  await batchUpdatePositions(updates);
}
```

**When to rebalance:** Detect during position calculation, run as background task.

---

## Frontend Changes

### 1. Add Sort Mode Toggle

Location: Board header, next to board title

```tsx
<div className="flex items-center gap-2">
  <Button 
    variant={sortMode === 'manual' ? 'default' : 'outline'}
    onClick={() => setSortMode('manual')}
  >
    Manual Order
  </Button>
  <Button 
    variant={sortMode === 'votes' ? 'default' : 'outline'}
    onClick={() => setSortMode('votes')}
  >
    Sort by Votes
  </Button>
</div>
```

### 2. Update Card Sorting Logic

```typescript
type SortMode = 'manual' | 'votes';

const sortCards = (cards: Card[], mode: SortMode): Card[] => {
  if (mode === 'votes') {
    return [...cards].sort((a, b) => b.comment_likes - a.comment_likes);
  }
  // manual mode
  return [...cards].sort((a, b) => a.position - b.position);
};
```

### 3. DnD Library Switch

**Current:** `@dnd-kit/core` with basic draggable/droppable  
**New:** `@dnd-kit/sortable` for insertion point detection

```tsx
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';

// Wrap cards in SortableContext
<SortableContext 
  items={cards.map(c => c.id)} 
  strategy={verticalListSortingStrategy}
  disabled={sortMode === 'votes'}
>
  {sortedCards.map(card => (
    <SortableCard key={card.id} card={card} />
  ))}
</SortableContext>
```

**Important:** Disable dragging when in "votes" mode (sorting is automatic).

### 4. Visual Drop Indicator

Show where card will be inserted:

```tsx
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 4 }}
  className="bg-accent rounded-full"
/>
```

Position indicator between cards based on cursor Y position.

---

## API Changes

### 1. Update Move Comment Endpoint

**Current:** `/api/boards/comments/move/[slug]`

**New Parameters:**
```typescript
interface MoveCommentRequest {
  boardId: string;
  sourceColumnId: number;
  destinationColumnId: number;
  sourceCommentId: string;
  commentText: string;
  commentLikes: number;
  // NEW:
  targetPosition: number;  // Calculated position from fractional indexing
}
```

### 2. Update Add Comment Endpoint

**Current:** `/api/boards/comments`

**New Parameters:**
```typescript
interface AddCommentRequest {
  boardId: string;
  columnId: number;
  commentId: string;
  commentText: string;
  // NEW:
  position?: number;  // If not provided, insert at bottom
}
```

**Backend Logic:**
```typescript
// If position not provided, calculate bottom position
if (!position) {
  const lastCard = await getLastCardInColumn(boardId, columnId);
  position = lastCard ? lastCard.position + 1.0 : 1.0;
}
```

### 3. New Endpoint: Rebalance Column (Optional)

```typescript
POST /api/boards/[boardId]/columns/[columnId]/rebalance

// Returns updated positions for all cards
Response: {
  updates: Array<{ commentId: string, newPosition: number }>
}
```

---

## State Management

### 1. Add Sort Mode State

```typescript
const [sortMode, setSortMode] = useState<SortMode>('manual');

// Persist to localStorage
useEffect(() => {
  localStorage.setItem('retro-sort-mode', sortMode);
}, [sortMode]);

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('retro-sort-mode');
  if (saved) setSortMode(saved as SortMode);
}, []);
```

### 2. Optimistic Position Updates

When dragging in manual mode:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;
  
  // Calculate new position
  const overIndex = cards.findIndex(c => c.id === over.id);
  const aboveCard = cards[overIndex - 1] || null;
  const belowCard = cards[overIndex] || null;
  const newPosition = calculateNewPosition(aboveCard, belowCard);
  
  // Optimistically update
  setBoardData(prev => {
    // ... update the dragged card's position
  });
  
  // Make API call with new position
  await moveCard({ ...data, targetPosition: newPosition });
};
```

---

## User Flow

### Manual Ordering Mode

1. User toggles to "Manual Order"
2. Cards display in position order (ascending)
3. User drags card to new position
4. Visual indicator shows insertion point
5. On drop:
   - New position calculated using fractional indexing
   - Card updates optimistically in UI
   - API call persists position to database
   - On failure, rollback to previous position
6. Votes still visible but don't affect order

### Vote-based Ordering Mode

1. User toggles to "Sort by Votes"
2. Cards re-sort by vote count (highest first)
3. Drag-and-drop is **disabled** (cards can't be manually reordered)
4. User can still vote, cards re-sort automatically
5. Manual positions are preserved in DB but not displayed
6. Switching back to manual shows last manual order

---

## Implementation Steps

### Phase 1: Database & Backend (1-2 days)

1. ✅ Add `position` column to comments table
2. ✅ Write migration to assign initial positions
3. ✅ Update `moveComment()` to accept and save position
4. ✅ Update `addComment()` to calculate position for new cards
5. ✅ Update GET endpoints to return position data
6. ✅ Write `calculateNewPosition()` utility function
7. ✅ (Optional) Write `rebalanceColumn()` function

### Phase 2: Frontend - Sort Toggle (1 day)

1. ✅ Add sort mode state and localStorage persistence
2. ✅ Add UI toggle buttons in board header
3. ✅ Update card sorting to use selected mode
4. ✅ Verify both modes work with existing data

### Phase 3: Frontend - DnD Enhancement (2-3 days)

1. ✅ Install `@dnd-kit/sortable`
2. ✅ Replace current DnD with SortableContext
3. ✅ Implement drop indicator between cards
4. ✅ Disable DnD when in votes mode
5. ✅ Implement position calculation in handleDragEnd
6. ✅ Update optimistic updates to handle positions
7. ✅ Test cross-column dragging with positions

### Phase 4: Polish & Edge Cases (1 day)

1. ✅ Test precision exhaustion scenario
2. ✅ Add position rebalancing (if needed)
3. ✅ Handle concurrent edits gracefully
4. ✅ Add animations for sort mode switching
5. ✅ Update existing tests
6. ✅ Add new tests for position calculations

**Total Estimate:** 5-7 days

---

## Edge Cases & Considerations

### 1. Concurrent Edits
**Scenario:** Two users drag cards simultaneously in manual mode  
**Solution:** Last write wins on position. WebSocket updates refresh other users' views.

### 2. Switching Between Modes
**Scenario:** User switches from votes → manual → votes → manual  
**Solution:** Manual positions are always preserved. Each switch just changes display sort.

### 3. New Cards in Different Modes
- **Manual mode:** Insert at bottom (largest position + 1)
- **Votes mode:** Insert at bottom (0 votes), position calculated but not displayed

### 4. Deleting Cards
**Scenario:** Card deleted, leaving gap in positions  
**Solution:** Gaps are fine! Fractional indexing doesn't require continuous positions.

### 5. Precision Exhaustion
**Scenario:** After 100+ reorders between same two cards, precision runs out  
**Solution:** Detect when `|position1 - position2| < 0.00001`, trigger rebalance.

### 6. Moving Between Columns
**Scenario:** Drag card from Column A to Column B  
**Solution:** 
- In manual mode: Calculate new position in destination column
- In votes mode: DnD disabled, can't happen

### 7. Initial Position Assignment
**Scenario:** Existing boards have no position data  
**Solution:** Migration assigns positions based on `created_at` timestamp.

---

## Future Enhancements

### Additional Sort Modes (Later)

1. **Chronological** - Sort by creation date
2. **Alphabetical** - Sort by card text
3. **Category** - Group by custom tags/labels
4. **Assignee** - If we add user assignments

### Per-Column Sort Modes

Allow each column to have independent sort mode:
- "What went well" sorted by votes
- "Action items" sorted manually
- "To improve" sorted chronologically

### Sort Presets

Save and share sort configurations:
- "Sprint Review" preset: All columns by votes
- "Planning" preset: All columns manual
- Custom presets per team

---

## Testing Strategy

### Unit Tests

- `calculateNewPosition()` with various scenarios
- Sort mode switching logic
- Position update optimistic updates

### Integration Tests

- Add card → verify position assigned
- Drag card → verify position calculated correctly
- Switch sort modes → verify display updates
- Delete card → verify other positions unaffected

### E2E Tests

- Full drag-and-drop flow in manual mode
- Vote and verify re-sort in votes mode
- Switch between modes and verify state preserved
- Concurrent users dragging cards

---

## Success Metrics

- Users can seamlessly switch between manual and vote-based ordering
- Drag-and-drop feels smooth and natural in manual mode
- No position conflicts or database errors
- Position precision lasts for realistic usage (1000+ operations per column)
- Sort preference persists across sessions

---

## Open Questions

1. Should sort mode be per-board or per-user preference?
2. Do we want keyboard shortcuts to switch modes (e.g., `M` for manual, `V` for votes)?
3. Should we show both orderings simultaneously (votes as badges in manual mode)?
4. Do facilitators get special powers (lock sort mode, force everyone to same view)?
