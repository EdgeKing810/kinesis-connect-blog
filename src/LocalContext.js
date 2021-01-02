import React, { useEffect, useState } from 'react';

import axios from 'axios';

const LocalContext = React.createContext();

function LocalContextProvider({ children }) {
  const APIURL = 'https://api.connect.kinesis.games';
  const UPLOADSURL = 'https://uploads.connect.kinesis.games';

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [blogProfiles, setBlogProfiles] = useState([]);
  const [links, setLinks] = useState([]);

  const [width, setWidth] = useState(100);

  useEffect(() => {
    if (localStorage.getItem('_userData')) {
      if (
        loggedInUser.jwt !== undefined &&
        loggedInUser.jwt &&
        myPosts &&
        myPosts.length > 0
      ) {
        return;
      }

      const { uid, jwt } = JSON.parse(localStorage.getItem('_userData'));

      const data = {
        uid,
        profileID: uid,
      };

      axios
        .post(`${APIURL}/api/blog/posts/fetch`, data, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        .then((res) => {
          if (res.data.error === 0) {
            setPosts(
              res.data.blog_posts
                .sort((a, b) => a.updated_on.localeCompare(b.updated_on))
                .reverse()
            );
          }
        });

      axios
        .post(`${APIURL}/api/blog/users/fetch`, data, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        .then((res) => {
          if (res.data.error === 0) {
            setBlogProfiles(res.data.users);

            const currentUser = res.data.users.find((u) => u.uid === uid);
            if (currentUser) {
              setLoggedInUser({ ...currentUser, uid, jwt });
            }
          }
        });

      axios
        .post(`${APIURL}/api/blog/user/posts/fetch`, data, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        .then((res) => {
          if (res.data.error === 0) {
            setMyPosts(res.data.blog_posts.reverse());
          }
        });

      axios
        .post(`${APIURL}/api/links/fetch`, data, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        .then((resp) => {
          if (resp.data.error === 0) {
            setLinks(resp.data.links);
          }
        });
    } else {
      axios.post(`${APIURL}/api/blog/posts/fetch`, {}).then((resp) => {
        if (resp.data.error === 0) {
          setPosts(
            resp.data.blog_posts
              .sort((a, b) => a.updated_on.localeCompare(b.updated_on))
              .reverse()
          );
        } else {
          console.log(resp.data);
        }
      });

      axios.post(`${APIURL}/api/blog/users/fetch`, {}).then((resp) => {
        if (resp.data.error === 0) {
          setBlogProfiles(resp.data.users);
        } else {
          console.log(resp.data);
        }
      });
    }

    // eslint-disable-next-line
  }, []);

  return (
    <LocalContext.Provider
      value={{
        APIURL,
        UPLOADSURL,
        posts,
        setPosts,
        myPosts,
        setMyPosts,
        loggedInUser,
        setLoggedInUser,
        blogProfiles,
        setBlogProfiles,
        links,
        setLinks,
        width,
        setWidth,
      }}
    >
      {children}
    </LocalContext.Provider>
  );
}

export { LocalContext, LocalContextProvider };
