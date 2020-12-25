import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { LocalContext } from '../LocalContext';
import { Parser } from '../Components/renderers';

export default function View() {
  const { loggedInUser, posts, myPosts } = useContext(LocalContext);

  const [blogPost, setBlogPost] = useState({});

  const history = useHistory();
  const { username, slug } = useParams();

  useEffect(() => {
    if (!loggedInUser.username || loggedInUser.username === undefined) {
      history.push('/');
    }

    if (!username || username === undefined || !slug || slug === undefined) {
      history.push('/');
    }

    if (username === loggedInUser.username) {
      myPosts.forEach((p) => {
        if (p.slug === slug) {
          setBlogPost({ ...p });
        }
      });
    } else {
      posts.forEach((p) => {
        if (p.slug === slug) {
          setBlogPost({ ...p });
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-full flex flex-col items-center sm:px-20 px-2">
      <div className="w-full flex flex-col mt-4 bg-gray-900 sm:p-2 p-2 rounded-lg sm:items-end items-center">
        <div className="w-full rounded-lg sm:text-sm text-xs text-gray-300 p-2 h-full">
          <Parser content={blogPost.content} />
        </div>
      </div>
    </div>
  );
}
