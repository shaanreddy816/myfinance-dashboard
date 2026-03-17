-- AI Health Report Analysis: Database Indexes
-- Optimizes trend queries and timeline lookups for health records and medical observations

-- Index for efficient trend queries: parameter + date ordering per user
CREATE INDEX IF NOT EXISTS idx_observations_user_param_date
  ON medical_observations(user_id, parameter_name, observation_date DESC);

-- Index for health records timeline queries per user
CREATE INDEX IF NOT EXISTS idx_health_records_user_date
  ON health_records(user_id, report_date DESC);

-- Index for finding records that have been analyzed
CREATE INDEX IF NOT EXISTS idx_health_records_analyzed
  ON health_records(user_id, is_analyzed);
