-- Migrasi: Menambahkan kolom boat_id ke tabel tour_packages
-- Memungkinkan operator menetapkan kapal armada tertentu untuk paket tour

ALTER TABLE public.tour_packages
ADD COLUMN IF NOT EXISTS boat_id UUID REFERENCES public.boats(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tour_packages_boat_id ON public.tour_packages(boat_id);
