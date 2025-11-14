-- Create enum types
CREATE TYPE boat_type AS ENUM ('speedboat', 'kapal_kayu');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'dp_paid', 'fully_paid', 'refunded');

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Operators table
CREATE TABLE operators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  ksop_certificate TEXT,
  verified BOOLEAN DEFAULT false,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified operators" ON operators FOR SELECT USING (verified = true);
CREATE POLICY "Operators can view own data" ON operators FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Operators can update own data" ON operators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create operator profile" ON operators FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Boats table
CREATE TABLE boats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type boat_type NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  base_price INTEGER NOT NULL CHECK (base_price > 0),
  image_url TEXT,
  features TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  min_passengers INTEGER DEFAULT 10,
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE boats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available boats" ON boats FOR SELECT USING (available = true);
CREATE POLICY "Operators can manage own boats" ON boats FOR ALL USING (
  operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  boat_id UUID REFERENCES boats(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  passengers INTEGER NOT NULL CHECK (passengers > 0),
  total_price INTEGER NOT NULL,
  booking_status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Operators can view bookings for their boats" ON bookings FOR SELECT USING (
  boat_id IN (SELECT id FROM boats WHERE operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid()))
);
CREATE POLICY "Operators can update bookings" ON bookings FOR UPDATE USING (
  boat_id IN (SELECT id FROM boats WHERE operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid()))
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  boat_id UUID REFERENCES boats(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  comment TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create review for own booking" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid() AND booking_status = 'completed')
);

-- Tour packages table
CREATE TABLE tour_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_hours DECIMAL NOT NULL,
  price INTEGER NOT NULL,
  includes TEXT[],
  max_participants INTEGER,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tour_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available packages" ON tour_packages FOR SELECT USING (available = true);
CREATE POLICY "Operators can manage own packages" ON tour_packages FOR ALL USING (
  operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();