import React, { useContext, useEffect, useState, useRef } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';
import { useAlert } from 'react-alert';
import { v4 } from 'uuid';
import Slider from 'react-slick';

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
    setWidth,
  } = useContext(LocalContext);

  const [blogPost, setBlogPost] = useState(undefined);
  const [blogProfile, setBlogProfile] = useState(undefined);

  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [postLiked, setPostLiked] = useState(false);
  const [postFavorited, setPostFavorited] = useState(false);

  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState('');

  const [editComment, setEditComment] = useState('');

  const [showComments, setShowComments] = useState(true);

  const [initialScroll, setInitialScroll] = useState(9999);

  const history = useHistory();
  const { username, slug } = useParams();
  const alert = useAlert();
  const contentRef = useRef(null);
  const { pathname } = useLocation();

  const tags =
    blogPost &&
    blogPost !== undefined &&
    blogPost.tags &&
    blogPost.tags !== undefined
      ? blogPost.tags
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      : [];

  const handleScroll = () => {
    if (
      !blogPost ||
      blogPost === undefined ||
      blogPost === null ||
      !contentRef ||
      contentRef === null
    ) {
      return;
    }

    const { bottom } = contentRef.current.getBoundingClientRect();
    const scrolled = 1.0 - bottom / initialScroll;

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const pageScrolled = winScroll / height + 0.4;

    const averageScrolled = (scrolled + pageScrolled) / 2;

    averageScrolled <= 0
      ? setWidth(0)
      : averageScrolled >= 1
      ? setWidth(100)
      : setWidth(averageScrolled * 100);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (
      blogPost &&
      blogPost !== undefined &&
      blogPost !== null &&
      contentRef &&
      contentRef !== null
    ) {
      setInitialScroll(contentRef.current.getBoundingClientRect().bottom);
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line
  }, [blogPost, contentRef]);

  useEffect(() => {
    if (!username || username === undefined || !slug || slug === undefined) {
      history.push('/');
    }

    if (loggedInUser.username && loggedInUser.username !== undefined) {
      const data = {
        uid: loggedInUser.uid,
        profileID: loggedInUser.uid,
        slug: slug,
      };

      axios
        .post(`${APIURL}/api/blog/post/view`, data, {
          headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
        })
        .then((res) => {
          if (res.data.error === 0) {
            let update = { ...blogPost };
            update.views = update.views
              ? [...update.views, { uid: loggedInUser.uid }]
              : [{ uid: loggedInUser.uid }];
            setTimeout(() => {
              updatePosts({ ...update });
            }, 1000);
          }
        });
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
      if (u.username && u.username.toLowerCase() === username.toLowerCase()) {
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
  }, [posts, myPosts, blogProfiles]);

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

  const updatePosts = (update) => {
    if (
      !blogPost ||
      blogPost === undefined ||
      !blogPost.blogID ||
      blogPost.blogID === undefined ||
      !posts ||
      posts === undefined ||
      posts.length <= 0
    ) {
      setTimeout(() => {
        updatePosts(update);
      }, 500);
      return;
    }

    const updatedPosts = posts.map((p) => {
      if (p.blogID === blogPost.blogID) {
        return { ...update };
      } else {
        return p;
      }
    });

    const updatedMyPosts = myPosts.map((p) => {
      if (p.blogID === blogPost.blogID) {
        return { ...update };
      } else {
        return p;
      }
    });

    setTimeout(() => {
      setPosts(updatedPosts);
      setMyPosts(updatedMyPosts);
      setBlogPost({ ...update });
    }, 500);
  };

  const likePost = () => {
    const data = {
      uid: loggedInUser.uid,
      profileID: loggedInUser.uid,
      blogID: blogPost.blogID,
      like: postLiked ? 'false' : 'true',
    };

    axios
      .post(`${APIURL}/api/blog/post/like`, data, {
        headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
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
      update.likes = update.likes
        ? [...update.likes, { uid: loggedInUser.uid }]
        : [{ uid: loggedInUser.uid }];
    }

    updatePosts({ ...update });
    setPostLiked((prev) => !prev);
  };

  const favoritePost = () => {
    const data = {
      uid: loggedInUser.uid,
      profileID: loggedInUser.uid,
      blogID: blogPost.blogID,
      favorite: postFavorited ? 'false' : 'true',
    };

    axios
      .post(`${APIURL}/api/blog/post/favorite`, data, {
        headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
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

  const postComment = (isEditing) => {
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
      profileID: loggedInUser.uid,
      blogID: blogPost.blogID,
      commentID: isEditing ? editComment : v4(),
      comment: isEditing ? editingComment : comment,
      timestamp: timestamp,
    };

    axios
      .post(
        `${APIURL}/api/blog/post/comment/${isEditing ? 'edit' : 'add'}`,
        data,
        {
          headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
        }
      )
      .then((res) => {
        if (res.data.error === 0) {
          alert.success(
            `Comment successfully ${isEditing ? 'edited' : 'posted'}!`
          );

          if (loggedInUser.uid !== blogPost.authorID) {
            const notificationData = {
              uid: loggedInUser.uid,
              notificationID: v4(),
              profileID: blogPost.authorID,
              type: `comment_${isEditing ? 'edit' : 'new'}`,
              linkTo: pathname.toString(),
              timestamp: timestamp,
            };

            axios
              .post(
                `${APIURL}/api/blog/user/notification/create`,
                { ...notificationData },
                {
                  headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
                }
              )
              .then((response) => {
                if (response.data.error !== 0) {
                  console.log(response.data);
                }
              });
          }
        } else {
          console.log(res.data);
        }
      });

    let update = { ...blogPost };

    if (isEditing) {
      update.comments = update.comments.map((c) => {
        if (c.commentID === editComment) {
          return { ...data };
        } else {
          return { ...c };
        }
      });
      cancelEditComment();
    } else {
      update.comments = update.comments
        ? [...update.comments, { ...data }]
        : [{ uid: loggedInUser.uid }];

      setComment('');
      setShowComments(true);
    }

    updatePosts({ ...update });
  };

  const checkCommentLike = (commentID) => {
    const comment = blogPost.comments.find((c) => c.commentID === commentID);

    if (!comment || comment === undefined) {
      return false;
    }

    if (
      !comment.reacts ||
      comment.reacts === undefined ||
      comment.reacts.length <= 0
    ) {
      return false;
    }

    return comment.reacts.some((l) => l.uid === loggedInUser.uid);
  };

  const getCommentOwner = (profileID) => {
    const profile = blogProfiles.find((p) => p.uid === profileID);

    if (!profile || profile === undefined) {
      return 'Unknown User';
    }

    return profile;
  };

  const likeComment = (commentID, commentUID) => {
    const data = {
      uid: loggedInUser.uid,
      profileID: loggedInUser.uid,
      blogID: blogPost.blogID,
      commentID: commentID,
      like: !checkCommentLike(commentID) ? 'true' : 'false',
    };

    axios
      .post(`${APIURL}/api/blog/post/comment/like`, data, {
        headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          console.log(res.data);
        } else {
          if (loggedInUser.uid !== commentUID) {
            let d = new Date();
            const timestamp = new Date(
              d.getUTCFullYear(),
              d.getUTCMonth(),
              d.getUTCDate(),
              d.getUTCHours(),
              d.getUTCMinutes(),
              d.getUTCSeconds()
            );

            const notificationData = {
              uid: loggedInUser.uid,
              notificationID: v4(),
              profileID: commentUID,
              type: `comment_like`,
              linkTo: pathname.toString(),
              timestamp: timestamp,
            };

            axios
              .post(
                `${APIURL}/api/blog/user/notification/create`,
                { ...notificationData },
                {
                  headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
                }
              )
              .then((response) => {
                if (response.data.error !== 0) {
                  console.log(response.data);
                }
              });
          }
        }
      });

    let update = { ...blogPost };
    update.comments = update.comments.map((c) => {
      if (c.commentID === commentID) {
        const updatedComment = { ...c };
        if (data.like === 'true') {
          updatedComment.reacts =
            updatedComment.reacts && updatedComment.reacts.length > 0
              ? [...updatedComment.reacts, { uid: loggedInUser.uid }]
              : [[{ uid: loggedInUser.uid }]];
        } else {
          updatedComment.reacts = updatedComment.reacts.filter(
            (l) => l.uid !== loggedInUser.uid
          );
        }
        return updatedComment;
      } else {
        return c;
      }
    });

    updatePosts({ ...update });
  };

  const prepareEditComment = (commentID, content) => {
    setEditComment(commentID);
    setEditingComment(content);
  };

  const cancelEditComment = () => {
    setEditComment('');
    setEditingComment('');
  };

  const deleteComment = (commentID) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const data = {
        uid: loggedInUser.uid,
        profileID: loggedInUser.uid,
        blogID: blogPost.blogID,
        commentID: editComment,
      };

      axios
        .post(`${APIURL}/api/blog/post/comment/delete`, data, {
          headers: { Authorization: `Bearer ${loggedInUser.jwt}` },
        })
        .then((res) => {
          if (res.data.error === 0) {
            alert.success(`Comment successfully deleted!`);
          } else {
            console.log(res.data);
          }
        });

      let update = { ...blogPost };
      update.comments = update.comments.filter(
        (c) => c.commentID !== commentID
      );

      updatePosts({ ...update });
    }
  };

  const settings = {
    customPaging: function (i) {
      return (
        <div className="w-2 h-2 bg-gray-500 p-2 rounded-full flex items-center justify-center mt-2"></div>
      );
    },
    useTransform: true,
    dots: true,
    dotsClass: 'slick-dots slick-thumb',
    infinite: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    // autoplay: true,
    // speed: 2000,
    // autoplaySpeed: 3000,
    cssEase: 'ease-out',
    centerMode: true,
    centerPadding: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          dots: false,
        },
      },
    ],
  };

  return blogPost &&
    blogPost !== undefined &&
    blogProfile &&
    blogProfile !== undefined ? (
    <div className="w-full flex flex-col items-center px-2 sm:px-3 lg:px-20 pb-4 pt-24 sm:pt-26 lg:pt-28">
      <div className="w-full flex lg:flex-row flex-col lg:justify-between bg-gray-900 rounded-lg p-2">
        <div className="lg:w-3/4 w-full">
          <div className="font-bold tracking-wider text-xl sm:text-3xl lg:text-4xl text-gray-200 sm:my-0 my-1">
            {blogPost.title}
          </div>
          <div className="font-open tracking-wider sm:text-xl text-base text-gray-200 bg-gray-800 rounded p-1 sm:mr-2 sm:my-0 my-1">
            {blogPost.subtitle}
          </div>
        </div>

        <div className="lg:w-1/4 w-full h-full flex items-center bg-gray-700 rounded-lg p-2 border-2 border-gray-900 sm:mt-2 lg:mt-0">
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
              className="h-16 w-16 z-0 object-cover border-2 border-blue-400 rounded-full"
            />
          </div>
          <div className="flex-col flex-1">
            <div className="w-full flex items-center">
              <button
                className="text-left text-blue-500 font-open text-sm sm:text-lg lg:text-base bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 px-2 py-1 rounded-lg w-full"
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
                    title={
                      followingAuthor ? 'Following user' : 'Not Following user'
                    }
                    className={`sm:w-10 sm:h-10 w-6 h-6 flex items-center justify-center ri-user-${
                      followingAuthor ? 'add' : 'unfollow'
                    }-fill mx-2 sm:text-lg text-sm text-${
                      followingAuthor ? 'blue' : 'red'
                    }-400 hover:bg-gray-900 focus:bg-gray-900 p-2 rounded-full`}
                  ></div>
                )}
            </div>
            <div className="w-full text-left text-blue-200 font-open text-xs sm:text-sm lg:text-xs ml-2 mt-1">
              Posted on{' '}
              {convertDate(blogPost.created_on)
                .split(' ')
                .slice(0, 5)
                .join(' ')}
            </div>
            <div className="w-full text-left text-blue-200 font-open text-xs sm:text-sm lg:text-xs ml-2">
              Last updated on{' '}
              {convertDate(blogPost.updated_on)
                .split(' ')
                .slice(0, 5)
                .join(' ')}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col my-2 bg-gray-900 sm:p-2 p-2 rounded-lg sm:items-end items-center">
        <div
          className="w-full rounded-lg sm:text-sm text-xs text-gray-300 p-2"
          ref={contentRef}
        >
          {blogPost.carousel &&
            blogPost.carousel !== undefined &&
            blogPost.carousel.length > 0 && (
              <div className="w-full flex justify-center">
                <div className="lg:w-3/5 w-5/6 mb-2">
                  <Slider {...settings}>
                    {blogPost.carousel.map((im, i) => (
                      <img
                        src={`${UPLOADSURL}/${im}`}
                        alt={`slider-${i}`}
                        key={`slider-${i}`}
                        className="sm:h-100 h-60 object-scale-down"
                      />
                    ))}
                  </Slider>
                </div>
              </div>
            )}

          <Parser content={blogPost.content} />
        </div>
      </div>

      {loggedInUser.username && loggedInUser.username !== undefined && (
        <div className="w-full flex mb-2 bg-gray-900 sm:p-2 p-2 rounded-lg items-center justify-around">
          <button
            title={postLiked ? 'Unlike' : 'Like Post'}
            onClick={() => likePost()}
            className={`w-2/5 text-center rounded-lg p-2 hover:bg-gray-800
             focus:bg-gray-800
             text-blue-300 ri-thumb-up-${postLiked ? 'fill' : 'line'} ${
              postLiked ? 'bg-gray-700' : ''
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
              postFavorited ? 'bg-gray-700' : ''
            } sm:text-lg text-sm`}
          ></button>
        </div>
      )}

      <div className="w-full flex justify-start flex-wrap	">
        <div className="flex items-center rounded-lg bg-gray-900 p-1 flex-wrap	">
          <div className="text-left text-blue-200 font-open sm:text-base text-xs mr-1 rounded py-2 px-4 bg-gray-800 my-1">
            Views: {blogPost.views !== undefined ? blogPost.views.length : 0}
          </div>
          <div className="text-left text-blue-200 font-open sm:text-base text-xs mr-1 rounded py-2 px-4 bg-gray-800 my-1">
            Likes: {blogPost.likes !== undefined ? blogPost.likes.length : 0}
          </div>
          <div className="text-left text-blue-200 font-open sm:text-base text-xs mr-1 rounded py-2 px-4 bg-gray-800 my-1">
            Comments:{' '}
            {blogPost.comments !== undefined ? blogPost.comments.length : 0}
          </div>
          {tags.length > 0 && (
            <div className="text-left text-blue-200 font-open sm:text-base text-xs rounded py-1 bg-blue-600 my-1">
              {tags.map((t, i) => (
                <button
                  className={`text-left text-blue-200 font-open sm:text-base text-xs ml-1 rounded py-1 px-4 bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 ${
                    i === tags.length - 1 && 'mr-1'
                  }`}
                  key={`tag-${i}}`}
                  title={`Find more posts with the tag ${t}`}
                  onClick={() =>
                    history.push(`/search/${t.split(' ').join('+')}`)
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col my-2 bg-gray-900 sm:p-2 p-2 rounded-lg items-center">
        <div className="w-full flex items-center">
          <div className="text-lg sm:text-2xl lg:text-3xl font-sans tracking-wider font-bold text-blue-200 ml-2 mr-4">
            Comments
          </div>
          {blogPost.comments &&
            blogPost.comments !== undefined &&
            blogPost.comments.length > 0 && (
              <button
                className="p-2 w-2/3 sm:w-1/3 lg:w-1/6 rounded-lg sm:text-sm text-xs bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 font-open text-gray-100"
                onClick={() => setShowComments((prev) => !prev)}
              >
                {showComments ? 'Hide' : 'Show'} Comments
              </button>
            )}
        </div>
        {loggedInUser.username &&
          loggedInUser.username !== undefined &&
          editComment.length <= 0 && (
            <div className="w-full mb-2 p-2 flex justify-between items-center">
              <textarea
                title="CommentBox"
                className="lg:w-5/6 w-4/5 p-2 rounded-lg bg-gray-700 text-gray-400 placeholder-gray-500 sm:text-base text-xs"
                placeholder="Enter a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ minHeight: '3rem' }}
              />
              <button
                className={`sm:w-1/5 w-1/6 rounded-lg bg-gray-800 ${
                  comment.length > 0
                    ? 'hover:bg-gray-700 focus:bg-gray-700'
                    : 'opacity-50'
                } sm:h-10 h-8 sm:text-lg text-sm font-open text-gray-400 sm:ml-2`}
                onClick={() => (comment.length > 0 ? postComment(false) : null)}
              >
                Post
              </button>
            </div>
          )}
        <span
          className={`w-full mb-2 ${
            editingComment ? 'mt-4 lg:mt-3' : '-mt-2 lg:-mt-1'
          } bg-blue-800 flex justify-between items-center p-1 rounded`}
        ></span>
        {blogPost.comments &&
        blogPost.comments !== undefined &&
        editComment.length <= 0 &&
        blogPost.comments.length > 0 ? (
          showComments &&
          blogPost.comments.map((comm, i) => (
            <div
              className={`w-full bg-gray-800 rounded-lg p-2 flex sm:flex-row flex-col sm:items-end items-center ${
                i < blogPost.comments.length - 1 ? 'mb-2' : 'mb-0'
              }`}
              key={comm.commentID}
            >
              <div
                className={`${
                  loggedInUser.username && loggedInUser.username !== undefined
                    ? 'lg:w-4/5'
                    : ''
                } w-full flex pr-2`}
              >
                <img
                  src={
                    getCommentOwner(comm.uid).profile_pic &&
                    getCommentOwner(comm.uid).profile_pic !== undefined &&
                    getCommentOwner(comm.uid).profile_pic.length > 3
                      ? `${UPLOADSURL}/${getCommentOwner(comm.uid).profile_pic}`
                      : tmpAvatar
                  }
                  alt="p.c.pic"
                  className="sm:h-16 sm:w-16 h-10 w-10 z-0 object-cover border-2 border-blue-400 rounded-full mr-2"
                />
                <div className="w-full flex flex-col">
                  <button
                    className="font-open lg:text-lg text-base text-left text-blue-400 underline hover:no-underline focus:no-underline"
                    onClick={() =>
                      history.push(
                        `/profile/${getCommentOwner(comm.uid).username}`
                      )
                    }
                  >
                    {getCommentOwner(comm.uid).username.length > 12
                      ? `${getCommentOwner(comm.uid).username.substring(
                          0,
                          12
                        )}...`
                      : getCommentOwner(comm.uid).username}
                  </button>

                  <div className="text-xs text-yellow-400 font-rale">
                    Last Modified on{' '}
                    {convertDate(comm.timestamp)
                      .split(' ')
                      .slice(0, 5)
                      .join(' ')}
                  </div>

                  <div className="font-open sm:text-sm text-xs text-blue-200 w-full bg-gray-700 rounded p-1 mt-1">
                    {comm.comment}
                  </div>
                </div>
              </div>
              {loggedInUser.username && loggedInUser.username !== undefined && (
                <div className="sm:w-1/5 w-full sm:h-16 sm:mt-0 mt-2 rounded-lg bg-gray-900 flex justify-between items-center p-2">
                  <button
                    className={`w-3/10 h-full text-center rounded-lg p-2 hover:bg-gray-800
             focus:bg-gray-800
             text-blue-300 ri-thumb-up-${
               checkCommentLike(comm.commentID) ? 'fill' : 'line'
             } ${
                      checkCommentLike(comm.commentID) ? 'bg-gray-700' : ''
                    } text-xs sm:text-base lg:text-lg`}
                    onClick={() => likeComment(comm.commentID, comm.uid)}
                  ></button>
                  {comm.uid === loggedInUser.uid && (
                    <button
                      className={`w-3/10 h-full text-center rounded-lg p-2 hover:bg-gray-800
             focus:bg-gray-800
             text-yellow-300 ri-pencil-${
               editComment === comm.commentID ? 'fill' : 'line'
             } ${
                        editComment === comm.commentID ? 'bg-gray-700' : ''
                      } text-xs sm:text-base lg:text-lg`}
                      onClick={() =>
                        prepareEditComment(comm.commentID, comm.comment)
                      }
                    ></button>
                  )}
                  {comm.uid === loggedInUser.uid && (
                    <button
                      className={`w-3/10 h-full text-center rounded-lg p-2 hover:bg-gray-800 focus:bg-gray-800 text-red-300 ri-delete-bin-line text-xs sm:text-base lg:text-lg`}
                      onClick={() => deleteComment(comm.commentID)}
                    ></button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : editComment.length > 0 ? (
          <div className="w-full mb-2 p-2 flex justify-between items-center">
            <textarea
              title="EditCommentBox"
              className="sm:w-5/6 w-4/5 p-2 rounded-lg bg-gray-700 text-gray-400 placeholder-gray-500 sm:text-base text-xs"
              placeholder="Enter a comment..."
              value={editingComment}
              onChange={(e) => setEditingComment(e.target.value)}
              style={{ minHeight: '5rem' }}
            />
            <div className="sm:w-1/5 w-1/6 h-full flex flex-col items-center justify-end">
              <button
                className={`sm:w-4/5 w-full rounded-lg bg-gray-800 ${
                  editingComment.length > 0
                    ? 'hover:bg-gray-700 focus:bg-gray-700'
                    : 'opacity-50'
                } sm:h-10 h-8 text-xs sm:text-base lg:text-lg font-open text-gray-400`}
                onClick={() =>
                  editingComment.length > 0 ? postComment(true) : null
                }
              >
                Submit
              </button>
              <button
                className={`sm:w-4/5 w-full rounded-lg bg-gray-800 hover:bg-gray-700 focus:bg-gray-700
                  } sm:h-10 h-8 text-xs sm:text-base lg:text-lg font-open text-gray-400 mt-2`}
                onClick={() =>
                  editingComment.length > 0 ? cancelEditComment() : null
                }
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full text-center text-base sm:text-lg lg:text-xl font-rale tracking-wider text-yellow-300 my-2">
            No comments yet.
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="w-full flex flex-col items-center px-2 sm:px-3 lg:px-20 pb-4 pt-20 sm:pt-24 lg:pt-28">
      <div className="w-full flex lg:flex-row flex-col lg:justify-between bg-gray-900 rounded-lg pt-1 px-1 pb-2">
        <div className="lg:w-3/4 w-full mt-2">
          <div className="sm:my-0 my-1 w-full bg-gray-800 p-6 rounded-lg sm:mr-4 animate-pulse"></div>
          <div className="w-full bg-gray-800 p-4 mt-2 rounded-lg sm:mr-4 animate-pulse"></div>
        </div>

        <div className="lg:w-1/4 w-full h-full flex items-center bg-gray-700 rounded-lg p-2 border-2 border-gray-900 lg:ml-2 lg:mt-1 mt-2">
          <div className="w-1/5 h-full flex justify-center items-center">
            <div className="h-16 w-16 z-0 object-cover bg-gray-900 rounded-full animate-pulse" />
          </div>
          <div className="flex-col flex-1">
            <div className="w-full flex items-center">
              <button
                className="text-left text-blue-500 font-open sm:text-base text-sm rounded-lg w-full bg-gray-900 p-4 animate-pulse"
                onClick={(e) => e.preventDefault()}
              ></button>
            </div>
            <div className="w-full mt-1 bg-gray-900 p-2 rounded-lg animate-pulse"></div>
            <div className="w-full mt-1 bg-gray-900 p-2 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col my-2 bg-gray-900 sm:p-2 p-2 rounded-lg sm:items-end items-center animate-pulse">
        <div
          className="w-full rounded-lg sm:text-xl text-base text-gray-300 p-2 h-200 flex items-center justify-center"
          ref={contentRef}
        >
          Loading...
        </div>
      </div>

      <div className="w-full flex mb-2 bg-gray-900 rounded-lg items-center justify-around p-4 animate-pulse"></div>

      <div className="w-full flex justify-start flex-wrap	">
        <div className="flex items-center rounded-lg bg-gray-900 p-1 flex-wrap	">
          <div className="text-left text-blue-200 font-open text-xs sm:text-sm lg:text-base mr-1 rounded py-2 px-4 bg-gray-800">
            Views
          </div>
          <div className="text-left text-blue-200 font-open text-xs sm:text-sm lg:text-base mr-1 rounded py-2 px-4 bg-gray-800">
            Likes
          </div>
          <div className="text-left text-blue-200 font-open text-xs sm:text-sm lg:text-base rounded py-2 px-4 bg-gray-800">
            Comments
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col my-2 bg-gray-900 sm:p-2 p-2 rounded-lg items-center">
        <div className="w-full flex items-center mb-2">
          <div className="sm:text-3xl text-lg font-sans tracking-wider font-bold text-blue-200 mr-4 py-4 rounded-lg w-1/4 bg-gray-700 animate-pulse"></div>
          <button className="p-2 sm:w-1/6 w-2/3 rounded-lg sm:text-sm text-xs bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 font-open text-gray-100 animate-pulse"></button>
        </div>
        <span className="w-full mb-2 sm:mt-1 mt-2 bg-blue-800 flex justify-between items-center p-1 rounded animate-pulse"></span>
      </div>
    </div>
  );
}
