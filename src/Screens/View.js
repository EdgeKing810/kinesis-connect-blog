import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import axios from 'axios';
import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';
import { Parser } from '../Components/renderers';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function View() {
  const {
    APIURL,
    UPLOADSURL,
    loggedInUser,
    setLoggedInUser,
    posts,
    setPosts,
    myPosts,
    setMyPosts,
    blogProfiles,
  } = useContext(LocalContext);

  const [blogPost, setBlogPost] = useState(undefined);
  const [blogProfile, setBlogProfile] = useState(undefined);

  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [postLiked, setPostLiked] = useState(false);
  const [postFavorited, setPostFavorited] = useState(false);

  const history = useHistory();
  const { username, slug } = useParams();
  const alert = useAlert();

  useEffect(() => {
    if (loggedInUser.username && loggedInUser.username !== undefined) {
      const data = {
        uid: loggedInUser.uid,
        profileID: loggedInUser.uid,
        slug: slug,
        jwt: loggedInUser.jwt,
      };

      axios.post(`${APIURL}/api/blog/post/view`, data, {
        headers: { Authorization: `Bearer ${data.jwt}` },
      });
    }

    if (!username || username === undefined || !slug || slug === undefined) {
      history.push('/');
    }

    const tmpPosts = [...posts, ...myPosts];
    for (let i = 0; i < tmpPosts.length; i++) {
      if (tmpPosts[i].slug === slug) {
        setBlogPost({ ...tmpPosts[i] });

        if (
          tmpPosts[i].likes &&
          tmpPosts[i].likes !== undefined &&
          tmpPosts[i].likes.length > 0
        ) {
          setPostLiked(
            tmpPosts[i].likes.some((l) => l.uid === loggedInUser.uid)
          );
        }

        if (loggedInUser.favorites && loggedInUser.favorites.length > 0) {
          setPostFavorited(
            loggedInUser.favorites.some((f) => f.uid === tmpPosts[i].blogID)
          );
        }
      }
    }

    [loggedInUser, ...blogProfiles].forEach((u) => {
      if (u.username === username) {
        setBlogProfile({ ...u });

        if (loggedInUser.username && loggedInUser.username !== undefined) {
          if (loggedInUser.blog_following_amount > 0) {
            setFollowingAuthor(
              loggedInUser.blog_following.some((a) => a.uid === u.uid)
            );
          }
        }
      }
    });
    // eslint-disable-next-line
  }, [posts, myPosts]);

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

  const likePost = () => {
    const data = {
      uid: loggedInUser.uid,
      profileID: loggedInUser.uid,
      blogID: blogPost.blogID,
      jwt: loggedInUser.jwt,
      like: postLiked ? 'false' : 'true',
    };

    axios
      .post(`${APIURL}/api/blog/post/like`, data, {
        headers: { Authorization: `Bearer ${data.jwt}` },
      })
      .then((res) => {
        if (res.data.error === 0) {
          alert.success(`Post successfully ${postLiked ? 'un' : ''}liked!`);
        } else {
          console.log(res.data);
        }
      });

    let update = { ...blogPost };
    if (postLiked) {
      update.likes = update.likes.filter((l) => l.uid !== loggedInUser.uid);
    } else {
      update.likes = [...update.likes, { uid: loggedInUser.uid }];
    }

    const updatedPosts = posts.map((p) => {
      if (p.blogID === blogPost.blogID) {
        return update;
      } else {
        return p;
      }
    });

    const updatedMyPosts = myPosts.map((p) => {
      if (p.blogID === blogPost.blogID) {
        return update;
      } else {
        return p;
      }
    });

    setTimeout(() => {
      setPosts(updatedPosts);
      setMyPosts(updatedMyPosts);
    }, 500);

    setPostLiked((prev) => !prev);
  };

  const favoritePost = () => {
    const data = {
      uid: loggedInUser.uid,
      profileID: loggedInUser.uid,
      blogID: blogPost.blogID,
      jwt: loggedInUser.jwt,
      favorite: postFavorited ? 'false' : 'true',
    };

    axios
      .post(`${APIURL}/api/blog/post/favorite`, data, {
        headers: { Authorization: `Bearer ${data.jwt}` },
      })
      .then((res) => {
        if (res.data.error === 0) {
          alert.success(
            `Post successfully ${
              postFavorited ? 'removed from' : 'added to'
            } favorites!`
          );
        } else {
          console.log(res.data);
        }
      });

    const updatedLoggedInUser = { ...loggedInUser };
    if (postFavorited) {
      updatedLoggedInUser.favorites = updatedLoggedInUser.favorites.filter(
        (f) => f.uid !== blogPost.blogID
      );
    } else {
      updatedLoggedInUser.favorites = [
        ...updatedLoggedInUser.favorites,
        { uid: blogPost.blogID },
      ];
    }

    setTimeout(() => {
      setLoggedInUser({ ...updatedLoggedInUser });
    }, 500);

    setPostFavorited((prev) => !prev);
  };

  return blogPost &&
    blogPost !== undefined &&
    blogProfile &&
    blogProfile !== undefined ? (
    <div className="w-full flex flex-col items-center h-full sm:px-20 px-2">
      <div className="sm:w-1/4 w-full bg-gray-700 rounded-lg mt-2 flex p-2 border-4 border-gray-900">
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
            <button
              className="flex-1 text-left text-blue-500 font-open sm:text-lg text-sm bg-gray-900 hover:bg-teal-900 focus:bg-teal-900 px-2 rounded-lg"
              onClick={() => history.push(`/profile/${blogProfile.username}`)}
            >
              {blogProfile.username.length > 12
                ? `${blogProfile.username.substring(0, 12)}...`
                : blogProfile.username}
            </button>
            {loggedInUser.username &&
              loggedInUser.username !== undefined &&
              blogProfile.uid !== loggedInUser.uid && (
                <div
                  title={followingAuthor ? 'Unfollow user' : 'Follow user'}
                  className={`sm:w-10 sm:h-10 w-6 h-6 flex items-center justify-center ri-user-${
                    followingAuthor ? 'unfollow' : 'add'
                  }-fill mx-2 sm:text-lg text-sm text-${
                    followingAuthor ? 'red' : 'blue'
                  }-400 hover:bg-gray-900 focus:bg-gray-900 p-2 rounded-full`}
                ></div>
              )}
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

      {loggedInUser.username && loggedInUser.username !== undefined && (
        <div className="w-full flex my-2 bg-gray-900 sm:p-2 p-2 rounded-lg items-center justify-around">
          <button
            title={postLiked ? 'Unlike' : 'Like Post'}
            onClick={() => likePost()}
            className={`w-2/5 text-center rounded-lg p-2 hover:bg-gray-800
             focus:bg-gray-800
             text-blue-300 ri-thumb-up-${postLiked ? 'fill' : 'line'} ${
              postLiked ? 'bg-blue-800' : ''
            } sm:text-lg text-sm`}
          ></button>

          <button
            title={
              postFavorited ? 'Remove from favorites' : 'Add post to favorites'
            }
            onClick={() => favoritePost()}
            className={`w-2/5 text-center rounded-lg p-2 hover:bg-gray-800
             focus:bg-gray-800
             text-red-300 ri-heart-3-${postFavorited ? 'fill' : 'line'} ${
              postFavorited ? 'bg-red-800' : ''
            } sm:text-lg text-sm`}
          ></button>
        </div>
      )}
    </div>
  ) : null;
}
