import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import axios from 'axios';
import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';
import { Parser } from '../Components/renderers';

import { v4 } from 'uuid';

export default function Creator() {
  const {
    APIURL,
    UPLOADSURL,
    loggedInUser,
    myPosts,
    setMyPosts,
    setWidth,
  } = useContext(LocalContext);

  const [blogID, setBlogID] = useState(v4());

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tags, setTags] = useState('');

  const [slug, setSlug] = useState('');

  const [content, setContent] = useState('');
  const [previewImage, setPreviewImage] = useState('_empty');

  const history = useHistory();
  const alert = useAlert();

  const { id } = useParams();

  useEffect(() => {
    setWidth(100);

    if (!loggedInUser.username || loggedInUser.username === undefined) {
      history.push('/admin');
    }

    const data = [
      '# This is Markdown',
      ' ',
      '#### You can edit me!',
      ' ',
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

    setContent(data.join('\r\n'));

    if (id && id !== undefined) {
      myPosts.forEach((p) => {
        if (p.blogID === id) {
          setBlogID(id);
          setTitle(p.title);
          setSubtitle(p.subtitle);
          setTags(p.tags);
          setSlug(p.slug);
          setPreviewImage(p.preview_img);
          setContent(p.content);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!id || id === undefined) {
      setSlug(
        (title.split(' ').join('-').toString() + '-' + blogID.slice(-10))
          .toString()
          .toLowerCase()
      );
    }
    // eslint-disable-next-line
  }, [title]);

  const uploadImage = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 5000000) {
        alert.error('File too large!');
      } else {
        e.preventDefault();

        const data = new FormData();
        data.append('file', e.target.files[0]);

        axios.post(`${APIURL}/api/user/upload`, data).then((res) => {
          setPreviewImage(`${UPLOADSURL}/${res.data.url}`);

          axios.post(
            `${APIURL}/api/links/create`,
            { uid: loggedInUser.uid, link: res.data.url, linkID: v4() },
            { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
          );
        });
      }
    }
  };

  const checkValid = () => {
    return (
      title &&
      title.length > 3 &&
      subtitle &&
      subtitle.length > 3 &&
      tags &&
      tags.length > 3 &&
      slug &&
      slug.length > 3 &&
      content &&
      content.length > 3
    );
  };

  const savePost = (e) => {
    let refPost = undefined;
    if (id && id !== undefined) {
      myPosts.forEach((p) => {
        if (p.blogID === id) {
          refPost = { ...p };
        }
      });
    }

    let d = new Date();
    const timestamp = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );

    const data = {
      uid: loggedInUser.uid,
      authorID: loggedInUser.uid,
      blogID: blogID,
      title: title,
      subtitle: subtitle,
      slug: refPost !== undefined ? refPost.slug : slug,
      preview_img: previewImage,
      status: refPost !== undefined ? refPost.status : 'DRAFT',
      tags: tags,
      created_on: refPost !== undefined ? refPost.created_on : timestamp,
      updated_on: timestamp,
      content: content,
    };

    axios
      .post(
        `${APIURL}/api/blog/post/${refPost !== undefined ? 'edit' : 'create'}`,
        { ...data },
        { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
      )
      .then((res) => {
        if (res.data.error === 0) {
          alert.success(
            `Successfully ${refPost !== undefined ? 'Edited' : 'Created'}!`
          );
        } else {
          console.log(res.data);
        }
      });

    if (id && id !== undefined) {
      setMyPosts((prev) =>
        prev.map((p) => {
          if (p.blogID === id) {
            return { ...data };
          } else {
            return { ...p };
          }
        })
      );
    } else {
      setMyPosts((prev) => [...prev, { ...data }]);
    }

    history.push('/admin');
  };

  const reset = () => {
    setBlogID('');
    setTitle('');
    setContent('');
    setSubtitle('');
    setPreviewImage('');

    history.push('/admin');
  };

  return (
    <div className="w-full flex flex-col items-center sm:px-20 px-2">
      <div className="w-full flex flex-col sm:mt-8 mt-4 bg-gray-900 sm:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center">
          <div className="sm:w-1/3 w-11/12 sm:text-left text-center sm:text-2xl sm:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 sm:my-0 my-2">
            Title
          </div>

          <div className="sm:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <input
              type="text"
              id="title"
              className="w-full rounded-lg sm:p-2 p-1 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-2 border-blue-200 sm:text-md text-sm"
              placeholder="Type something..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        {title && (
          <div className="sm:w-49/100 w-11/12 font-sans sm:text-xs text-xss text-green-300 sm:text-left sm:mt-2 mt-4">
            Blog post will be available on{' '}
            <a
              href={`https://blog.connect.kinesis.games/${loggedInUser.username}/${slug}`}
              target="_blank"
              rel="noopenner noreferrer"
              className="underline text-blue-300 hover:no-underline focus:no-underline"
            >
              https://blog.connect.kinesis.games/{loggedInUser.username}/{slug}
            </a>{' '}
            after you publish it.
          </div>
        )}
      </div>

      <div className="w-full flex flex-col mt-4 bg-gray-900 sm:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center">
          <div className="sm:w-1/3 w-11/12 sm:text-left text-center sm:text-2xl sm:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 sm:my-0 my-2">
            Subtitle
          </div>

          <div className="sm:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <input
              type="text"
              id="subtitle"
              className="w-full rounded-lg sm:p-2 p-1 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-2 border-blue-200 sm:text-md text-sm"
              placeholder="Type something..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col mt-4 bg-gray-900 sm:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center">
          <div className="sm:w-1/3 w-11/12 sm:text-left text-center sm:text-2xl sm:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 sm:my-0 my-2">
            Comma-separated tags
          </div>

          <div className="sm:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <input
              type="text"
              id="tags"
              className="w-full rounded-lg sm:p-2 p-1 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-2 border-blue-200 sm:text-md text-sm"
              placeholder="e.g docker, ansible, automation"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col mt-4 bg-gray-900 sm:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center">
          <div className="sm:w-1/3 w-11/12 sm:text-left text-center sm:text-2xl sm:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 sm:my-0 my-2">
            Preview Image (optional)
          </div>

          <div className="sm:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <input
              type="file"
              id="preview"
              className="w-full rounded-lg p-1 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-2 border-blue-200 sm:text-md text-sm"
              onChange={(e) => {
                e.persist();
                uploadImage(e);
              }}
            />
          </div>
        </div>

        {previewImage !== '_empty' && previewImage.length > 10 && (
          <div className="sm:w-49/100 w-11/12 font-sans sm:text-sm text-xs text-green-300 sm:text-left sm:mt-2 mt-4 flex flex-col items-center">
            <img
              src={previewImage}
              alt="preview"
              className="w-full object-scale-down"
            />
            <button
              className="sm:w-1/3 w-4/5 bg-red-300 hover:bg-red-400 focus:bg-red-400 rounded-lg mt-2 sm:text-lg text-sm font-sans text-gray-900 p-2"
              onClick={() => setPreviewImage('_empty')}
            >
              Remove Preview
            </button>
          </div>
        )}
      </div>

      <div className="h-full w-full bg-gray-800 flex sm:flex-row flex-col justify-between items-center mt-4">
        <div className="sm:w-49/100 w-full">
          <div className="w-full sm:text-3xl text-xl font-sans font-bold tracking-wider text-gray-300 sm:mb-2">
            Content
          </div>

          <textarea
            className="w-full sm:my-0 my-2 rounded-lg sm:text-sm text-xs bg-gray-900 text-gray-300 p-4 placeholder-gray-500 overflow-y-scroll"
            value={content}
            placeholder="Write something..."
            onChange={(e) => setContent(e.target.value)}
            style={{ height: '30rem', minHeight: '20rem', maxHeight: '40rem' }}
          />
        </div>

        <div className="sm:w-49/100 w-full">
          <div className="w-full sm:text-3xl text-xl font-sans font-bold tracking-wider text-gray-300 sm:mb-2">
            Preview
          </div>

          <div
            className="w-full sm:my-0 my-2 rounded-lg sm:text-sm text-xs bg-gray-700 text-gray-300 p-4 overflow-y-scroll"
            style={{ height: '30rem', minHeight: '20rem', maxHeight: '40rem' }}
          >
            <Parser content={content} />
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-800 flex sm:flex-row flex-col justify-around items-center mt-4 mb-4">
        {/* <button className="sm:w-1/4 w-5/6 p-2 font-rale tracking-wide font-sans sm:text-lg text-sm rounded-lg bg-blue-400 hover:bg-blue-500 focus:bg-blue-500">
          Save as Draft
        </button>
        <button className="sm:w-1/4 w-5/6 p-2 font-rale tracking-wide font-sans sm:text-lg text-sm rounded-lg bg-green-400 hover:bg-green-500 focus:bg-green-500 sm:mt-0 mt-2">
          Publish
        </button> */}

        <button
          className={`sm:w-1/4 w-5/6 p-2 font-rale tracking-wide font-sans sm:text-lg text-sm rounded-lg bg-green-400 ${
            checkValid()
              ? 'hover:bg-green-500 focus:bg-green-500'
              : 'opacity-50'
          }`}
          onClick={() => (checkValid() ? savePost() : null)}
        >
          Save
        </button>

        <button
          className="sm:w-1/4 w-5/6 p-2 font-rale tracking-wide font-sans sm:text-lg text-sm rounded-lg bg-red-400 hover:bg-red-500 focus:bg-red-500 sm:mt-0 mt-2"
          onClick={() => reset()}
        >
          Discard
        </button>
      </div>
    </div>
  );
}
