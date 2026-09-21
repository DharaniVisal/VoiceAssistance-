import { INavigationService, TravelMode } from '../types';

class NavigationService implements INavigationService {
  getRouteWaypoints(routeId: string) {
    if (routeId.includes('11a')) {
      return [
        { x: 290, y: 320, name: 'RS Puram (DB Road)' },
        { x: 380, y: 350, name: 'Central Railway Station' },
        { x: 470, y: 380, name: 'Ramanathapuram' },
        { x: 520, y: 400, name: 'Ondipudur' },
        { x: 550, y: 420, name: 'Singanallur Bus Terminal' },
      ];
    }
    if (routeId.includes('t1')) {
      return [
        { x: 420, y: 280, name: 'Gandhipuram Central' },
        { x: 440, y: 220, name: 'Ganapathy' },
        { x: 460, y: 190, name: 'Prozone Mall' },
        { x: 490, y: 150, name: 'Saravanampatti Tech Zone' },
      ];
    }
    return [
      { x: 380, y: 350, name: 'Central Railway Station' },
      { x: 420, y: 280, name: 'Gandhipuram Central' },
      { x: 480, y: 285, name: 'Lakshmi Mills' },
      { x: 520, y: 290, name: 'Peelamedu' },
      { x: 570, y: 275, name: 'Hope College' },
      { x: 620, y: 260, name: 'Tech Park North (TIDEL)' },
    ];
  }

  calculateETA(source: string, destination: string, mode: TravelMode = 'bus') {
    const s = (source || '').toLowerCase();
    const d = (destination || '').toLowerCase();

    let baseDistKm = 6.5;
    if ((s.includes('central') || s.includes('gandhipuram')) && (d.includes('tech park') || d.includes('tidel'))) {
      baseDistKm = 8.4;
    } else if (s.includes('rs puram') && d.includes('singanallur')) {
      baseDistKm = 11.2;
    } else if (s.includes('gandhipuram') && d.includes('saravanampatti')) {
      baseDistKm = 9.8;
    } else if (s.includes('central') && d.includes('marudhamalai')) {
      baseDistKm = 14.0;
    }

    // Speeds in km/h: bus: 22, car: 32, bike: 18, walk: 4.5
    let speedKmh = 22;
    if (mode === 'car') speedKmh = 32;
    else if (mode === 'bike') speedKmh = 18;
    else if (mode === 'walk') speedKmh = 4.5;

    const rawMinutes = (baseDistKm / speedKmh) * 60;
    const etaMinutes = Math.max(2, Math.round(rawMinutes));

    return {
      etaMinutes,
      distanceKm: parseFloat(baseDistKm.toFixed(1)),
      speedKmh,
    };
  }
}

export const navigationService = new NavigationService();
