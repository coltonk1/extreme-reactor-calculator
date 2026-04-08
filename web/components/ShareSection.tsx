import { BlockIds } from '@/lib/blocks';
import { Reactor } from '@/lib/reactor_simulation';
import { toBlob } from 'html-to-image';
import { compressToEncodedURIComponent } from 'lz-string';
import { useState } from 'react';

export default function ShareSection({ reactor }: { reactor: Reactor }) {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);

  const copyMapAsImage = async () => {
    const node = document.getElementById('reactor-map');
    if (!node) return;

    node.style.fontFamily = 'system-ui';

    const blob = await toBlob(node, {
      fontEmbedCSS: '',
      skipFonts: true,
      style: {
        margin: '0',
      },
    });

    if (!blob) return;

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="py-2 text-sm bg-blue-500 rounded-md w-full font-semibold cursor-pointer hover:opacity-80"
        onClick={async () => {
          if (copyingImage) return;

          setCopyingImage(true);

          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);

          await copyMapAsImage();

          setCopiedImage(true);
          setCopyingImage(false);

          setTimeout(() => {
            setCopiedImage(false);
          }, 800);
        }}
      >
        {copyingImage ? 'Copying...' : copiedImage ? 'Image Copied!' : copiedImage ? 'Image Copied!' : 'Copy Image of Reactor'}
      </button>
      <button
        className="py-2 px-4 text-sm bg-blue-500 rounded-md w-full font-semibold cursor-pointer hover:opacity-80"
        onClick={() => {
          const numericMap = reactor.getReactorMap().map(row => row.map(block => BlockIds[block]));

          const reactorPayload = {
            map: numericMap,
            ratio: reactor.getInsertionRatio(),
            width: reactor.width,
            depth: reactor.depth,
            height: reactor.height,
          };

          const encoded = compressToEncodedURIComponent(JSON.stringify(reactorPayload));

          const shareUrl = `${window.location.origin}/?reactor=${encoded}`;

          navigator.clipboard.writeText(shareUrl);

          setCopied(true);

          setTimeout(() => {
            setCopied(false);
          }, 800);
        }}
      >
        {copied ? 'URL Copied!' : 'Copy Share Link'}
      </button>
    </div>
  );
}
