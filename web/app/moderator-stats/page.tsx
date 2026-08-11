import Link from 'next/link';
import { BlockNames } from '@/lib/blocks';
import { moderators } from '@/lib/moderators';

export default function ModeratorsPage() {
  return (
    <div className="w-full h-full overflow-y-auto text-neutral-300">
      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-neutral-400">
              See{' '}
              <Link href="/#moderator-stats" className="text-sm text-blue-300 underline hover:text-neutral-300">
                how moderator stats work
              </Link>{' '}
              for an explanation of each property.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-neutral-300 border-b border-neutral-700">
                <tr>
                  <th className="py-2 pr-4">Moderator</th>
                  <th className="py-2 px-2 text-center">Absorption</th>
                  <th className="py-2 px-2 text-center">Heat Efficiency</th>
                  <th className="py-2 px-2 text-center">Moderation</th>
                  <th className="py-2 px-2 text-center">Heat Conductivity</th>
                </tr>
              </thead>

              <tbody className="text-neutral-400 tabular-nums">
                {[...moderators.entries()].map(([block, data], index, entries) => (
                  <tr key={block} className={index !== entries.length - 1 ? 'border-b border-neutral-800' : ''}>
                    <td className="py-2 pr-4 text-white">{BlockNames.get(block)}</td>

                    <td className="px-2 text-center">{data.absorption.toFixed(2)}</td>

                    <td className="px-2 text-center">{data.heatEfficiency.toFixed(2)}</td>

                    <td className="px-2 text-center">{(1 / data.inverseModeration).toFixed(2)}</td>

                    <td className="px-2 text-center">{data.heatConductivity.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
