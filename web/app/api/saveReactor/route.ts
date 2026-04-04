import { Block, Fuel, Reactor } from '@/lib/reactor_simulation';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  process.loadEnvFile();
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables.');
    return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
  }

  const sql = neon(DATABASE_URL);
  const { reactor: reactorString, timestamp } = await request.json();

  if (!reactorString || !timestamp) {
    console.error('Invalid request body:', { reactorString, timestamp });
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.error('Invalid timestamp:', timestamp);
    return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 });
  }

  try {
    const decoded = JSON.parse(decompressFromEncodedURIComponent(reactorString));
    const { map, ratio, width, depth, height } = decoded;
    const reactor = new Reactor(width, depth, height, 0, Fuel.Uranium);

    map.forEach((row: number[], z: number) => {
      row.forEach((blockId: number, x: number) => {
        reactor.setCol(z, x, Object.values(Block)[blockId]);
      });
    });

    reactor.simulate();

    try {
      await sql`INSERT INTO reactors (reactor, timestamp, fuel_heat, reactor_heat, total_energy, fuel_usage, width, height, depth) VALUES (${reactorString}, ${date}, ${reactor.getFuelHeat()}, ${reactor.getReactorHeat()}, ${reactor.getTotalEnergy()}, ${reactor.getFuelUsage()}, ${width}, ${height}, ${depth})`;
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === '23505') {
        return NextResponse.json({}, { status: 200 });
      }
      console.error('Failed to save reactor:', e);
      return NextResponse.json({ error: 'Failed to save reactor' }, { status: 500 });
    }
  } catch (e) {
    console.error('Failed to load reactor:', e);
    return NextResponse.json({ error: 'Failed to load reactor' }, { status: 500 });
  }

  return NextResponse.json({}, { status: 200 });
}
