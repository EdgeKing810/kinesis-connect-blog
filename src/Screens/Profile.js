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
      if (u.username === username) {
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
      if (tmpPosts[i].authorID === profileID) {
        authorPosts.push(tmpPosts[i]);
      }
    }

    setCurrentPosts(authorPosts);
    // eslint-disable-next-line
  }, [posts, myPosts]);

  return (
    <div className="w-full flex flex-col items-center sm:px-20 px-2 pb-4 sm:pt-28 pt-24">
      <div className="w-full flex items-center bg-gray-700 rounded-lg mt-2 flex p-2 border-2 border-gray-900">
        <div className="w-full h-full flex justify-center items-center">
          <img
            src={
              blogProfile.profile_pic &&
              blogProfile.profile_pic !== undefined &&
              blogProfile.profile_pic.length > 3
                ? `${UPLOADSURL}/${blogProfile.profile_pic}`
                : tmpAvatar
            }
            alt="p.pic"
            className="sm:h-40 sm:w-40 h-24 w-24 z-0 object-cover border-2 border-blue-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
