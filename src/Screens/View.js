import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { LocalContext } from '../LocalContext';
import { Parser } from '../Components/renderers';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function View() {
  const { UPLOADSURL, loggedInUser, posts, myPosts, blogProfiles } = useContext(
    LocalContext
  );

  const [blogPost, setBlogPost] = useState(undefined);
  const [blogProfile, setBlogProfile] = useState(undefined);

  const history = useHistory();
  const { username, slug } = useParams();

  useEffect(() => {
    if (!loggedInUser.username || loggedInUser.username === undefined) {
      history.push('/');
    }

    if (!username || username === undefined || !slug || slug === undefined) {
      history.push('/');
    }

    [...posts, ...myPosts].forEach((p) => {
      if (p.slug === slug) {
        setBlogPost({ ...p });
      }
    });

    [loggedInUser, ...blogProfiles].forEach((u) => {
      if (u.username === username) {
        setBlogProfile({ ...u });
      }
    });
    // eslint-disable-next-line
  }, []);

  const convertDate = (date) => {
    const oldDate = new Date(date);
    return new Date(
      Date.UTC(
        oldDate.getFullYear(),
        oldDate.getMonth(),
        oldDate.getDate(),
        oldDate.getHours(),
        oldDate.getMinutes(),
        oldDate.getSeconds()
      )
    ).toString();
  };

  return blogPost &&
    blogPost !== undefined &&
    blogProfile &&
    blogProfile !== undefined ? (
    <div className="w-full flex flex-col items-center sm:px-20 px-2">
      <div className="sm:w-1/4 w-full bg-gray-700 rounded-lg mt-2 flex p-2 border-2 border-gray-900">
        <div className="w-1/5 h-full flex justify-center items-center">
          <img
            src={
              blogProfile.profile_pic &&
              blogProfile.profile_pic !== undefined &&
              blogProfile.profile_pic.length > 3
                ? `${UPLOADSURL}/${blogProfile.profile_pic}`
                : tmpAvatar
            }
            alt="p.pic"
            className="sm:h-16 sm:w-16 h-10 w-10 z-0 object-cover border-2 border-blue-400 rounded-full"
          />
        </div>
        <div className="flex-1 flex-col w-full">
          <div className="w-full flex items-center">
            <div className="flex-1 text-left text-blue-500 font-open sm:text-lg text-sm bg-gray-900 hover:bg-blue-900 focus:bg-blue-900 px-2 rounded-lg">
              {blogProfile.username.length > 12
                ? `${blogProfile.username.substring(0, 12)}...`
                : blogProfile.username}
            </div>
            <div
              title={1 === 1 ? 'Follow user' : 'Unfollow user'}
              className={`sm:w-10 sm:h-10 w-6 h-6 flex items-center justify-center ri-user-${
                1 === 1 ? 'add' : 'unfollow'
              }-fill mx-2 sm:text-lg text-sm text-${
                1 === 1 ? 'blue' : 'red'
              }-400 hover:bg-gray-900 focus:bg-gray-900 p-2 rounded-full`}
            ></div>
          </div>
          <div className="w-full text-left text-blue-200 font-open sm:text-md text-xs ml-2 mt-1">
            Posted on{' '}
            {convertDate(blogPost.created_on).split(' ').slice(0, 5).join(' ')}
          </div>
          <div className="w-full text-left text-blue-200 font-open sm:text-md text-xs ml-2 mt-1">
            Last modification on{' '}
            {convertDate(blogPost.updated_on).split(' ').slice(0, 5).join(' ')}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col my-2 bg-gray-900 sm:p-2 p-2 rounded-lg sm:items-end items-center">
        <div className="w-full rounded-lg sm:text-sm text-xs text-gray-300 p-2 h-full">
          <Parser content={blogPost.content} />
        </div>
      </div>
    </div>
  ) : null;
}
