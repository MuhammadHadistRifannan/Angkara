
-- Allow operators table to have nullable user_id for demo/sample data
ALTER TABLE operators ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow viewing operators even without user_id
DROP POLICY IF EXISTS "Anyone can view verified operators" ON operators;
CREATE POLICY "Anyone can view verified operators"
ON operators FOR SELECT
USING (verified = true);

-- Insert sample operators
INSERT INTO operators (company_name, email, phone, verified, address) VALUES
('CV Samudra Jaya', 'samudrajaya@email.com', '081234567890', true, 'Jl. Pelabuhan No. 1, Cilacap'),
('UD Bahari Sejahtera', 'bahari@email.com', '081234567891', true, 'Jl. Tanjung Intan No. 5, Cilacap'),
('PT Cilacap Marine Tour', 'marinetour@email.com', '081234567892', true, 'Jl. Teluk Penyu No. 10, Cilacap');

-- Insert sample boats using the operators
INSERT INTO boats (name, description, type, capacity, base_price, location, operator_id, features, available, min_passengers)
SELECT 
  boat_data.name,
  boat_data.description,
  boat_data.type,
  boat_data.capacity,
  boat_data.base_price,
  boat_data.location,
  o.id,
  boat_data.features,
  boat_data.available,
  boat_data.min_passengers
FROM (VALUES
  ('Speedboat Benawa 70', 'Kapal cepat modern dengan fasilitas lengkap untuk perjalanan nyaman ke Nusakambangan', 'speedboat'::boat_type, 70, 45000, 'Teluk Penyu', 'CV Samudra Jaya', ARRAY['AC', 'Life Jacket', 'GPS Tracker', 'Toilet'], true, 10),
  ('Kapal Kayu Nusantara', 'Kapal kayu tradisional yang kokoh dan nyaman untuk wisata keluarga', 'kapal_kayu'::boat_type, 35, 35000, 'Pelabuhan Tanjung Intan', 'UD Bahari Sejahtera', ARRAY['Life Jacket', 'Toilet', 'Kanopi', 'Sound System'], true, 5),
  ('Express Nusakambangan', 'Speedboat express tercepat dengan pelayanan premium', 'speedboat'::boat_type, 50, 50000, 'Teluk Penyu', 'PT Cilacap Marine Tour', ARRAY['AC', 'Life Jacket', 'Snack', 'Guide', 'WiFi'], true, 8),
  ('Kapal Wisata Makmur', 'Kapal wisata dengan pemandangan 360 derajat', 'kapal_kayu'::boat_type, 40, 40000, 'Pelabuhan Tanjung Intan', 'CV Samudra Jaya', ARRAY['Life Jacket', 'Kanopi', 'Snack', 'Guide'], true, 10),
  ('Speedboat Premium', 'Speedboat mewah dengan fasilitas VIP', 'speedboat'::boat_type, 30, 65000, 'Teluk Penyu', 'PT Cilacap Marine Tour', ARRAY['AC', 'Life Jacket', 'VIP Lounge', 'Catering', 'WiFi', 'Entertainment'], true, 6)
) AS boat_data(name, description, type, capacity, base_price, location, operator_name, features, available, min_passengers)
JOIN operators o ON o.company_name = boat_data.operator_name;
