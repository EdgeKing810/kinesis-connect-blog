import React, { useContext, useState } from 'react';

import axios from 'axios';
import { useAlert } from 'react-alert';

import { LocalContext } from '../LocalContext';

import logo from '../Assets/images/Logo.png';

export default function Admin() {
  const {
    APIURL,
    setLoggedInUser,
    setPosts,
    setMyPosts,
    setBlogProfiles,
  } = useContext(LocalContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [color, setColor] = useState('blue');

  const alert = useAlert();

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
          jwt: res.data.jwt,
        };

        axios
          .post(`${APIURL}/api/blog/posts/fetch`, data, {
            headers: { Authorization: `Bearer ${data.jwt}` },
          })
          .then((resp) => {
            if (resp.data.error === 0) {
              setPosts(resp.data.blog_posts);
            }
          });

        axios
          .post(`${APIURL}/api/blog/users/fetch`, data, {
            headers: { Authorization: `Bearer ${data.jwt}` },
          })
          .then((resp) => {
            if (resp.data.error === 0) {
              setBlogProfiles(resp.data.users);

              const currentUser = resp.data.users.find(
                (u) => u.uid === data.uid
              );
              if (currentUser) {
                console.log(currentUser);
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
            headers: { Authorization: `Bearer ${data.jwt}` },
          })
          .then((resp) => {
            if (resp.data.error === 0) {
              setMyPosts(resp.data.blog_posts);
            }
          });
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

  return (
    <div className="h-11/12 w-full bg-admin-bg bg-cover bg-center flex justify-center items-center">
      {LoginScreen}
    </div>
  );
}
