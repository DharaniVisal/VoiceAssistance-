import { IIntentService, ParsedIntentResult, SupportedIntent } from '../types';
import { COIMBATORE_STOPS, COIMBATORE_BUS_ROUTES } from '../data/coimbatoreData';

class IntentService implements IIntentService {
  private knownStops = [
    { canonical: 'Gandhipuram', aliases: ['gandhipuram', 'gandipuram', 'gandhipurm', 'gandhi puram', 'gandhipuram stand'] },
    { canonical: 'Saravanampatti', aliases: ['saravanampatti', 'saravanampaty', 'saravanampati', 'saravanampatty', 'saravana patti'] },
    { canonical: 'Central Railway Station', aliases: ['railway station', 'railway', 'station', 'coimbatore junction', 'cbe junction', 'central station'] },
    { canonical: 'Ukkadam', aliases: ['ukkadam', 'ukadam', 'ukkadam terminal', 'ukadam bus stand'] },
    { canonical: 'Singanallur', aliases: ['singanallur', 'singanalloor', 'singanallur terminal', 'singanaloor'] },
    { canonical: 'Peelamedu', aliases: ['peelamedu', 'pilamedu', 'psg', 'psg tech', 'peelamedu bus stop'] },
    { canonical: 'RS Puram', aliases: ['rs puram', 'r.s. puram', 'rspuram', 'db road'] },
    { canonical: 'Tech Park North (TIDEL)', aliases: ['tech park', 'tidel', 'tidel park', 'tech park north', 'it park'] },
    { canonical: 'Hope College', aliases: ['hope college', 'hopes', 'hope collage'] },
    { canonical: 'Marudhamalai', aliases: ['marudhamalai', 'marudamalai', 'maruthamalai'] },
    { canonical: 'Vadavalli', aliases: ['vadavalli', 'vada valli', 'vada valli bus stop'] },
    { canonical: 'Thudiyalur', aliases: ['thudiyalur', 'thudiyaloor', 'tudiyalur'] },
    { canonical: 'Eachanari', aliases: ['eachanari', 'eechanari', 'eachanari temple'] },
    { canonical: 'Coimbatore Airport (SITRA)', aliases: ['airport', 'sitra', 'aerodrome', 'coimbatore airport'] },
    { canonical: 'Perur', aliases: ['perur', 'peroor', 'perur temple'] },
    { canonical: 'Kovaipudur', aliases: ['kovaipudur', 'kovai pudur', 'kovaipudoor'] },
  ];

  fuzzyMatchStop(input: string): { matchedName: string; corrected: boolean } {
    const clean = input.trim().toLowerCase();
    for (const item of this.knownStops) {
      if (item.canonical.toLowerCase() === clean) {
        return { matchedName: item.canonical, corrected: false };
      }
      for (const alias of item.aliases) {
        if (clean === alias || clean.includes(alias)) {
          const isFuzzy = clean !== item.canonical.toLowerCase();
          return { matchedName: item.canonical, corrected: isFuzzy };
        }
      }
    }

    // Partial levenshtein-like character overlap
    for (const item of this.knownStops) {
      const canon = item.canonical.toLowerCase();
      if (canon.length > 5 && (clean.startsWith(canon.substring(0, 5)) || canon.includes(clean))) {
        return { matchedName: item.canonical, corrected: true };
      }
    }

    return { matchedName: input, corrected: false };
  }

  async parseVoiceCommand(transcript: string): Promise<ParsedIntentResult> {
    const raw = transcript ? transcript.trim() : '';

    // Requirement 12: Input Validation (Empty Input)
    if (!raw) {
      return {
        intent: 'UNKNOWN',
        rawText: '',
        validationStatus: 'EMPTY',
        validationMessage: 'Validation Failed: Empty voice command received.',
        replyText: 'No audio command detected. Please speak or enter a transit query.',
      };
    }

    const lower = raw.toLowerCase();

    // Requirement 12: Input Validation (Command Integrity Violation / Malicious commands)
    const dangerousPatterns = ['delete database', 'drop table', 'rm -rf', 'format drive', 'truncate', 'system override', 'bypass security'];
    for (const pattern of dangerousPatterns) {
      if (lower.includes(pattern)) {
        return {
          intent: 'UNKNOWN',
          rawText: raw,
          validationStatus: 'BLOCKED_INTEGRITY',
          validationMessage: `Security Alert: Command integrity violation. Unsupported administrative operation: "${pattern}".`,
          replyText: 'Command rejected by cybersecurity layer: Unauthorized system operation.',
        };
      }
    }

    let detectedIntent: SupportedIntent = 'UNKNOWN';
    let source: string | undefined;
    let destination: string | undefined;
    let routeNumber: string | undefined;
    let stopName: string | undefined;
    let correctionNotice: string | undefined;
    let replyText = '';

    // Check for route number in query (e.g. "12", "11A", "44", "70", "3", "1C", "20A", "45B", "82", "100", "90A", "T-Line")
    const routeMatch = lower.match(/\b(12|11a|44|70|3|1c|20a|45b|82|100|90a|t-line|t line)\b/i);
    if (routeMatch) {
      routeNumber = routeMatch[1].toUpperCase().replace('T LINE', 'Express T-Line').replace('T-LINE', 'Express T-Line');
    }

    // 1. HELP INTENT
    if (lower.includes('help') || lower.includes('what can you do') || lower.includes('commands')) {
      detectedIntent = 'HELP';
      replyText = 'You can ask for bus routes (e.g. "Route from Gandhipuram to Saravanampatti"), bus timings ("Timing of route 12"), or available buses.';
      return {
        intent: detectedIntent,
        rawText: raw,
        validationStatus: 'VALID',
        replyText,
      };
    }

    // 2. BUS_TIMING: e.g. "What is the timing of route 12?", "when is the next 11A", "schedule for route 44"
    if (
      lower.includes('timing') ||
      lower.includes('when is') ||
      lower.includes('schedule') ||
      lower.includes('first bus') ||
      lower.includes('last bus') ||
      (routeNumber && (lower.includes('time') || lower.includes('bus timing')))
    ) {
      detectedIntent = 'BUS_TIMING';
      const targetRouteNum = routeNumber || '12';
      const matchedRoute = COIMBATORE_BUS_ROUTES.find((r) => r.routeNumber.toLowerCase() === targetRouteNum.toLowerCase()) || COIMBATORE_BUS_ROUTES[0];
      routeNumber = matchedRoute.routeNumber;
      replyText = `Route ${matchedRoute.routeNumber} (${matchedRoute.name}) departs from ${matchedRoute.origin} to ${matchedRoute.destination}. First bus is at ${matchedRoute.firstTiming}, last bus is at ${matchedRoute.lastTiming}, with service every ${matchedRoute.frequencyMinutes} minutes.`;
      return {
        intent: detectedIntent,
        routeNumber,
        rawText: raw,
        validationStatus: 'VALID',
        replyText,
      };
    }

    // 3. AVAILABLE_BUSES: e.g. "Show available buses", "list all buses", "what buses are there"
    if (
      lower.includes('available buses') ||
      lower.includes('show buses') ||
      lower.includes('list buses') ||
      lower.includes('all buses') ||
      lower === 'buses'
    ) {
      detectedIntent = 'AVAILABLE_BUSES';
      replyText = `There are ${COIMBATORE_BUS_ROUTES.length} active local bus routes configured in Coimbatore offline database, including Route 12, 11A, 44 Loop, and Express T-Line.`;
      return {
        intent: detectedIntent,
        rawText: raw,
        validationStatus: 'VALID',
        replyText,
      };
    }

    // 4. BUS_STOP / DIRECTIONS TO STOP: e.g. "Give directions to the nearest bus stop", "where is the bus stop", "nearest stop"
    if (
      lower.includes('nearest bus stop') ||
      lower.includes('nearest stop') ||
      lower.includes('where is the bus stop') ||
      lower.includes('directions to the nearest')
    ) {
      detectedIntent = 'BUS_STOP';
      stopName = 'Gandhipuram Central Bus Stand';
      replyText = 'The nearest bus stop is Gandhipuram Central Bus Stand, approximately 250 meters away via Cross Cut Road.';
      return {
        intent: detectedIntent,
        stopName,
        rawText: raw,
        validationStatus: 'VALID',
        replyText,
      };
    }

    // 5. DIRECTIONS: e.g. "Give directions to railway station", "how to go to peelamedu"
    if (lower.includes('directions') || lower.includes('how to go') || lower.includes('navigate to')) {
      detectedIntent = 'DIRECTIONS';
      let targetStop = 'Central Railway Station';
      for (const item of this.knownStops) {
        for (const alias of item.aliases) {
          if (lower.includes(alias)) {
            targetStop = item.canonical;
            break;
          }
        }
      }
      destination = targetStop;
      replyText = `Directions to ${destination}: Board Route 12 or 44 from Central corridor. Estimated transit time is 20 minutes.`;
      return {
        intent: detectedIntent,
        destination,
        rawText: raw,
        validationStatus: 'VALID',
        replyText,
      };
    }

    // 6. ROUTE_SEARCH: e.g. "Show bus route from Gandhipuram to Saravanampatti" or "Which bus goes to the railway station?"
    // Check for "from X to Y" pattern
    const fromToMatch = lower.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/i);
    if (fromToMatch) {
      detectedIntent = 'ROUTE_SEARCH';
      const rawSrc = fromToMatch[1].trim();
      const rawDst = fromToMatch[2].trim();

      const srcMatch = this.fuzzyMatchStop(rawSrc);
      const dstMatch = this.fuzzyMatchStop(rawDst);

      source = srcMatch.matchedName;
      destination = dstMatch.matchedName;

      if (srcMatch.corrected || dstMatch.corrected) {
        const corrections: string[] = [];
        if (srcMatch.corrected) corrections.push(`"${rawSrc}" → "${source}"`);
        if (dstMatch.corrected) corrections.push(`"${rawDst}" → "${destination}"`);
        correctionNotice = `Spelling corrected: ${corrections.join(', ')}`;
      }

      // Find matching route
      const found = COIMBATORE_BUS_ROUTES.find(
        (r) =>
          (r.origin.toLowerCase().includes(source!.toLowerCase()) || r.stops.some((st) => st.toLowerCase().includes(source!.toLowerCase()))) &&
          (r.destination.toLowerCase().includes(destination!.toLowerCase()) || r.stops.some((st) => st.toLowerCase().includes(destination!.toLowerCase())))
      );

      if (found) {
        replyText = `Found ${found.name} (${found.routeNumber}) from ${source} to ${destination}. Travel time is ${found.durationMinutes} mins, fare ${found.fare}.`;
      } else {
        replyText = `Displaying available bus routes connecting ${source} and ${destination}.`;
      }

      return {
        intent: detectedIntent,
        source,
        destination,
        correctionNotice,
        rawText: raw,
        validationStatus: 'VALID',
        replyText,
      };
    }

    // "Which bus goes to [destination]" pattern
    const whichBusMatch = lower.match(/(?:which|what)\s+bus\s+(?:goes\s+to|takes\s+me\s+to|to)\s+([a-z\s]+)/i);
    if (whichBusMatch) {
      detectedIntent = 'ROUTE_SEARCH';
      const rawDest = whichBusMatch[1].trim();
      const dstMatch = this.fuzzyMatchStop(rawDest);
      destination = dstMatch.matchedName;

      if (dstMatch.corrected) {
        correctionNotice = `Spelling corrected: "${rawDest}" → "${destination}"`;
      }

      const matchingRoutes = COIMBATORE_BUS_ROUTES.filter(
        (r) => r.destination.toLowerCase().includes(destination!.toLowerCase()) || r.stops.some((st) => st.toLowerCase().includes(destination!.toLowerCase()))
      );

      if (matchingRoutes.length > 0) {
        const routeNames = matchingRoutes.map((r) => r.routeNumber).join(', ');
        replyText = `Buses going to ${destination}: Routes ${routeNames}.`;
      } else {
        replyText = `Checking routes connected to ${destination}. Opening route search.`;
      }

      return {
        intent: detectedIntent,
        destination,
        correctionNotice,
        rawText: raw,
        validationStatus: 'VALID',
        replyText,
      };
    }

    // Fallback: If contains known stop or "route"
    for (const item of this.knownStops) {
      for (const alias of item.aliases) {
        if (lower.includes(alias)) {
          detectedIntent = 'ROUTE_SEARCH';
          destination = item.canonical;
          replyText = `Found transit routes connected to ${destination}.`;
          return {
            intent: detectedIntent,
            destination,
            rawText: raw,
            validationStatus: 'VALID',
            replyText,
          };
        }
      }
    }

    // Default: UNKNOWN
    return {
      intent: 'UNKNOWN',
      rawText: raw,
      validationStatus: 'VALID',
      replyText: `Received command: "${raw}". Querying Coimbatore transit timetable.`,
    };
  }
}

export const intentService = new IntentService();
