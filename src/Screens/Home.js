import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { LocalContext } from '../LocalContext';

export default function Home() {
  const { loggedInUser, posts, blogProfiles, setWidth } = useContext(
    LocalContext
  );

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
      <div className="w-5/6 py-2 bg-gray-800 my-2 rounded-lg"></div>

      <div className="w-3/5 py-1 bg-gray-700 my-2 rounded-lg"></div>

      <div className="w-full py-1 bg-gray-600 mt-1 rounded-lg"></div>
    </div>
  );

  const placeholderCards = (
    <div className="w-full flex flex-col items-start sm:px-4 mb-4">
      <div className="sm:w-2/5 w-5/6 my-2 rounded-lg py-3 bg-gray-900"></div>
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
        a.likes.length + a.comments.length > b.likes.length + b.comments.length
    )
    .slice(0, 4);

  const returnSpecificBlogPosts = (list, title) => (
    <div
      key={`${title}`}
      className="w-full flex flex-col items-center sm:px-4 mb-4"
    >
      <div className="w-full sm:text-4xl text-xl text-blue-300 tracking-wide text-left font-bold">
        {title} {`(${list ? list.length : 0})`}
      </div>
      <div className="w-full flex overflow-x-scroll py-2">
        {list.map((post, i) => {
          const profile = blogProfiles.find((p) => p.uid === post.authorID);

          return (
            <button
              className={`flex-shrink-0 flex-grow-0 sm:w-100 w-80 ${
                i < list.length - 1 ? 'mr-2' : 'mr-0'
              } border-4 border-gray-200 hover:border-blue-500 bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 focus:from-pink-500 focus:to-yellow-500 rounded-lg sm:h-40 h-32 p-2 flex flex-col justify-end`}
              key={post.blogID}
              onClick={() =>
                history.push(`/view/${profile.username}/${post.slug}`)
              }
              style={
                post.preview_img && post.preview_img.length > 8
                  ? {
                      color: '#fff',
                      background: `url(${post.preview_img}) center / cover no-repeat #fff`,
                    }
                  : {}
              }
            >
              <div
                className={`sm:text-2xl text-lg tracking-wide font-bold ${
                  post.preview_img && post.preview_img.length > 8
                    ? 'text-gray-200'
                    : 'text-gray-800'
                }`}
              >
                {post.title}
              </div>

              <div className="sm:text-lg text-sm tracking-wide font-normal mt-1 text-blue-200 bg-blue-900 opacity-75 rounded px-2">
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
    <div className="w-full flex flex-col items-center sm:px-20 px-2 pb-4 sm:pt-32 pt-24">
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
