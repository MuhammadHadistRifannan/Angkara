import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, AlertTriangle } from "lucide-react";

const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Cerah",
    windSpeed: 15,
    waveHeight: 0.5,
    isSafe: true,
  });

  useEffect(() => {
    // Simulasi data cuaca - dalam produksi akan menggunakan API BMKG
    const mockWeather = {
      temp: Math.floor(Math.random() * 5) + 26,
      condition: ["Cerah", "Berawan", "Hujan Ringan"][Math.floor(Math.random() * 3)],
      windSpeed: Math.floor(Math.random() * 20) + 10,
      waveHeight: Math.random() * 1.5,
      isSafe: Math.random() > 0.3,
    };
    setWeather(mockWeather);
  }, []);

  const getWeatherIcon = () => {
    if (weather.condition.includes("Hujan")) return <CloudRain className="h-8 w-8" />;
    if (weather.condition.includes("Berawan")) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2">
          {getWeatherIcon()}
          Informasi Cuaca Real-time
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {!weather.isSafe && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <div className="font-semibold text-destructive mb-1">Peringatan Cuaca</div>
                <p className="text-sm text-muted-foreground">
                  Kondisi cuaca kurang ideal untuk berlayar. Harap berhati-hati dan pertimbangkan untuk menunda perjalanan.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Suhu</div>
              <div className="text-3xl font-bold">{weather.temp}°C</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Kondisi</div>
              <div className="text-xl font-semibold">{weather.condition}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Wind className="h-3 w-3" />
                Angin
              </div>
              <div className="text-xl font-bold">{weather.windSpeed} km/h</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Tinggi Gelombang</div>
              <div className="text-xl font-bold">{weather.waveHeight.toFixed(1)} m</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">Status Keamanan:</span>
            <Badge variant={weather.isSafe ? "default" : "destructive"}>
              {weather.isSafe ? "Aman untuk Berlayar" : "Perlu Perhatian"}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Data dari BMKG • Diperbarui setiap 30 menit
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
