import React, { useEffect, useState } from 'react';

import { Parser } from '../Components/renderers';

export default function Creator() {
  const [input, setInput] = useState();

  useEffect(() => {
    const data = [
      '# This is Markdown',
      '#### You can edit me!',
      'Markdown lets you write content in a really natural way.',
      ' ',
      '* You can have lists, like this one',
      '* Make things **bold** or *italic*',
      '* Embed snippets of `code`',
      '* Create [links](https://hub.kinesis.games)',
      ' ',
      '> A block quote with ~strikethrough~ and a URL: https://hub.kinesis.games.',
      ' ',
      '```js',
      'const sayHelloWorld = () => {',
      "    console.log('Hello World!');",
      '}',
      ' ',
      'sayHelloWorld();',
      '```',
    ];

    setInput(data.join('\r\n'));
  }, []);

  return (
    <div className="h-11/12 w-full bg-gray-800 flex sm:flex-row flex-col justify-around items-center">
      <textarea
        className="sm:w-9/20 w-5/6 sm:h-4/5 sm:my-0 my-2 rounded-lg sm:text-sm text-xs bg-gray-900 text-gray-300 p-4"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="sm:w-9/20 w-5/6 sm:h-4/5 sm:my-0 my-2 rounded-lg sm:text-sm text-xs bg-gray-700 text-gray-300 p-4 sm:overflow-y-scroll">
        <Parser content={input} />
      </div>
    </div>
  );
}
