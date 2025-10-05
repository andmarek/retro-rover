-- PostgreSQL schema for RetroRover retrospective board application

-- Boards table - core board metadata
CREATE TABLE boards (
    board_id UUID PRIMARY KEY,
    board_name VARCHAR(255) NOT NULL,
    board_description TEXT,
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Board columns table - column configuration for each board
CREATE TABLE board_columns (
    column_id INTEGER NOT NULL,
    board_id UUID NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    column_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (board_id, column_id),
    FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE
);

-- Comments table - individual comments within columns
CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL,
    column_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    comment_likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id, column_id) REFERENCES board_columns(board_id, column_id) ON DELETE CASCADE
);

-- Users table (for future user management)
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
    email VARCHAR(255),
    username VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Board access/membership table (replaces localStorage)
CREATE TABLE board_members (
    board_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (board_id, user_id),
    FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);
CREATE INDEX idx_board_columns_order ON board_columns(board_id, column_order);
CREATE INDEX idx_comments_board_column ON comments(board_id, column_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_likes ON comments(comment_likes DESC);
CREATE INDEX idx_board_members_user_id ON board_members(user_id);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_boards_updated_at 
    BEFORE UPDATE ON boards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
