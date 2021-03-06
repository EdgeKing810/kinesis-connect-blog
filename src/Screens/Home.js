import React, { useEffect, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';

export default function Home() {
  const { loggedInUser, posts, blogProfiles, setWidth } = useContext(
    LocalContext
  );

  const [search, setSearch] = useState('');
  const alert = useAlert();

  const history = useHistory();

  useEffect(() => {
    setWidth(100);
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

  const tmpCard = (
    <div className="flex-shrink-0 flex-grow-0 sm:w-100 w-80 border-4 border-gray-600 rounded-lg sm:h-40 h-32 p-2 flex flex-col justify-end bg-gray-900 mr-2">
      <div className="w-5/6 py-2 bg-gray-800 my-2 rounded-lg animate-pulse"></div>

      <div className="w-3/5 py-1 bg-gray-700 my-2 rounded-lg animate-pulse"></div>

      <div className="w-full py-1 bg-gray-600 mt-1 rounded-lg animate-pulse"></div>
    </div>
  );

  const placeholderCards = (
    <div className="w-full flex flex-col items-start sm:px-4 mb-4">
      <div className="sm:w-2/5 w-5/6 my-2 rounded-lg py-3 bg-gray-900 animate-pulse"></div>
      <div className="w-full flex overflow-x-scroll py-2">
        {tmpCard}
        {tmpCard}
        {tmpCard}
        {tmpCard}
        {tmpCard}
      </div>
    </div>
  );

  const favorites =
    loggedInUser.username && loggedInUser.username !== undefined
      ? loggedInUser.favorites.map((f) => f.uid)
      : [];

  const following =
    loggedInUser.username &&
    loggedInUser.username !== undefined &&
    loggedInUser.following &&
    loggedInUser.following !== undefined
      ? [...loggedInUser.following.map((f) => f.uid), loggedInUser.uid]
      : [loggedInUser.uid];

  const famousPosts = posts
    .sort(
      (a, b) =>
        (a.likes && a.likes !== undefined ? a.likes.length : 0) +
          (a.comments && a.comments !== undefined ? a.comments.length : 0) >
        (b.likes && b.likes !== undefined ? b.likes.length : 0) +
          (b.comments && b.comments !== undefined ? b.comments.length : 0)
    )
    .slice(0, 4);

  const returnSpecificBlogPosts = (list, title) => (
    <div key={`${title}`} className="w-full flex flex-col items-center mb-4">
      <div className="w-full text-xl sm:text-3xl lg:text-4xl text-blue-300 tracking-wide text-left font-bold">
        {title} {`(${list ? list.length : 0})`}
      </div>
      <div className="w-full flex overflow-x-scroll py-2">
        {list.map((post, i) => {
          const profile = blogProfiles.find((p) => p.uid === post.authorID);

          return (
            <button
              className={`flex-shrink-0 flex-grow-0 sm:w-100 w-80 ${
                i < list.length - 1 ? 'mr-2' : 'mr-0'
              } border-4 border-gray-200 hover:border-blue-500 bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-green-400 hover:to-blue-500 focus:from-green-400 focus:to-blue-500 rounded-lg sm:h-40 h-32 p-2 flex flex-col justify-end`}
              key={post.blogID}
              onClick={() =>
                history.push(`/view/${profile.username}/${post.slug}`)
              }
              style={
                post.preview_img && post.preview_img.length > 8
                  ? {
                      color: '#4a5568',
                      background: `url(${post.preview_img}) center / cover no-repeat #4a5568`,
                    }
                  : {}
              }
            >
              <div
                className={`sm:text-xl text-lg tracking-wide font-bold bg-gray-900 opacity-75 rounded text-gray-200 px-2`}
              >
                {post.title}
              </div>

              <div className="text-sm tracking-wide font-normal mt-1 text-blue-200 bg-blue-900 opacity-75 rounded px-2 text-left">
                {post.subtitle}
              </div>

              <div className="sm:text-xs text-xss tracking-wide font-normal mt-2 text-gray-200 bg-gray-900 opacity-75 rounded px-2 w-full text-left">
                Last updated on{' '}
                <span className="text-green-300">
                  {convertDate(post.updated_on)
                    .split(' ')
                    .slice(0, 5)
                    .join(' ')}
                </span>{' '}
                by{' '}
                <button
                  className="text-yellow-300 hover:underline focus:underline"
                  //   onClick={() => history.push(`/profile/${profile.username}`)}
                >
                  {profile.username.length > 12
                    ? profile.username.substring(0, 12)
                    : profile.username}
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center lg:px-20 px-2 pb-4 pt-24 sm:pt-28 lg:pt-32">
      <form
        className="w-full flex lg:justify-end justify-center items-center mb-2 p-2 sm:p-4 lg:p-2 bg-gray-900 rounded-lg"
        onSubmit={(e) => {
          e.preventDefault();
          if (search.trim().length > 0) {
            if (search.match(/^[A-Za-z0-9 ]+$/)) {
              history.push(`/search/${search.trim().split(' ').join('+')}`);
            }
          } else {
            alert.error('Invalid search string');
          }
        }}
      >
        {!blogProfiles ||
        blogProfiles.length <= 0 ||
        !posts ||
        posts.length <= 0 ? (
          <div className="lg:w-1/3 w-4/5 rounded-lg p-4 bg-gray-700 border-4 border-gray-700 animate-pulse"></div>
        ) : (
          <input
            type="text"
            id="search"
            name="search"
            className="lg:w-1/3 w-4/5 rounded-lg p-2 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-4 border-gray-700 text-sm sm:text-base lg:text-lg"
            placeholder="Search for an author / blog post..."
            value={search}
            onChange={(e) => {
              if (
                e.target.value.match(/^[A-Za-z0-9 ]+$/) ||
                e.target.value.length < 1
              ) {
                setSearch(e.target.value);
              } else {
                alert.info('Only alphabets, numbers and spaces are accepted.');
              }
            }}
          />
        )}
        <button
          title="Search"
          type="submit"
          className={`rounded-full ml-2 sm:w-12 sm:h-12 w-10 h-10 sm:text-xl text-lg text-gray-100 bg-gray-700 ${
            search.trim().length > 0
              ? 'hover:bg-gray-900 focus:bg-gray-900 text-blue-300'
              : 'opacity-50'
          } ri-search-line`}
        />
      </form>

      {!blogProfiles ||
      blogProfiles.length <= 0 ||
      !posts ||
      posts.length <= 0 ? (
        <div className="w-full">
          {placeholderCards}
          {placeholderCards}
          {placeholderCards}
          {placeholderCards}
        </div>
      ) : (
        <div className="w-full h-full">
          {loggedInUser.username &&
            loggedInUser.username !== undefined &&
            returnSpecificBlogPosts(
              posts.filter((p) => following.includes(p.authorID)).slice(0, 10),
              'Latest posts'
            )}

          {returnSpecificBlogPosts(
            famousPosts,
            'Posts getting the most attention'
          )}

          {loggedInUser.username &&
            loggedInUser.username !== undefined &&
            returnSpecificBlogPosts(
              posts.filter((p) => following.includes(p.authorID)),
              'All posts by people you follow'
            )}

          {loggedInUser.username &&
            loggedInUser.username !== undefined &&
            loggedInUser.favorites.length > 0 &&
            returnSpecificBlogPosts(
              [...posts].filter((p) => favorites.includes(p.blogID)),
              'Favorites'
            )}

          {loggedInUser.username &&
            loggedInUser.username !== undefined &&
            returnSpecificBlogPosts(
              posts.filter((p) => !following.includes(p.authorID)),
              'Other posts'
            )}

          {returnSpecificBlogPosts(posts, 'All posts')}
        </div>
      )}
    </div>
  );
}
