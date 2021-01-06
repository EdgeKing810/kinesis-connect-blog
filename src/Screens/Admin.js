import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';

import logo from '../Assets/images/Logo.png';

export default function Admin() {
  const {
    APIURL,
    loggedInUser,
    setLoggedInUser,
    setPosts,
    myPosts,
    setMyPosts,
    blogProfiles,
    setBlogProfiles,
    setLinks,
    setWidth,
  } = useContext(LocalContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [color, setColor] = useState('blue');

  const [limit, setLimit] = useState(5);
  const [notificationLimit, setNotificationLimit] = useState(5);

  const history = useHistory();
  const alert = useAlert();

  useEffect(() => {
    setWidth(100);
    // eslint-disable-next-line
  }, []);

  const submitForm = (e) => {
    e.preventDefault();

    setColor('blue');
    setError('Submitting...');

    const data = {
      username: username,
      password: password,
    };

    axios.post(`${APIURL}/api/user/login`, data).then((res) => {
      if (res.data.error !== 0) {
        setColor('red');
        setError(res.data.message);

        setTimeout(() => {
          setUsername('');
          setPassword('');
          setError('');
        }, 2000);
      } else {
        setColor('green');
        setError('Logging in...');

        localStorage.setItem(
          '_userData',
          JSON.stringify({
            uid: res.data.uid,
            jwt: res.data.jwt,
          })
        );

        setTimeout(() => {
          setUsername('');
          setPassword('');
          setError('');

          alert.success('Logged in successfully!');
        }, 1000);

        const data = {
          uid: res.data.uid,
          profileID: res.data.uid,
        };

        axios
          .post(`${APIURL}/api/blog/posts/fetch`, data, {
            headers: { Authorization: `Bearer ${res.data.jwt}` },
          })
          .then((resp) => {
            if (resp.data.error === 0) {
              setPosts(resp.data.blog_posts.reverse());
            }
          });

        axios
          .post(`${APIURL}/api/blog/users/fetch`, data, {
            headers: { Authorization: `Bearer ${res.data.jwt}` },
          })
          .then((resp) => {
            if (resp.data.error === 0) {
              setBlogProfiles(resp.data.users);

              let currentUser = resp.data.users.find((u) => u.uid === data.uid);
              if (currentUser) {
                currentUser.notifications =
                  currentUser.notifications &&
                  currentUser.notifications !== undefined &&
                  currentUser.notifications.length > 0
                    ? [...currentUser.notifications].reverse()
                    : [];

                setLoggedInUser({
                  ...currentUser,
                  uid: data.uid,
                  jwt: data.jwt,
                });
              }
            }
          });

        axios
          .post(`${APIURL}/api/blog/user/posts/fetch`, data, {
            headers: { Authorization: `Bearer ${res.data.jwt}` },
          })
          .then((resp) => {
            if (resp.data.error === 0) {
              setMyPosts(resp.data.blog_posts.reverse());
            }
          });

        axios
          .post(`${APIURL}/api/links/fetch`, data, {
            headers: { Authorization: `Bearer ${res.data.jwt}` },
          })
          .then((resp) => {
            if (resp.data.error === 0) {
              setLinks(resp.data.links);
            }
          });
      }
    });
  };

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

  const deletePost = (blogID) => {
    const data = {
      uid: loggedInUser.uid,
      blogID: blogID,
    };

    if (
      window.confirm('Are you sure that you want to delete this blog post?')
    ) {
      axios
        .post(
          `${APIURL}/api/blog/post/delete`,
          { ...data },
          { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
        )
        .then((res) => {
          if (res.data.error === 0) {
            alert.success(`Successfully Deleted!`);
          } else {
            console.log(res.data);
          }
        });

      setMyPosts((prev) => prev.filter((p) => p.blogID !== blogID));
      setPosts((prev) => prev.filter((p) => p.blogID !== blogID));
    }
  };

  const changePostStatus = (status, blogID) => {
    let d = new Date();
    const timestamp = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );

    const data = {
      uid: loggedInUser.uid,
      blogID: blogID,
      status: status ? 'PUBLISHED' : 'DRAFT',
      updated_on: timestamp,
    };

    if (
      window.confirm(
        `Are you sure that you want to ${
          status ? 'publish this blog post' : 'mark this blog post as draft'
        } ?`
      )
    ) {
      axios
        .post(
          `${APIURL}/api/blog/post/edit`,
          { ...data },
          { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
        )
        .then((res) => {
          if (res.data.error === 0) {
            alert.success(
              `Successfully ${status ? 'Published' : 'marked as Draft'}!`
            );
          } else {
            console.log(res.data);
          }
        });

      setMyPosts((prev) => {
        let update = [];

        prev.forEach((p) => {
          if (p.blogID === blogID) {
            let copy = { ...p };
            copy.status = data.status;
            copy.updated_on = data.updated_on;

            setPosts((previous) =>
              copy.status !== 'PUBLISHED'
                ? previous.filter((pr) => pr.blogID !== blogID)
                : [{ ...copy }, ...previous]
            );

            update.push({ ...copy });
          } else {
            update.push({ ...p });
          }
        });

        return update;
      });
    }
  };

  const changeNotificationStatus = (id, read) => {
    const data = {
      uid: loggedInUser.uid,
      notificationID: id,
      read: read ? 'true' : 'false',
    };

    setLoggedInUser((prev) => {
      let update = { ...prev };

      update.notifications = update.notifications.map((n) => {
        if (n.notificationID === id) {
          let updatedNotification = { ...n };
          updatedNotification.seen = read;
          return updatedNotification;
        } else {
          return n;
        }
      });

      return update;
    });

    axios
      .post(
        `${APIURL}/api/blog/user/notification/read`,
        { ...data },
        { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
      )
      .then((res) => {
        if (res.data.error !== 0) {
          console.log(res.data);
        }
      });
  };

  const deleteNotification = (id) => {
    const data = {
      uid: loggedInUser.uid,
      notificationID: id,
    };

    setLoggedInUser((prev) => {
      let update = { ...prev };
      update.notifications = update.notifications.filter(
        (n) => n.notificationID !== id
      );
      return update;
    });

    axios
      .post(
        `${APIURL}/api/blog/user/notification/delete`,
        { ...data },
        { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
      )
      .then((res) => {
        if (res.data.error !== 0) {
          console.log(res.data);
        }
      });
  };

  const LoginScreen = (
    <div className="w-full flex items-center justify-center">
      <div className="sm:w-1/3 w-5/6 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center z-50 bg-gray-900 py-8 rounded-lg border-2 border-blue-500 opacity-95">
          <div className="sm:text-5xl text-3xl tracking-widest font-bold font-sans text-yellow-300 w-full text-center my-4">
            Login
          </div>

          <img
            className="w-2/5 rounded-full p-2 border-4 border-blue-400"
            src={logo}
            alt=""
          />

          {error.length > 0 ? (
            <div
              className={`w-full text-center sm:text-2xl text-lg mt-4 text-${color}-400`}
            >
              {error}
            </div>
          ) : (
            <form
              className="w-full h-full flex flex-col items-center justify-center"
              onSubmit={(e) =>
                username.length > 0 && password.length > 0
                  ? submitForm(e)
                  : null
              }
            >
              <input
                type="text"
                name="username"
                placeholder="Enter Username..."
                className="rounded-lg p-2 bg-gray-800 text-gray-200 placeholder-gray-300 sm:text-lg text-md w-4/5 mt-4"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="password"
                name="password"
                placeholder="Enter Password..."
                className="rounded-lg p-2 bg-gray-800 text-gray-200 placeholder-gray-300 sm:text-lg text-md w-4/5 mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <a
                className="w-4/5 font-open sm:text-md text-sm mt-4 text-green-300 hover:text-yellow-300 focus:text-yellow-300"
                href="https://connect.kinesis.games"
                target="_blank"
                rel="noopener noreferrer"
              >
                Don't have an account yet?
              </a>

              <button
                type="submit"
                className={`sm:w-2/5 w-4/5 rounded-lg bg-blue-400 ${
                  username.length > 0 && password.length > 0
                    ? 'hover:bg-blue-300 focus:bg-blue-400'
                    : 'opacity-50'
                } text-blue-900 sm:p-4 p-2 sm:mt-6 mt-4 sm:text-xl text-lg font-bold`}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  const adminInterface = (
    <div className="w-full flex flex-col items-center sm:px-16 px-4 sm:pt-28 pt-24">
      <div className="w-full p-2 rounded-lg bg-gray-900 my-4 sm:mx-8">
        <div className="sm:text-2xl  font-sans tracking-wide text-bold text-gray-300 w-full mb-2 flex items-center justify-between">
          Manage Blog Posts {`(${myPosts.length})`}
          <button
            className="sm:text-xl text-lg ri-menu-add-fill rounded p-2 hover:bg-gray-800 focus:bg-gray-800 w-10 h-10 text-gray-100 flex items-center justify-center"
            title="Create a new blog post"
            onClick={() => history.push('/create')}
          ></button>
        </div>

        {myPosts && myPosts !== undefined && myPosts.length > 0 ? (
          <div className="w-full px-2 border-2 border-gray-700 rounded-lg">
            {myPosts.slice(0, limit).map((post, i) => {
              const published = post.status === 'PUBLISHED';

              return (
                <div
                  className={`w-full flex justify-between flex h-full items-center py-2 ${
                    i < myPosts.length - 1 ? 'border-b-2 border-gray-700' : ''
                  }`}
                  key={post.blogID}
                >
                  <div className="sm:w-3/4 w-3/5 flex items-center">
                    <button
                      className={`w-4 h-4 mr-2 rounded bg-${
                        published ? 'green' : 'yellow'
                      }-300`}
                      onClick={() =>
                        alert.info(
                          `Status: ${published ? 'Published' : 'Draft'}`
                        )
                      }
                    ></button>

                    <div className="w-full flex flex-col">
                      <button
                        className="w-full font-open text-blue-200 underline hover:no-underline focus:no-underline sm:text-sm text-xs text-left"
                        title="View Blog Post"
                        onClick={() =>
                          history.push(
                            `/view/${loggedInUser.username}/${post.slug}`
                          )
                        }
                      >
                        {post.title.length > 40
                          ? `${post.title.substring(0, 40)}...`
                          : post.title}
                      </button>
                      <div
                        className={`w-full font-open text-${
                          published ? 'green' : 'yellow'
                        }-200 sm:text-xs text-xss`}
                      >
                        Last modified on{' '}
                        {convertDate(post.updated_on)
                          .split(' ')
                          .slice(0, 5)
                          .join(' ')}
                      </div>
                    </div>
                  </div>

                  <div className="sm:w-1/5 w-1/3 bg-gray-800 rounded-lg flex justify-end p-2">
                    <button
                      className={`sm:text-xl text-lg ri-inbox-${
                        published ? '' : 'un'
                      }archive-line rounded p-2 hover:bg-gray-900 focus:bg-gray-900 sm:w-10 w-6 sm:h-10 h-6 text-gray-100 flex items-center justify-center text-gray-100 hover:text-${
                        published ? 'yellow' : 'green'
                      }-300 focus:text-${published ? 'yellow' : 'green'}-300`}
                      title={published ? 'Mark as Draft' : 'Publish'}
                      onClick={() => changePostStatus(!published, post.blogID)}
                    ></button>

                    <button
                      className="sm:text-xl text-lg ri-edit-2-line rounded p-2 hover:bg-gray-900 focus:bg-gray-900 sm:w-10 w-6 sm:h-10 h-6 text-gray-100 flex items-center justify-center text-gray-100 hover:text-blue-300 focus:text-blue-300"
                      title="Edit"
                      onClick={() => history.push(`/edit/${post.blogID}`)}
                    ></button>

                    <button
                      className="sm:text-xl text-lg ri-delete-bin-2-line rounded p-2 hover:bg-gray-900 focus:bg-gray-900 sm:w-10 w-6 sm:h-10 h-6 text-gray-100 flex items-center justify-center text-gray-100 hover:text-red-300 focus:text-red-300"
                      title="Delete"
                      onClick={() => deletePost(post.blogID)}
                    ></button>
                  </div>
                </div>
              );
            })}
            {myPosts && myPosts !== undefined && limit < myPosts.length && (
              <div className="w-full flex justify-center my-2">
                <button
                  className="sm:w-1/3 w-4/5 p-2 bg-gray-800 hover:bg-blue-700 focus:bg-blue-700 sm:text-lg text-sm font-bold text-gray-100 rounded-lg tracking-wide font-sans"
                  onClick={() => setLimit((prev) => prev + 5)}
                >
                  View more
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full text-center rounded-lg bg-yellow-300 p-2 sm:text-md text-sm tracking-wide text-gray-900 flex sm:flex-row flex-col items-center justify-center">
            No blog posts created yet...
          </div>
        )}
      </div>

      <div className="w-full p-2 rounded-lg bg-gray-900 my-4 sm:mx-8">
        <div className="sm:text-2xl  font-sans tracking-wide text-bold text-gray-300 w-full mb-2 flex items-center justify-between">
          Manage Notifications{' '}
          {`(${
            loggedInUser.notifications &&
            loggedInUser.notifications !== undefined
              ? loggedInUser.notifications.filter((n) => !n.seen).length
              : 0
          })`}
        </div>

        {loggedInUser.notifications &&
        loggedInUser.notifications !== undefined &&
        loggedInUser.notifications.length > 0 ? (
          <div className="w-full border-2 px-2 border-gray-700">
            {loggedInUser.notifications
              .slice(0, notificationLimit)
              .map((notification, i) => {
                const profile = blogProfiles.find(
                  (p) => p.uid === notification.uid
                );

                function evenType(type) {
                  switch (type) {
                    case 'comment_new':
                      return 'posted a comment on your blog post';
                    case 'comment_edit':
                      return 'edited a comment on your blog post';
                    case 'comment_like':
                      return 'liked your comment.';
                    case 'follow_new':
                      return 'started following you';
                    default:
                      return '';
                  }
                }

                function imgEvenType(type) {
                  switch (type) {
                    case 'comment_new':
                      return 'ri-chat-new-line';
                    case 'comment_edit':
                      return 'ri-chat-settings-line';
                    case 'comment_like':
                      return 'ri-chat-follow-up-line.';
                    case 'follow_new':
                      return 'ri-user-add-line';
                    default:
                      return '';
                  }
                }

                const description = (
                  <div className="w-full h-full flex items-center">
                    <div
                      className={`sm:w-16 sm:h-16 w-12 h-10 rounded-full ml-1 mr-2 flex items-center justify-center sm:text-2xl text-sm ${imgEvenType(
                        notification.type
                      )} bg-gray-${notification.seen ? '900' : '700'}`}
                    />

                    <div className="w-full h-full">
                      <span className="text-yellow-300">
                        {profile.username.length > 12
                          ? profile.username.substring(0, 12)
                          : profile.username}
                      </span>{' '}
                      {evenType(notification.type)} on{' '}
                      <span className="text-green-300">
                        {convertDate(notification.timestamp)
                          .split(' ')
                          .slice(0, 5)
                          .join(' ')}
                      </span>
                    </div>
                  </div>
                );

                return (
                  <div
                    className={`w-full flex justify-between flex h-full items-center p-2 mt-2 bg-gray-${
                      notification.seen ? '900' : '700'
                    } ${
                      i < loggedInUser.notifications.length - 1
                        ? 'border-b-2 border-gray-700'
                        : ''
                    }`}
                    key={notification.notificationID}
                  >
                    <div className="sm:w-4/5 w-3/4 flex items-center">
                      <button
                        className="w-full font-open text-blue-200 sm:text-sm text-xs text-left bg-gray-800 rounded p-1"
                        onClick={() => {
                          changeNotificationStatus(
                            notification.notificationID,
                            !notification.seen
                          );
                          history.push(notification.linkTo);
                        }}
                      >
                        {description}
                      </button>
                    </div>

                    <div className="sm:w-1/6 w-1/5 bg-gray-800 rounded-lg flex justify-end p-2">
                      <button
                        className={`sm:text-xl text-lg ri-checkbox-${
                          notification.seen ? 'line' : 'blank-line'
                        } rounded p-2 hover:bg-gray-900 focus:bg-gray-900 sm:w-10 w-6 sm:h-10 h-6 text-gray-100 flex items-center justify-center text-gray-100 hover:text-${
                          notification.seen ? 'green' : 'blue'
                        }-300 focus:text-${
                          notification.seen ? 'green' : 'blue'
                        }-300`}
                        title={`Mark as ${notification.seen ? 'un' : ''}seen`}
                        onClick={() =>
                          changeNotificationStatus(
                            notification.notificationID,
                            !notification.seen
                          )
                        }
                      ></button>

                      <button
                        className="sm:text-xl text-lg ri-delete-bin-2-line rounded p-2 hover:bg-gray-900 focus:bg-gray-900 sm:w-10 w-6 sm:h-10 h-6 text-gray-100 flex items-center justify-center text-gray-100 hover:text-red-300 focus:text-red-300"
                        title="Delete notification"
                        onClick={() =>
                          deleteNotification(notification.notificationID)
                        }
                      ></button>
                    </div>
                  </div>
                );
              })}
            {loggedInUser.notifications &&
              loggedInUser.notifications !== undefined &&
              limit < notificationLimit.length && (
                <div className="w-full flex justify-center my-2">
                  <button
                    className="sm:w-1/3 w-4/5 p-2 bg-gray-800 hover:bg-blue-700 focus:bg-blue-700 sm:text-lg text-sm font-bold text-gray-100 rounded-lg tracking-wide font-sans"
                    onClick={() => setNotificationLimit((prev) => prev + 5)}
                  >
                    View more
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="w-full text-center rounded-lg bg-yellow-300 p-2 sm:text-md text-sm tracking-wide text-gray-900 flex sm:flex-row flex-col items-center justify-center">
            No notifications
          </div>
        )}
      </div>
    </div>
  );

  return loggedInUser.username && loggedInUser.username !== undefined ? (
    adminInterface
  ) : (
    <div className="h-11/12 w-full bg-admin-bg bg-cover bg-center flex justify-center items-center h-screen sm:pt-28 pt-24">
      {LoginScreen}
    </div>
  );
}
