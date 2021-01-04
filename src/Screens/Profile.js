import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import axios from 'axios';
import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

import { v4 } from 'uuid';

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
    setLinks,
    setWidth,
  } = useContext(LocalContext);

  const [blogProfile, setBlogProfile] = useState('');
  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [currentPosts, setCurrentPosts] = useState([]);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('');

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

    const tmpPosts = [...posts];
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

  const prepareEditingBio = (currentBio) => {
    setIsEditingBio(true);
    setBio(currentBio);
  };

  const submitBio = () => {
    const data = {
      uid: loggedInUser.uid,
      profileID: loggedInUser.uid,
      description: bio,
    };

    axios
      .post(`${APIURL}/api/blog/user/update`, data, {
        headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
      })
      .then((res) => {
        if (res.data.error === 0) {
          alert.success('Bio updated successfully!');
        } else {
          console.log(res.data);
        }
      });

    setLoggedInUser((prev) => {
      let update = { ...prev };

      update.blog_description = data.description;

      return update;
    });

    setBlogProfile((prev) => {
      if (prev.uid === loggedInUser.uid) {
        let update = { ...prev };

        update.blog_description = data.description;

        return update;
      } else {
        return prev;
      }
    });

    cancelBio();
  };

  const cancelBio = () => {
    setIsEditingBio(false);
  };

  const uploadImage = (e, isBanner) => {
    alert.info(
      'Avoid symbols/spaces in file name. Might take some time to upload.'
    );

    if (e.target.files[0]) {
      if (e.target.files[0].size > 10485760) {
        alert.error('File too large!');
      } else {
        e.preventDefault();

        const data = new FormData();
        data.append('file', e.target.files[0]);

        axios.post(`${APIURL}/api/user/upload`, data).then((res) => {
          setLoggedInUser((prev) => {
            let update = { ...prev };

            if (isBanner) {
              update.banner_img = res.data.url;
            } else {
              update.profile_pic = res.data.url;
            }

            return update;
          });

          setBlogProfiles((prev) =>
            prev.map((p) => {
              if (p.uid === loggedInUser.uid) {
                let update = { ...p };

                if (isBanner) {
                  update.banner_img = res.data.url;
                } else {
                  update.profile_pic = res.data.url;
                }

                return { ...update };
              } else {
                return p;
              }
            })
          );

          setBlogProfile((prev) => {
            let update = { ...prev };

            if (isBanner) {
              update.banner_img = res.data.url;
            } else {
              update.profile_pic = res.data.url;
            }

            return update;
          });

          const postData = {
            uid: loggedInUser.uid,
            link: res.data.url,
            linkID: v4(),
          };

          axios
            .post(
              `${APIURL}/api/links/create`,
              { ...postData },
              { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
            )
            .then((response) => {
              if (response.data.error !== 0) {
                console.log(response.data.message);
                alert.error(response.data.message);
              } else {
                setLinks((prev) =>
                  prev === undefined
                    ? [{ ...postData }]
                    : [...prev, { ...postData }]
                );
              }
            });

          if (isBanner) {
            const bannerData = {
              uid: loggedInUser.uid,
              profileID: loggedInUser.uid,
              banner_img: res.data.url,
            };

            axios
              .post(`${APIURL}/api/blog/user/update`, bannerData, {
                headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
              })
              .then((response) => {
                if (response.data.error === 0) {
                  alert.success('Banner Image Updated!');
                } else {
                  console.log(response.data);
                }
              });
          } else {
            axios
              .post(
                `${APIURL}/api/profile/pic`,
                { uid: loggedInUser.uid, profile_pic_url: res.data.url },
                { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
              )
              .then((response) => {
                if (response.data.error === 0) {
                  alert.success('Profile Pic Updated!');
                } else {
                  console.log(response.data);
                }
              });
          }
        });
      }
    }
  };

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
      <div
        className="w-full flex flex-col items-center rounded-lg mt-2 flex p-2 border-2 border-gray-900 bg-gradient-to-r from-pink-400 via-indigo-500 to-purple-700"
        style={
          blogProfile.banner_img && blogProfile.banner_img.length > 8
            ? {
                background: `url(${
                  UPLOADSURL + '/' + blogProfile.banner_img
                }) center / cover no-repeat #4a5568`,
              }
            : {}
        }
      >
        {loggedInUser.username &&
          loggedInUser.username !== undefined &&
          blogProfile.uid === loggedInUser.uid && (
            <div className="absolute rounded-full p-1 left-0 border-2 border-gray-200 sm:ml-24 ml-4 flex items-center bg-gray-900 text-gray-100 sm:text-lg text-xsss sm:w-1/8 w-3/10 justify-between">
              Change banner image
              <div className="sm:w-10 sm:h-10 w-4 h-4 bg-blue-400 ml-2 rounded-full">
                <input
                  type="file"
                  id="preview"
                  name="preview"
                  accept=".jpg,.jpeg,.png,.svg,.gif,.bmp"
                  className="w-full h-full sm:text-md text-sm opacity-0"
                  onChange={(e) => {
                    e.persist();
                    uploadImage(e, true);
                  }}
                />
              </div>
            </div>
          )}

        {loggedInUser.username &&
          loggedInUser.username !== undefined &&
          blogProfile.uid === loggedInUser.uid && (
            <div className="absolute rounded-full p-1 left-0 border-2 border-gray-200 sm:ml-24 ml-4 flex items-center bg-gray-900 text-gray-100 sm:text-lg text-xsss sm:w-1/8 w-3/10 justify-between sm:mt-16 mt-8">
              Change profile picture
              <div className="sm:w-10 sm:h-10 w-4 h-4 bg-yellow-400 ml-2 rounded-full">
                <input
                  type="file"
                  id="preview"
                  name="preview"
                  accept=".jpg,.jpeg,.png,.svg,.gif,.bmp"
                  className="w-full h-full sm:text-md text-sm opacity-0"
                  onChange={(e) => {
                    e.persist();
                    uploadImage(e, false);
                  }}
                />
              </div>
            </div>
          )}

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
            className="sm:h-40 sm:w-40 h-24 w-24 border-4 rounded-full border-dotted p-1 border-gray-900"
          />
        </div>

        <div className="w-full flex justify-center mt-4 font-bold sm:text-2xl text-lg text-blue-900 tracking-wide font-sans">
          {blogProfile.name && blogProfile.name}{' '}
          <span className="text-yellow-500 ml-1">
            {`(${
              blogProfile.username && blogProfile.username !== undefined
                ? blogProfile.username
                : 'Loading...'
            })`}
          </span>
        </div>

        {blogProfile.blog_description &&
        blogProfile.blog_description.length > 0 ? (
          isEditingBio ? (
            <div className="w-full flex justify-center items-center my-2">
              <textarea
                className="sm:w-2/3 w-4/5 flex justify-center p-2 bg-gray-400 sm:text-lg text-xs placeholder-gray-600 rounded-lg text-gray-800 tracking-wide font-sans"
                placeholder="Enter something..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ minHeight: '4rem', maxHeight: '6rem' }}
              />

              <button
                title="Discard"
                className={`sm:w-12 sm:h-12 w-10 h-10 ml-2 p-2 sm:text-2xl text-md rounded-full ri-close-line bg-gray-600 hover:bg-gray-900 focus:bg-gray-900 flex justify-center items-center text-red-300`}
                onClick={() => cancelBio()}
              />

              <button
                title="Save"
                className={`sm:w-12 sm:h-12 w-10 h-10 ml-2 p-2 sm:text-2xl text-md rounded-full ri-check-line bg-gray-600 ${
                  bio.length > 0
                    ? 'hover:bg-gray-900 focus:bg-gray-900'
                    : 'opacity-50'
                } flex justify-center items-center text-green-300`}
                onClick={() => (bio.length > 0 ? submitBio() : null)}
              />
            </div>
          ) : (
            <div className="w-full flex justify-center items-center my-2">
              <div className="sm:w-2/3 w-4/5 flex justify-center py-2 bg-gray-400 sm:text-lg text-xs rounded-lg text-gray-800 tracking-wide font-sans">
                {blogProfile.blog_description}
              </div>
              {loggedInUser.username &&
                loggedInUser.username !== undefined &&
                loggedInUser.uid === blogProfile.uid && (
                  <button
                    title="Edit bio"
                    className={`sm:w-12 sm:h-12 w-10 h-10 ml-2 p-2 sm:text-2xl text-md rounded-full ri-pencil-line bg-gray-600 hover:bg-gray-900 focus:bg-gray-900 flex justify-center items-center text-yellow-300`}
                    onClick={() =>
                      prepareEditingBio(blogProfile.blog_description)
                    }
                  />
                )}
            </div>
          )
        ) : (
          ''
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
          <div className="w-3/10 p-2 rounded-lg bg-gray-900 text-center sm:text-lg text-xs font-open text-gray-200 flex items-center justify-center">
            Followers:{' '}
            {blogProfile.blog_followers_amount
              ? blogProfile.blog_followers_amount
              : 0}
          </div>
          <div className="w-3/10 p-2 rounded-lg bg-gray-900 text-center sm:text-lg text-xs font-open text-gray-200 flex items-center justify-center">
            Following:{' '}
            {blogProfile.blog_following_amount
              ? blogProfile.blog_following_amount
              : 0}
          </div>
          {loggedInUser.username &&
          loggedInUser.username !== undefined &&
          loggedInUser.uid === blogProfile.uid ? (
            <button
              className="w-3/10 p-2 rounded-lg bg-gray-900 text-center sm:text-lg text-xs font-open text-gray-200 hover:bg-gray-800 focus:bg-gray-800 flex items-center justify-center"
              onClick={() => history.push('/admin')}
            >
              Access Admin Interface
            </button>
          ) : (
            <div className="w-3/10 p-2 rounded-lg bg-gray-900 text-center sm:text-lg text-xs font-open text-gray-200">
              Blog Posts:{' '}
              {currentPosts &&
              currentPosts !== undefined &&
              currentPosts.length > 0
                ? currentPosts.length
                : 0}
            </div>
          )}
        </div>
      </div>

      {currentPosts && currentPosts.length > 0 ? (
        <div className="w-full sm:text-4xl text-lg text-gray-100 font-bold tracking-widest mt-4 ">
          Blog Posts {`(${currentPosts.length})`}
          {currentPosts.map((post) => (
            <button
              className="w-full my-2 border-4 border-gray-200 hover:border-gray-900 focus:border-gray-900 bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-green-400 hover:to-blue-500 focus:from-green-400 focus:to-blue-500 rounded-lg sm:h-40 h-32 p-2 flex flex-col justify-end"
              key={post.blogID}
              onClick={() =>
                history.push(`/view/${blogProfile.username}/${post.slug}`)
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
                className={`sm:text-3xl text-lg tracking-wide font-bold bg-gray-900 opacity-75 rounded text-gray-200 px-2`}
              >
                {post.title}
              </div>

              <div className="sm:text-xl text-sm tracking-wide font-normal mt-1 text-blue-200 bg-blue-900 opacity-75 rounded px-2 text-left">
                {post.subtitle}
              </div>

              <div className="sm:text-sm text-xs tracking-wide font-normal mt-2 text-gray-200 bg-gray-900 opacity-75 rounded px-2 w-full text-left">
                Last updated on{' '}
                <span className="text-green-300">
                  {convertDate(post.updated_on)
                    .split(' ')
                    .slice(0, 5)
                    .join(' ')}
                </span>{' '}
              </div>
            </button>
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
