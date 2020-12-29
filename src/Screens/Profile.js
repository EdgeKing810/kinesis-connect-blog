import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import axios from 'axios';
import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function View() {
  const {
    APIURL,
    UPLOADSURL,
    loggedInUser,
    setLoggedInUser,
    posts,
    myPosts,
    blogProfiles,
    setBlogProfiles,
    setWidth,
  } = useContext(LocalContext);

  const [blogProfile, setBlogProfile] = useState('');
  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [currentPosts, setCurrentPosts] = useState([]);

  const history = useHistory();
  const { username } = useParams();
  const alert = useAlert();

  useEffect(() => {
    setWidth(100);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!username || username === undefined) {
      history.push('/');
    }

    let profileID;

    [loggedInUser, ...blogProfiles].forEach((u) => {
      if (u.username && u.username.toLowerCase() === username.toLowerCase()) {
        setBlogProfile({ ...u });
        profileID = u.uid;

        if (loggedInUser.username && loggedInUser.username !== undefined) {
          if (loggedInUser.blog_following_amount > 0) {
            setFollowingAuthor(
              loggedInUser.blog_following.some((a) => a.uid === u.uid)
            );
          }
        }
      }
    });

    const tmpPosts = [...posts, ...myPosts];
    let authorPosts = [];
    for (let i = 0; i < tmpPosts.length; i++) {
      if (
        tmpPosts[i].authorID === profileID &&
        !authorPosts.some((p) => p.blogID === tmpPosts[i].blogID)
      ) {
        authorPosts.push(tmpPosts[i]);
      }
    }

    setCurrentPosts(authorPosts);
    // eslint-disable-next-line
  }, [posts, myPosts]);

  const followUser = (uid) => {
    const data = {
      uid: loggedInUser.uid,
      profileID: loggedInUser.uid,
      authorID: uid,
      follow: followingAuthor ? 'false' : 'true',
    };

    axios
      .post(`${APIURL}/api/blog/user/follow`, data, {
        headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
      })
      .then((res) => {
        if (res.data.error === 0) {
          setLoggedInUser((prev) => {
            let update = { ...prev };

            if (followingAuthor) {
              update.blog_following =
                update.blog_following &&
                update.blog_following !== undefined &&
                update.blog_following.length > 0
                  ? update.blog_following.filter((f) => f.uid !== uid)
                  : [];
              update.blog_following_amount =
                update.blog_following_amount > 0
                  ? update.blog_following_amount - 1
                  : 0;
            } else {
              update.blog_following =
                update.blog_following &&
                update.blog_following !== undefined &&
                update.blog_following.length > 0
                  ? [...update.blog_following, { uid: uid }]
                  : [{ uid: uid }];
              update.blog_following_amount = update.blog_following_amount + 1;
            }

            return update;
          });

          setBlogProfiles((prev) =>
            prev.map((p) => {
              if (p.uid === uid) {
                let update = { ...p };

                if (update.blog_followers_amount > 0 && followingAuthor) {
                  update.blog_followers_amount =
                    update.blog_followers_amount - 1;
                } else if (!followingAuthor) {
                  update.blog_followers_amount =
                    update.blog_followers_amount + 1;
                }

                return { ...update };
              } else {
                return p;
              }
            })
          );

          setBlogProfile((prev) => {
            let update = { ...prev };

            if (update.blog_followers_amount > 0 && followingAuthor) {
              update.blog_followers_amount = update.blog_followers_amount - 1;
            } else if (!followingAuthor) {
              update.blog_followers_amount = update.blog_followers_amount + 1;
            }

            return update;
          });

          alert.success(
            `User ${followingAuthor ? 'un' : ' '}followed successfully!`
          );
        } else {
          console.log(res.data);
        }
      });

    setFollowingAuthor((prev) => !prev);
  };

  return (
    <div className="w-full flex flex-col items-center sm:px-20 px-2 pb-4 sm:pt-28 pt-24">
      <div className="w-full flex flex-col items-center bg-gray-700 rounded-lg mt-2 flex p-2 border-2 border-gray-900">
        <div className="w-full h-full flex justify-center items-center sm:mt-0 mt-2">
          <img
            src={
              blogProfile.profile_pic &&
              blogProfile.profile_pic !== undefined &&
              blogProfile.profile_pic.length > 3
                ? `${UPLOADSURL}/${blogProfile.profile_pic}`
                : tmpAvatar
            }
            alt="p.pic"
            className="sm:h-40 sm:w-40 h-24 w-24 border-2 border-blue-400 rounded-full"
          />
        </div>

        <div className="w-full flex justify-center mt-4 font-bold sm:text-2xl text-lg text-blue-300 tracking-wide font-sans">
          {blogProfile.name && blogProfile.name}{' '}
          <span className="text-yellow-300 ml-1">
            {`(${blogProfile.username && blogProfile.username})`}
          </span>
        </div>

        {blogProfile.blog_description &&
          blogProfile.blog_description.length > 0 && (
            <div className="sm:w-2/3 w-4/5 flex justify-center py-2 my-2 bg-gray-400 sm:text-lg text-xs rounded-lg text-gray-800 tracking-wide font-sans">
              {blogProfile.blog_description}
            </div>
          )}

        {loggedInUser.username &&
          loggedInUser.username !== undefined &&
          blogProfile.uid !== loggedInUser.uid && (
            <div className="w-full flex justify-center">
              <button
                className={`sm:w-1/5 w-4/5 my-2 flex items-center justify-center mx-2 sm:text-lg text-sm text-${
                  followingAuthor ? 'red' : 'blue'
                }-400 hover:bg-gray-900 focus:bg-gray-900 bg-gray-800 p-2 rounded-full`}
                onClick={() => followUser(blogProfile.uid)}
              >
                <div>{followingAuthor ? 'Unfollow user' : 'Follow user'}</div>

                <div
                  title={followingAuthor ? 'Unfollow user' : 'Follow user'}
                  className={`flex items-center justify-center ri-user-${
                    followingAuthor ? 'unfollow' : 'add'
                  }-fill ml-1 sm:text-lg text-sm`}
                ></div>
              </button>
            </div>
          )}

        <div className="w-full flex justify-between mt-2">
          <div className="w-3/10 p-2 rounded-lg bg-gray-900 text-center sm:text-lg text-xs font-open text-gray-200">
            Followers:{' '}
            {blogProfile.blog_followers_amount
              ? blogProfile.blog_followers_amount
              : 0}
          </div>
          <div className="w-3/10 p-2 rounded-lg bg-gray-900 text-center sm:text-lg text-xs font-open text-gray-200">
            Following:{' '}
            {blogProfile.blog_following_amount
              ? blogProfile.blog_following_amount
              : 0}
          </div>
          <div className="w-3/10 p-2 rounded-lg bg-gray-900 text-center sm:text-lg text-xs font-open text-gray-200">
            Blog Posts:{' '}
            {blogProfile.blog_posts ? blogProfile.blog_posts.length : 0}
          </div>
        </div>
      </div>

      {currentPosts && currentPosts.length > 0 ? (
        <div className="w-full sm:text-4xl text-lg text-gray-100 font-bold tracking-widest mt-4 ">
          Blog Posts
          {currentPosts.map((post) => (
            <div
              className="w-full my-2 border-4 border-gray-200 hover:border-blue-500 bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 focus:from-pink-500 focus:to-yellow-500 rounded-lg sm:h-40 h-32 p-2 flex flex-col justify-end"
              key={post.blogID}
              style={
                post.preview_img && post.preview_img.length > 8
                  ? {
                      color: '#fff',
                      background: `url(${post.preview_img}) center / cover no-repeat #fff`,
                    }
                  : {}
              }
            >
              <div className="sm:text-2xl text-lg tracking-wide font-bold">
                {post.title}
              </div>

              <div className="sm:text-lg text-sm tracking-wide font-normal mt-1 text-blue-200 bg-blue-900 opacity-75 rounded px-2">
                {post.subtitle}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full text-center sm:text-2xl text-lg text-yellow-300 mt-4">
          No blog posts yet...
        </div>
      )}
    </div>
  );
}
