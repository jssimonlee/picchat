CREATE TABLE IF NOT EXISTS picchat_rooms (
    room_code TEXT PRIMARY KEY,
    peer_ids TEXT NOT NULL,
    max_participants INTEGER DEFAULT 2,
    updated_at INTEGER NOT NULL
);
