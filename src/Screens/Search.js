import React, { useEffect, useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function Search() {
  const { UPLOADSURL, posts, blogProfiles, setWidth } = useContext(
    LocalContext
  );

  const { searchString } = useParams();

  const [search, setSearch] = useState('');

  const [usersFound, setUsersFound] = useState([]);
  const [postsFound, setPostsFound] = useState([]);

  const alert = useAlert();

  const history = useHistory();

  useEffect(() => {
    setWidth(100);

    if (searchString && searchString !== undefined) {
      setSearch(searchString.split('+').join(' ').trim());
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!search || search === undefined || search.length <= 9) {
      setUsersFound([]);
      setPostsFound([]);
    }

    const searchWords = search.toLowerCase().trim().split(' ');
    if (blogProfiles && blogProfiles.length > 0) {
      setUsersFound(
        blogProfiles.filter((p) =>
          searchWords.some(
            (w) =>
              p.name.toLowerCase().includes(w) ||
              p.username.toLowerCase().includes(w)
          )
        )
      );
    }

    if (posts && posts.length > 0) {
      setPostsFound(
        posts.filter((p) => {
          const profile = blogProfiles.find((pro) => pro.uid === p.authorID);

          return searchWords.some(
            (w) =>
              p.title.toLowerCase().includes(w) ||
              p.subtitle.toLowerCase().includes(w) ||
              profile.name.toLowerCase().includes(w) ||
              profile.username.toLowerCase().includes(w)
          );
        })
      );
    }
  }, [posts, blogProfiles, search]);

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
              } border-4 border-gray-200 hover:border-gray-900 focus:border-gray-900 bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 focus:from-pink-500 focus:to-yellow-500 rounded-lg sm:h-40 h-32 p-2 flex flex-col justify-end`}
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

  const returnSpecificUsers = (list, title) => (
    <div
      key={`${title}`}
      className="w-full flex flex-col items-center sm:px-4 mb-4"
    >
      <div className="w-full sm:text-4xl text-xl text-blue-300 tracking-wide text-left font-bold">
        {title} {`(${list ? list.length : 0})`}
      </div>
      <div className="w-full flex overflow-x-scroll py-2">
        {list.map((user, i) => {
          return (
            <button
              className={`flex-shrink-0 flex-grow-0 sm:w-100 w-80 ${
                i < list.length - 1 ? 'mr-2' : 'mr-0'
              } border-4 border-gray-200 hover:border-gray-900 focus:border-gray-900 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 focus:from-blue-400 focus:via-blue-600 focus:to-blue-800 rounded-lg sm:h-40 h-32 p-2 flex flex-col justify-end`}
              key={user.uid}
              onClick={() => history.push(`/profile/${user.username}`)}
              style={
                user.banner_img && user.banner_img.length > 8
                  ? {
                      color: '#fff',
                      background: `url(${
                        UPLOADSURL + '/' + user.banner_img
                      }) center / cover no-repeat #fff`,
                    }
                  : {}
              }
            >
              <div className="w-full flex justify-start">
                <img
                  src={
                    user.profile_pic &&
                    user.profile_pic !== undefined &&
                    user.profile_pic.length > 3
                      ? `${UPLOADSURL}/${user.profile_pic}`
                      : tmpAvatar
                  }
                  alt="p.pic"
                  className="sm:h-16 sm:w-16 h-12 w-12 border-2 border-blue-900 rounded-full bg-gray-800 -ml-1"
                />
              </div>

              <div
                className={`sm:text-2xl text-lg tracking-wide font-bold mt-1 ${
                  user.banner_img && user.banner_img.length > 8
                    ? 'text-gray-200'
                    : 'text-gray-800'
                }`}
              >
                {user.name.length > 20 ? user.name.substring(0, 20) : user.name}
              </div>

              <div className="sm:text-lg text-sm tracking-wide font-normal mt-1 text-blue-200 bg-blue-900 opacity-75 rounded px-2">
                {user.username}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center sm:px-20 px-2 pb-4 sm:pt-32 pt-24">
      <form
        className="w-full flex justify-center items-center my-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          type="text"
          id="search"
          name="search"
          className="w-4/5 rounded-lg p-2 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-4 border-gray-700 sm:text-lg text-sm"
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
      </form>

      {!blogProfiles ||
      blogProfiles.length <= 0 ||
      !posts ||
      posts.length <= 0 ? (
        <div className="w-full">
          {placeholderCards}
          {placeholderCards}
        </div>
      ) : (
        <div className="w-full">
          {returnSpecificBlogPosts(postsFound, 'Posts found')}
          {returnSpecificUsers(usersFound, 'Users found')}
        </div>
      )}
    </div>
  );
}
