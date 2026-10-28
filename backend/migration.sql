USE HomeMate;

ALTER TABLE Rooms ADD COLUMN available_from DATE NULL;

-- Non-destructive hardening for databases created before the current schema.
-- Run only statements that are not already present in the target database.
ALTER TABLE Room_Request
  ADD CONSTRAINT chk_room_request_status CHECK (request_status IN ('Pending', 'Accepted', 'Rejected'));

ALTER TABLE Roommate_Request
  ADD CONSTRAINT chk_roommate_request_status CHECK (request_status IN ('Pending', 'Accepted', 'Rejected'));

CREATE INDEX idx_rooms_availability ON Rooms (availability_status);
CREATE INDEX idx_room_request_owner_status ON Room_Request (owner_id, request_status);
CREATE INDEX idx_roommate_request_receiver_status ON Roommate_Request (receiver_id, request_status);
