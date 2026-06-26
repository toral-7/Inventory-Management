-- Add columns required by bills and sales_logs routes

ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'finalized'));

ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP;

ALTER TABLE sales_logs
  ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES bills(id) ON DELETE SET NULL;
