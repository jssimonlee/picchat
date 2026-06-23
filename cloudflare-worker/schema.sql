CREATE TABLE IF NOT EXISTS picchat_rooms (
    room_code TEXT PRIMARY KEY,
    peer_ids TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
