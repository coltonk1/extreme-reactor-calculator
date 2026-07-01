'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const reactor = searchParams.get('reactor');

    if (reactor) {
      router.replace(`/calculator?reactor=${encodeURIComponent(reactor)}`);
    }
  }, [router, searchParams]);

  return (
    <main className="w-full overflow-y-auto h-full text-neutral-300">
      <section className="w-full text-center px-6 py-20 hero-gradient">
        <div className="md:hidden max-w-md mx-auto rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
          <p className="text-sm text-red-200">
            <span className="font-medium">Desktop required.</span> The calculator is designed for larger screens and is not currently supported on mobile devices.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-neutral-100 font-semibold text-4xl sm:text-5xl">Extreme Reactors 2 Calculator</h1>

          <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
            Plan, simulate, and optimize Extreme Reactors 2 builds in your browser. Adjust dimensions, place blocks, and view heat, power, and fuel usage in real time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-fit mx-auto font-medium">
            <Link href="/calculator" className="bg-blue-500 text-white rounded-md px-6 py-3 shadow-md hover:opacity-80 transition-opacity">
              Open Calculator
            </Link>

            <Link
              href="https://github.com/coltonk1/extreme-reactor-calculator"
              target="_blank"
              className="px-6 py-3 text-neutral-400 bg-neutral-900 rounded-md shadow-md hover:text-neutral-200 hover:border-neutral-700 transition-colors"
            >
              View GitHub
            </Link>
          </div>

          <p className="text-neutral-500 text-sm">MIT Licensed • Open Source on GitHub</p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-sm overflow-hidden shadow-md w-full">
            <Image src={'/overview.png'} loading="eager" width={1920} height={1080} alt="Extreme Reactors 2 Calculator overview" />
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-white">What is Extreme Reactors 2?</h2>

          <p>
            Extreme Reactors 2 is a Minecraft technology mod that allows players to generate large amounts of RF/t and steam using configurable multiblock reactors. Reactor performance depends on
            factors such as dimensions, internal block layout, control rod insertion, and operating conditions.
          </p>

          <p>
            Designing an efficient reactor often requires balancing power production, fuel consumption, heat generation, and material cost. This calculator helps players experiment with different
            reactor designs before building them in-game.
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-8">Features</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['Real-time simulation', 'View RF/t, steam production, heat, and fuel usage as you adjust the reactor layout.'],
              ['Reactor optimization', 'Automatically optimize control rod insertion to maximize power output or fuel efficiency.'],
              ['Power & steam calculations', 'Estimate RF/t and steam generation for different reactor configurations.'],
              ['Material breakdown', 'View the complete list of blocks and crafting materials required to build your reactor.'],
              ['Shareable reactor links', 'Copy and share complete reactor configurations using a single URL.'],
              ['Open source', 'Review the implementation, report issues, or contribute on GitHub.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
                <h3 className="font-medium text-white mb-2">{title}</h3>
                <p className="text-sm text-neutral-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto flex gap-10 items-center flex-col md:flex-row">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">How it works</h2>
            <p>
              Open the calculator, choose your reactor dimensions, place blocks, and adjust the configuration. The simulator updates the results immediately so you can compare different designs
              without rebuilding the reactor repeatedly in Minecraft.
            </p>
            <p>Use it to test layouts, tune performance, compare fuel efficiency, and generate a shareable link for your reactor setup.</p>
          </div>

          <div className="flex gap-10 w-full justify-center">
            <div className="rounded-sm overflow-hidden shadow-md h-30 w-30 md:h-50 md:w-50 shrink-0">
              <Image src={'/reactor-example.png'} loading="eager" width={288} height={288} className="w-full h-full" alt="Smaller reactor example" />
            </div>
            <div className="rounded-sm overflow-hidden shadow-md h-30 w-30 md:h-50 md:w-50 shrink-0">
              <Image src={'/reactor-example2.png'} loading="eager" width={544} height={544} className="w-full h-full" alt="Larger random reactor example" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-white">About the project</h2>

          <p>
            This project is inspired by the original Big Reactors planner at{' '}
            <Link href="https://br.sidoh.org/" target="_blank" className="underline text-blue-400 hover:text-blue-300">
              br.sidoh.org
            </Link>
            , reimagined for Extreme Reactors 2 with a modern interface and implementation.
          </p>

          <p>
            It incorporates logic and structure from{' '}
            <Link href="https://github.com/ZeroNoRyouki/ExtremeReactors2" target="_blank" className="underline text-blue-400 hover:text-blue-300">
              Extreme Reactors 2
            </Link>
            . It also includes textures from Extreme Reactors 2 and{' '}
            <Link href="https://github.com/mekanism/Mekanism" target="_blank" className="underline text-blue-400 hover:text-blue-300">
              Mekanism
            </Link>
            , both under the MIT License.
          </p>

          <h3 className="text-xl font-medium text-neutral-100">Why use an Extreme Reactors 2 calculator?</h3>
          <p>
            Extreme Reactors 2 reactors can be difficult to tune by trial and error because small layout changes can affect heat, fuel usage, RF/t generation, and steam production. This calculator
            lets you compare reactor designs before building them in Minecraft, helping you optimize performance while saving time and resources.
          </p>

          <p>
            Use it as an ER2 reactor planner, reactor simulator, power calculator, steam calculator, fuel efficiency calculator, and material cost estimator. Reactor designs can also be shared with
            friends or the wider community using a single shareable link, making it easy to collaborate, compare layouts, and showcase optimized builds.
          </p>

          <h3 className="text-xl font-medium text-white">Why do some textures look different?</h3>

          <p>
            To avoid redistributing copyrighted game assets, some textures have been recreated or simplified using original artwork. This allows the project to remain fully open source under the MIT
            License while preserving the functionality of the calculator.
          </p>

          <p>
            Vanilla Minecraft style blocks use original textures inspired by the source material, while some mod specific blocks are represented with simple placeholder textures. These visual
            differences do not affect the accuracy of the reactor simulation or calculations.
          </p>

          <h3 className="text-xl font-medium text-white">Learn more about Extreme Reactors 2</h3>

          <p>
            This calculator is designed to help plan and simulate reactor designs, but it does not attempt to explain every mechanic of Extreme Reactors 2. If you want to learn more about reactor
            mechanics, blocks, or gameplay, the in game documentation is the best place to start.
          </p>

          <p>
            For those interested in the technical implementation, the calculator is fully open source and much of the simulation logic is based on the official Extreme Reactors 2 source code.
            Exploring the source code is a great way to understand how the simulator works and how reactor calculations are performed.
          </p>

          <div className="space-y-2 text-neutral-400">
            <p>
              <Link href="https://github.com/coltonk1/extreme-reactor-calculator" target="_blank" className="text-blue-400 hover:text-blue-300">
                Calculator Source Code
              </Link>
            </p>

            <p>
              <Link href="https://github.com/ZeroNoRyouki/ExtremeReactors2" target="_blank" className="text-blue-400 hover:text-blue-300">
                Extreme Reactors 2 Source Code
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-white">Questions or Feedback</h2>

          <p>
            Found a bug, have a feature request, or want to discuss the project? GitHub Issues are the best place for bug reports and feature requests. For general questions or feedback about the
            calculator, feel free to contact me directly.
          </p>

          <div className="space-y-2 text-neutral-400">
            <p>
              Email:{' '}
              <Link href="mailto:coltonkaraffa@gmail.com" className="text-blue-400 hover:text-blue-300">
                coltonkaraffa@gmail.com
              </Link>
            </p>

            <p>
              <Link href="https://github.com/coltonk1/extreme-reactor-calculator/issues" target="_blank" className="text-blue-400 hover:text-blue-300">
                GitHub Issue Tracker
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-white">FAQ</h2>

          <div className="space-y-5">
            <div>
              <h3 className="font-medium text-white">Is this calculator free?</h3>
              <p className="text-neutral-400">Yes. The calculator is free and open source under the MIT License.</p>
            </div>
            <div>
              <h3 className="font-medium text-white">Does the calculator work on mobile?</h3>
              <p className="text-neutral-400">The calculator is currently designed for desktop browsers. Mobile devices are not supported.</p>
            </div>
            <div>
              <h3 className="font-medium text-white">Does the calculator run locally?</h3>
              <p className="text-neutral-400">Reactor calculations run in your browser. Anonymous analytics may be used to understand site traffic.</p>
            </div>

            <div>
              <h3 className="font-medium text-white">Can I share a reactor design?</h3>
              <p className="text-neutral-400">Yes. Reactor configurations can be shared through generated URLs or images.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-white">Ready to get started?</h2>

          <p className="text-neutral-400">Open the calculator to design, simulate, and optimize your next Extreme Reactors 2 reactor.</p>

          <Link href="/calculator" className="inline-block bg-blue-500 text-white rounded-md px-6 py-3 shadow-md hover:opacity-80 transition-opacity">
            Open Calculator
          </Link>
        </div>
      </section>
    </main>
  );
}
