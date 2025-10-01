# AGENT.md - Codebase Briefing

## Project Overview

**RetroRover** is a **free retrospective board application** built to replace expensive paid alternatives like Trello or commercial retro tools. The primary motivation is to provide sprint retrospective functionality that's "easy, effective, and enjoyable" without pay-to-play restrictions.

### What This Application Does
- **Sprint Retrospective Boards**: Teams can create collaborative boards for sprint retrospectives
- **Real-time Collaboration**: Users can join boards, add comments/feedback to columns, and collaborate in real-time
- **Drag & Drop**: Comments can be moved between columns using drag-and-drop functionality
- **Comment System**: Full CRUD operations on comments with like/unlike functionality
- **Board Management**: Create, join, and manage retrospective boards with customizable columns


## Architecture & Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for components (@radix-ui/themes, @radix-ui/react-icons)
- **@dnd-kit/core** for drag-and-drop functionality
- **Clerk** (@clerk/nextjs) for authentication

### Backend & Database
- **Next.js API Routes** (App Router format)
- **AWS KMS** for encryption (currently disabled for passwords)
- **Socket.io** for real-time features (currently disabled - see notes)

### Key Dependencies
- **@aws-sdk/client-dynamodb** & **@aws-sdk/lib-dynamodb** for database operations
- **socket.io-client** for WebSocket connections
- **uuid** for generating unique IDs
- **svix** for webhook handling

## Current State & Important Notes
- NEVER EVER run the development server. I have it running. To see the results of what is happening in the server, tail run.log.

### Recently Disabled Features
1. **Password Protection**: All password-related functionality has been recently removed from the join flow. The system now grants access to any board that exists.

2. **WebSocket/Real-time Features**: Socket.io integration is implemented but currently disabled (commented out in Board.tsx). The comment notes suggest this might become a feature flag.

### Authentication System
- Uses **Clerk** for user authentication
- Webhook system handles user creation/session management
- User data stored in separate DynamoDB table
- Board access is currently stored in **localStorage** (noted as less secure, cookies planned)

### Database Schema (DynamoDB)
**Boards Table Structure:**
```javascript
{
  BoardId: string,
  BoardName: string,
  BoardDescription: string,
  RequirePassword: boolean,
  Password: string (encrypted, currently unused),
  BoardColumns: {
    [columnId]: {
      columnName: string,
      currentText: string,
      comments: {
        [commentId]: {
          comment_text: string,
          comment_likes: number
        }
      }
    }
  }
}
```

### State Management
- Uses **React useReducer** with custom reducer (`boardReducer.ts`)
- Actions include: ADD_COMMENT, DELETE_COMMENT, MOVE_COMMENT, INCREMENT_LIKES, etc.
- Local state managed with useState hooks

## Key Features & Functionality

### Board Creation
- **Template System**: Predefined templates (Classic, Two Column, Testing)
- **Custom Columns**: Users can create custom column layouts
- **Auto-generated IDs**: Uses UUID v4 for unique identifiers

### Comment System
- **CRUD Operations**: Full create, read, update, delete
- **Like/Unlike**: Comment voting system
- **Drag & Drop**: Move comments between columns
- **Real-time Updates**: (Disabled) Socket.io integration ready

### Board Joining
- **Simple Join Flow**: Username only (password protection removed)
- **Access Persistence**: localStorage stores board access
- **Board Discovery**: Join via board ID/slug

## Development Patterns

### API Route Pattern
```typescript
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  // Standard Next.js 14 App Router API format
}
```

### Component Structure
- **Prop drilling** for state management (no Context API)
- **Custom hooks** minimal usage
- **Radix UI** components with Tailwind styling
- **TypeScript** interfaces for props

### Database Operations
- **UpdateCommand** for DynamoDB updates
- **Nested attribute updates** using ExpressionAttributeNames
- **Error handling** with try/catch blocks

## Environment Variables Required
```bash
BOARDS_DYNAMODB_TABLE=          # Main boards table
USERS_DYNAMODB_TABLE=           # Users table  
AWS_BOARD_PASSWORDS_KMS_KEY_ID= # KMS key (unused)
WEBHOOK_SECRET=                 # Clerk webhook secret
```

## Current Issues & TODOs

### Known Technical Debt
1. **Type Safety**: Several `any` types in socket and dispatch parameters
2. **Security**: localStorage instead of secure cookies for session management
3. **Error Handling**: Basic error handling, could be more robust
4. **Component Size**: Some components (Board.tsx) are quite large

### Disabled/Incomplete Features
1. **Real-time Collaboration**: Socket.io code exists but disabled
2. **Password Protection**: Removed but infrastructure remains
3. **Board Settings**: UI exists but functionality incomplete
4. **User Board Management**: Limited board discovery/management

### Code Comments Indicate
- "TODO: fix this type" - Type safety improvements needed
- "TURNING OFF WEBSOCKETS FOR NOW.. maybe feature flag?" - Real-time features
- "This is technically less secure..." - localStorage vs cookies

## Development Commands
```bash
npm run dev    # Development server (port 3000)
npm run build  # Production build
npm run start  # Production server
npm run lint   # ESLint
```

```bash
export PATH="/Users/andy/.config//nvm/versions/node/v22.19.0/bin:$PATH" && npm [command]
```


## Working With This Codebase

### When Adding Features
1. **API Routes**: Follow Next.js 14 App Router conventions
2. **Database**: Use DynamoDB UpdateCommand patterns established
3. **State Management**: Use existing reducer pattern or useState
4. **UI Components**: Stick with Radix UI + Tailwind combination
5. **TypeScript**: Add proper types (avoid `any`)

### When Debugging
1. **Check browser console** - extensive logging throughout
3. **API route logs** - server-side logging implemented
4. **Component state** - reducer actions are logged

This codebase is functional but in active development with some features disabled for reimplementation. The core retrospective board functionality works well, with room for enhancement in real-time features, security, and user experience.
