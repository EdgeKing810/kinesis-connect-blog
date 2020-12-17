import React, { useState } from 'react';

const LocalContext = React.createContext();

function LocalContextProvider({ props }) {
  const APIURL = 'https://api.connect.kinesis.games';

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [blogProfiles, setBlogProfiles] = useState([]);

  return (
    <LocalContext.Provider
      value={{
        APIURL,
        posts,
        setPosts,
        myPosts,
        setMyPosts,
        loggedInUser,
        setLoggedInUser,
        blogProfiles,
        setBlogProfiles,
      }}
    >
      {props}
    </LocalContext.Provider>
  );
}

export { LocalContext, LocalContextProvider };
