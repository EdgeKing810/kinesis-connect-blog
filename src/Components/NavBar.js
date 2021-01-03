import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function NavBar() {
  const {
    UPLOADSURL,
    loggedInUser,
    setLoggedInUser,
    setMyPosts,
    width,
  } = useContext(LocalContext);

  const history = useHistory();
  const { pathname } = useLocation();

  const alert = useAlert();

  return (
    <div className="w-full bg-gray-900 flex flex-col justify-between sm:h-24 shadow-2xl fixed z-50">
      <div className="w-full flex items-center justify-between sm:px-20 px-4 py-2 h-full">
        <button
          className="sm:text-2xl text-lg tracking-widest text-blue-300 font-open font-bold border-b-2 border-blue-200 hover:border-yellow-300 focus:border-yellow-300"
          onClick={() => (pathname !== '/' ? history.push('/') : null)}
        >
          Kinesis Blog
        </button>

        {loggedInUser.username && loggedInUser.username !== undefined ? (
          <div className="sm:w-1/6 w-1/2 bg-gray-800 px-4 py-1 rounded-lg border border-gray-700 flex h-full items-center">
            <div className="w-1/3 h-full flex items-center sm:justify-center">
              <button
                className="sm:h-16 sm:w-16 h-12 w-12 z-0 border-2 border-blue-400 hover:border-blue-200 focus:border-blue-200 rounded-full"
                onClick={() =>
                  pathname !== `/profile/${loggedInUser.username}`
                    ? history.push(`/profile/${loggedInUser.username}`)
                    : null
                }
              >
                <img
                  src={
                    loggedInUser.profile_pic &&
                    loggedInUser.profile_pic !== undefined &&
                    loggedInUser.profile_pic.length > 3
                      ? `${UPLOADSURL}/${loggedInUser.profile_pic}`
                      : tmpAvatar
                  }
                  alt="p.pic"
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            </div>

            <div className="w-2/3 h-full flex flex-col">
              <button
                className="w-full h-1/2 font-open text-gray-400 sm:text-base text-sm flex items-center text-gray-200 hover:underline focus:underline"
                onClick={() =>
                  pathname !== `/profile/${loggedInUser.username}`
                    ? history.push(`/profile/${loggedInUser.username}`)
                    : null
                }
              >
                {loggedInUser.username.length > 12
                  ? `${loggedInUser.username.substring(0, 12)}...`
                  : loggedInUser.username}
              </button>
              <div className="w-full h-1/2 py-1 flex flex-col justify-center">
                <button
                  className="w-full rounded bg-red-400 hover:bg-red-500 focus:bg-red-500 text-center font-rale tracking-wide font-bold text-xs text-gray-900 py-1"
                  onClick={() => {
                    setLoggedInUser({});
                    setMyPosts([]);

                    alert.success('Signed out!');
                    localStorage.clear();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="rounded-lg bg-blue-300 hover:bg-yellow-300 focus:bg-yellow-300 py-2 sm:px-6 px-4 font-rale text-blue-900 font-bold"
            onClick={() =>
              pathname !== '/admin' ? history.push('/admin') : null
            }
          >
            Sign In
          </button>
        )}
      </div>
      <div className="w-full">
        <div className="py-1 bg-blue-500" style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
}
