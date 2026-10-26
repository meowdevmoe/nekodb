'use client';

import { CheckIcon, CopyIcon } from '@primer/octicons-react';
import { useState } from 'react';

/** Markdown / HTML code for a widget, with a copy button. */
export function Snippet({ markdown, html }: { markdown: string; html: string }) {
  const [kind, setKind] = useState<'markdown' | 'html'>('markdown');
  const [copied, setCopied] = useState(false);
  const code = kind === 'markdown' ? markdown : html;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div>
      <div className="snippet-tabs" role="tablist">
        <button role="tab" aria-selected={kind === 'markdown'} onClick={() => setKind('markdown')}>Markdown</button>
        <button role="tab" aria-selected={kind === 'html'} onClick={() => setKind('html')}>HTML</button>
      </div>
      <div className="snippet">
        <pre><code>{code}</code></pre>
        <button className="btn btn-sm copy" onClick={copy} aria-label="Copy to clipboard">
          {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
      </div>
    </div>
  );
}
