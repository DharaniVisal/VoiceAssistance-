import { ITransportService, BusRoute, TransitStop } from '../types';
import { COIMBATORE_BUS_ROUTES, COIMBATORE_STOPS } from '../data/coimbatoreData';

class TransportService implements ITransportService {
  async searchRoutes(source: string, destination: string): Promise<BusRoute[]> {
    const s = (source || '').trim().toLowerCase();
    const d = (destination || '').trim().toLowerCase();

    if (!s && !d) {
      return COIMBATORE_BUS_ROUTES;
    }

    const filtered = COIMBATORE_BUS_ROUTES.filter((route) => {
      const originMatch = !s || route.origin.toLowerCase().includes(s) || route.stops.some((st) => st.toLowerCase().includes(s));
      const destMatch = !d || route.destination.toLowerCase().includes(d) || route.stops.some((st) => st.toLowerCase().includes(d));
      return originMatch && destMatch;
    });

    if (filtered.length > 0) return filtered;

    // Fallback: If no exact intersection, return routes matching either
    const loose = COIMBATORE_BUS_ROUTES.filter((route) => {
      const hasS = s && (route.origin.toLowerCase().includes(s) || route.stops.some((st) => st.toLowerCase().includes(s)));
      const hasD = d && (route.destination.toLowerCase().includes(d) || route.stops.some((st) => st.toLowerCase().includes(d)));
      return hasS || hasD;
    });

    return loose.length > 0 ? loose : COIMBATORE_BUS_ROUTES;
  }

  getPopularRoutes(): BusRoute[] {
    return COIMBATORE_BUS_ROUTES.filter((r) => r.badge);
  }

  getAllRoutes(): BusRoute[] {
    return COIMBATORE_BUS_ROUTES;
  }

  getAllStops(): TransitStop[] {
    return COIMBATORE_STOPS;
  }

  getRouteByNumber(routeNumber: string): BusRoute | undefined {
    const clean = routeNumber.trim().toLowerCase();
    return COIMBATORE_BUS_ROUTES.find(
      (r) => r.routeNumber.toLowerCase() === clean || r.name.toLowerCase().includes(clean)
    );
  }
}

export const transportService = new TransportService();
