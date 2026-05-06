import Link from 'next/link';

export const metadata = {
  title: 'About | Extreme Reactors 2 Calculator',
  description: 'Learn how the Extreme Reactors 2 Calculator works, including reactor simulation, power calculations, and optimization features.',
};

export default function AboutPage() {
  return (
    <main className="w-full overflow-y-auto h-full">
      <div className="max-w-3xl w-full mx-auto px-6 py-10 text-neutral-300 space-y-6 ">
        <div>
          <h1 className="text-xl font-semibold text-white">Extreme Reactors 2 Calculator</h1>
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
            Open tool →
          </Link>
        </div>

        <p>
          A tool for building and simulating{' '}
          <Link href="https://www.curseforge.com/minecraft/mc-mods/extreme-reactors" target="_blank" className="underline text-blue-500 hover:text-blue-400">
            Extreme Reactors 2
          </Link>{' '}
          reactors.
        </p>

        <p>
          This is an interactive planner for designing reactor layouts in the Extreme Reactors 2 Minecraft mod. It allows you to experiment with different configurations and analyze performance before
          building in-game.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">What this tool does</h2>
          <p>The calculator simulates reactor behavior based on layout and configuration, providing real-time feedback on power output, heat, and fuel usage.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Inspiration</h2>
          <p>
            This project is inspired by the original Big Reactors planner at{' '}
            <Link href="https://br.sidoh.org/" target="_blank" className="underline text-blue-500 hover:text-blue-400">
              br.sidoh.org
            </Link>
            , reimagined for Extreme Reactors 2 with a modern interface and implementation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Credits</h2>
          <p>
            This project incorporates logic and structure from{' '}
            <Link href="https://github.com/ZeroNoRyouki/ExtremeReactors2" target="_blank" className="underline text-blue-500 hover:text-blue-400">
              Extreme Reactors 2
            </Link>
            .
          </p>
          <p>
            It also includes textures from Extreme Reactors 2 and{' '}
            <Link href="https://github.com/mekanism/Mekanism" target="_blank" className="underline text-blue-500 hover:text-blue-400">
              Mekanism
            </Link>{' '}
            (both under the MIT License).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Contributing</h2>
          <p>
            Contributions are welcome. Suggestions, improvements, performance optimizations, additional moderator support, simulation accuracy updates, and UI refinements are all appropriate areas for
            contribution.
          </p>
          <p>Please open an issue to discuss proposed changes before submitting large modifications.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">License</h2>
          <p>
            This project is released under the MIT License. See the{' '}
            <Link href="https://github.com/coltonk1/extreme-reactor-calculator/blob/master/LICENSE.md" target="_blank" className="underline text-blue-500 hover:text-blue-400">
              LICENSE file
            </Link>{' '}
            for full details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>

          <p>
            For bugs, suggestions, or feature requests, please use the{' '}
            <Link href="https://github.com/coltonk1/extreme-reactor-calculator/issues" target="_blank" className="underline text-blue-500 hover:text-blue-400">
              issue tracker
            </Link>
            .
          </p>

          <p className="mt-3 text-sm text-neutral-400">For other inquiries, you can reach out directly:</p>

          <div className="text-sm text-neutral-400">
            <p>
              Email:{' '}
              <Link href="mailto:coltonkaraffa@gmail.com" className="hover:text-neutral-200">
                coltonkaraffa@gmail.com
              </Link>
            </p>
            <p>Discord: duck681</p>
          </div>
        </section>

        <div className="pt-6">
          <Link href="/" className="inline-block w-full text-center py-2 text-sm font-medium rounded bg-blue-500 text-blue-950 hover:opacity-80 transition-opacity">
            Open Calculator
          </Link>
        </div>
      </div>
    </main>
  );
}
