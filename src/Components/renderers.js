import React from 'react';

import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const htmlParser = require('react-markdown/plugins/html-parser');

const heading = (props) => {
  return (
    <div
      className={`font-bold tracking-wider text-${
        6 - props.level
      }xl text-gray-200 sm:my-4 my-2`}
    >
      {props.children}
    </div>
  );
};

const link = (props) => {
  return (
    <a
      href={props.href}
      className="text-blue-300 bg-blue-900 underline text-sm"
    >
      {props.children}
    </a>
  );
};

const text = (props) => {
  return (
    <span className="text-gray-300" style={{ whiteSpace: 'pre-line' }}>
      {props.children}
    </span>
  );
};

const list = (props) => {
  return <ul className="list-disc pl-8 my-4 text-sm">{props.children}</ul>;
};

const listItem = (props) => {
  return <li className="text-blue-300 text-sm">{props.children}</li>;
};

const code = (props) => {
  return (
    <div
      className="text-blue-300 font-mono p-1 bg-gray-900 rounded-lg border-2 border-gray-500 text-xs tracking-wider my-2 overflow-x-scroll"
      style={{ whiteSpace: 'pre' }}
    >
      {props.node.value}
    </div>
  );
};

const inlineCode = (props) => {
  return (
    <span
      className="text-blue-500 font-mono p-1 text-xs tracking-wider"
      style={{ whiteSpace: 'pre' }}
    >
      {props.node.value}
    </span>
  );
};

const image = (props) => {
  return (
    <span className="w-full flex flex-col justify-center items-center my-2">
      <img
        src={props.src}
        alt={props.alt}
        className="sm:max-w-2xl sm:max-h-2xl max-w-xs max-h-xs object-scale-down rounded p-1 border-2 border-blue-400"
      />
    </span>
  );
};

const blockquote = (props) => {
  return (
    <div className="rounded py-1 px-2 bg-gray-800 w-full">
      <div className="w-full border-l-4 border-gray-100 pl-2 text-sm my-2">
        {props.children}
      </div>
    </div>
  );
};

const renderers = {
  heading: heading,
  link: link,
  text: text,
  list: list,
  listItem: listItem,
  code: code,
  inlineCode: inlineCode,
  image: image,
  blockquote: blockquote,
};

// eslint-disable-next-line
const parseHtml = htmlParser({
  isValidNode: (node) => node.type !== 'script',
  processingInstructions: [
    /* ... */
  ],
});

export const Parser = ({ content }) => (
  <ReactMarkdown
    source={content}
    renderers={renderers}
    escapeHtml={false}
    astPlugins={[parseHtml]}
    parserOptions={{ commonmark: true }}
    plugins={[gfm]}
  />
);
