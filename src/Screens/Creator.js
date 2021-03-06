import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';
import { useAlert } from 'react-alert';
import Slider from 'react-slick';

import { LocalContext } from '../LocalContext';
import { Parser } from '../Components/renderers';

import { v4 } from 'uuid';

export default function Creator() {
  const {
    APIURL,
    UPLOADSURL,
    UPLOADERURL,
    loggedInUser,
    setPosts,
    myPosts,
    setMyPosts,
    links,
    setLinks,
    setWidth,
  } = useContext(LocalContext);

  const [blogID, setBlogID] = useState(v4());

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tags, setTags] = useState('');

  const [slug, setSlug] = useState('');

  const [content, setContent] = useState('');
  const [previewImage, setPreviewImage] = useState('_empty');
  const [sliderImages, setSliderImages] = useState([]);

  const [imageAdd, setImageAdd] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const history = useHistory();
  const alert = useAlert();

  const { id } = useParams();
  const { pathname } = useLocation();

  useEffect(() => {
    setWidth(100);

    if (!loggedInUser.username || loggedInUser.username === undefined) {
      history.push('/admin');
    }

    const data = [
      '# This is Markdown',
      '',
      '#### You can edit me!',
      '',
      'Markdown lets you write content in a really natural way.',
      '',
      '* You can have lists, like this one',
      '* Make things **bold** or *italic*',
      '* Embed snippets of `code`',
      '* Create [links](https://hub.kinesis.games)',
      '',
      '> A block quote with ~strikethrough~ and a URL: https://hub.kinesis.games.',
      '',
      '```js',
      'const sayHelloWorld = () => {',
      "    console.log('Hello World!');",
      '}',
      '',
      'sayHelloWorld();',
      '```',
    ];

    setContent(data.join('\r\n'));

    if (id && id !== undefined) {
      myPosts.forEach((p) => {
        if (p.blogID === id) {
          setBlogID(id);
          setTitle(p.title);
          setSubtitle(p.subtitle);
          setTags(p.tags);
          setSlug(p.slug);
          setPreviewImage(p.preview_img);
          setContent(p.content);
          setSliderImages(p.carousel);
        }
      });
    } else {
      if (pathname.slice(1, 5) === 'edit') {
        history.push('/admin');
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!id || id === undefined) {
      setSlug(
        (title.split(' ').join('-').toString() + '-' + blogID.slice(-10))
          .toString()
          .toLowerCase()
      );
    }
    // eslint-disable-next-line
  }, [title]);

  const uploadImage = (e, isPreview, addToContent) => {
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

        axios.post(`${UPLOADERURL}/api/upload`, data).then((res) => {
          if (isPreview) {
            setPreviewImage(`${UPLOADSURL}/${res.data.path}`);
          }

          const postData = {
            uid: loggedInUser.uid,
            link: res.data.path,
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

                if (addToContent) {
                  setContent(
                    (prev) => prev + `\n![](${UPLOADSURL}/${res.data.path})`
                  );
                  setImageAdd(false);
                }
                alert.success('Successfully uploaded!');
              }
            });
        });
      }
    }
  };

  const checkValid = () => {
    return (
      title &&
      title.length > 3 &&
      subtitle &&
      subtitle.length > 3 &&
      tags &&
      tags.length > 3 &&
      slug &&
      slug.length > 3 &&
      content &&
      content.length > 3
    );
  };

  const addSliderImage = (link) => {
    setSliderImages((prev) => {
      if (prev.length > 0 && prev.includes(link)) {
        return prev.filter((i) => i !== link);
      } else {
        return [...prev, link];
      }
    });
  };

  const savePost = (e) => {
    let refPost = undefined;
    if (id && id !== undefined) {
      myPosts.forEach((p) => {
        if (p.blogID === id) {
          refPost = { ...p };
        }
      });
    }

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
      authorID: loggedInUser.uid,
      blogID: blogID,
      title: title.slice(0, 40),
      subtitle: subtitle.slice(0, 50),
      slug: refPost !== undefined ? refPost.slug : slug,
      preview_img: previewImage,
      carousel: sliderImages,
      status: refPost !== undefined ? refPost.status : 'DRAFT',
      tags: tags,
      created_on: refPost !== undefined ? refPost.created_on : timestamp,
      updated_on: timestamp,
      content: content,
    };

    axios
      .post(
        `${APIURL}/api/blog/post/${refPost !== undefined ? 'edit' : 'create'}`,
        { ...data },
        { headers: { Authorization: `Bearer ${loggedInUser.jwt}` } }
      )
      .then((res) => {
        if (res.data.error === 0) {
          alert.success(
            `Successfully ${refPost !== undefined ? 'Edited' : 'Created'}!`
          );
        } else {
          console.log(res.data);
        }
      });

    if (id && id !== undefined) {
      setMyPosts((prev) =>
        prev.map((p) => {
          if (p.blogID === id) {
            return { ...data };
          } else {
            return { ...p };
          }
        })
      );

      if (data.status === 'PUBLISHED') {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.blogID === id) {
              return { ...data };
            } else {
              return { ...p };
            }
          })
        );
      }
    } else {
      setMyPosts((prev) => [{ ...data }, ...prev]);
    }

    history.push('/admin');
  };

  const reset = () => {
    setBlogID('');
    setTitle('');
    setContent('');
    setSubtitle('');
    setPreviewImage('');

    history.push('/admin');
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

  return (
    <div className="w-full flex flex-col items-center px-2 sm:px-3 lg:px-20 pt-20">
      <div className="w-full flex flex-col sm:mt-8 mt-4 bg-gray-900 sm:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center">
          <div className="sm:w-1/3 w-11/12 sm:text-left text-center sm:ml-8 text-xl lg:text-2xl font-sans tracking-wide text-bold text-gray-300 sm:my-0 my-2">
            Title
          </div>

          <div className="sm:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <input
              type="text"
              id="title"
              name="title"
              className="w-full rounded-lg sm:p-2 p-1 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-2 border-blue-200 sm:text-base text-sm"
              placeholder="Type something..."
              value={title}
              onChange={(e) => {
                if (e.target.value.length < 41) {
                  setTitle(e.target.value);
                } else {
                  alert.error('Max limit reached');
                }
              }}
            />
          </div>
        </div>

        {title && (
          <div className="sm:w-49/100 w-11/12 font-sans sm:text-xs text-xss text-green-300 sm:text-left sm:mt-2 mt-4">
            Blog post will be available on{' '}
            <a
              href={`https://blog.connect.kinesis.games/${loggedInUser.username}/${slug}`}
              target="_blank"
              rel="noopenner noreferrer"
              className="underline text-blue-300 hover:no-underline focus:no-underline"
            >
              https://blog.connect.kinesis.games/{loggedInUser.username}/{slug}
            </a>{' '}
            after you publish it.
          </div>
        )}
      </div>

      <div className="w-full flex flex-col mt-4 bg-gray-900 sm:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center">
          <div className="sm:w-1/3 w-11/12 sm:text-left text-center lg:text-2xl sm:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 sm:my-0 my-2">
            Subtitle
          </div>

          <div className="sm:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              className="w-full rounded-lg sm:p-2 p-1 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-2 border-blue-200 sm:text-base text-sm"
              placeholder="Type something..."
              value={subtitle}
              onChange={(e) => {
                if (e.target.value.length < 51) {
                  setSubtitle(e.target.value);
                } else {
                  alert.error('Max limit reached');
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col mt-4 bg-gray-900 sm:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center">
          <div className="sm:w-1/3 w-11/12 sm:text-left text-center lg:text-2xl sm:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 sm:my-0 my-2">
            Comma-separated tags
          </div>

          <div className="sm:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <input
              type="text"
              id="tags"
              name="tags"
              className="w-full rounded-lg sm:p-2 p-1 bg-gray-100 placeholder-gray-600 text-gray-900 font-open border-2 border-blue-200 sm:text-base text-sm"
              placeholder="e.g docker, ansible, automation"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col mt-4 bg-gray-900 lg:p-2 pb-4 pt-2 rounded-lg sm:items-end items-center">
        <div className="w-full flex lg:flex-row flex-col justify-between items-center">
          <div className="lg:w-1/3 w-11/12 lg:text-left text-center lg:text-2xl lg:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 lg:my-0 my-2">
            Preview Image (optional)
          </div>

          <div className="lg:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <div className="lg:text-xl text-base font-sans tracking-wider text-blue-300 w-full text-center mt-1">
              Click to select an already uploaded image
            </div>
            <div className="w-full flex items-center overflow-x-scroll mb-2 py-1">
              {links.map((l, i) => (
                <button
                  key={l.linkID}
                  className={`flex-shrink-0 flex-grow-0 sm:w-48 sm:h-48 w-40 h-40 border-4 border-gray-900 hover:border-blue-200 focus:border-blue-200 ${
                    previewImage.includes(l.link) && 'border-yellow-400'
                  } ${i < links.length - 1 && 'sm:mr-2 mr-1'}`}
                  onClick={() => {
                    if (previewImage.includes(l.link)) {
                      setPreviewImage('_empty');
                    } else {
                      setPreviewImage(`${UPLOADSURL}/${l.link}`);
                    }
                  }}
                >
                  <img
                    title={l.link}
                    src={`${UPLOADSURL}/${l.link}`}
                    alt="not available"
                    className="w-full h-full object-scale-down"
                  />
                </button>
              ))}
            </div>
            <div className="w-full flex items-center justify-around">
              <input
                type="file"
                title="Upload a new image"
                id="image"
                name="image"
                accept=".jpg,.jpeg,.png,.svg,.gif,.bmp"
                className="lg:w-2/5 w-9/20 bg-blue-300 text-blue-900 hover:bg-blue-400 focus:bg-blue-400 rounded-lg p-2 text-sm sm:text-lg lg:text-xl overflow-hidden"
                onChange={(e) => {
                  e.persist();
                  alert.info('Uploading...');
                  uploadImage(e, true, false);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col mt-4 bg-gray-900 lg:p-2 pb-4 pt-2 rounded-lg lg:items-end items-center">
        <div className="w-full flex lg:flex-row flex-col justify-between items-center">
          <div className="lg:w-1/3 w-11/12 lg:text-left text-center lg:text-2xl lg:ml-8 text-xl font-sans tracking-wide text-bold text-gray-300 lg:my-0 my-2">
            Image Slider (optional) {`(${sliderImages.length})`}
          </div>

          <div className="lg:w-49/100 w-11/12 flex flex-col justify-center items-center">
            <div className="lg:text-xl text-base font-sans tracking-wider text-blue-300 w-full text-center mt-1">
              Click to select images
            </div>
            <div className="w-full flex items-center overflow-x-scroll mb-2 py-1">
              {links.map((l, i) => (
                <button
                  key={l.linkID}
                  className={`flex-shrink-0 flex-grow-0 lg:w-48 lg:h-48 w-40 h-40 border-4 border-gray-900 hover:border-blue-200 focus:border-blue-200 ${
                    sliderImages.includes(l.link) && 'border-yellow-400'
                  } ${i < links.length - 1 && 'sm:mr-2 mr-1'}`}
                  onClick={() => {
                    addSliderImage(l.link);
                  }}
                >
                  <img
                    title={l.link}
                    src={`${UPLOADSURL}/${l.link}`}
                    alt="not available"
                    className="w-full h-full object-scale-down"
                  />
                </button>
              ))}
            </div>
            <div className="w-full flex items-center justify-around">
              <input
                type="file"
                title="Upload a new image"
                id="image"
                name="image"
                accept=".jpg,.jpeg,.png,.svg,.gif,.bmp"
                className="lg:w-2/5 w-9/20 bg-blue-300 text-blue-900 hover:bg-blue-400 focus:bg-blue-400 rounded-lg p-2 text-sm sm:text-lg lg:text-xl overflow-hidden"
                onChange={(e) => {
                  e.persist();
                  alert.info('Uploading...');
                  uploadImage(e, false, false);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-full w-full bg-gray-800 flex flex-col justify-between items-center mt-4">
        <div className="w-full flex items-center sm:mb-2">
          <div className="text-xl sm:text-2xl lg:text-3xl font-sans font-bold tracking-wider text-gray-300 mr-2">
            Content
          </div>
          {!imageAdd && (
            <button
              title="Insert image"
              className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mr-2 lg:w-16 lg:h-12 w-10 h-10 rounded ri-image-add-fill bg-gray-700 hover:bg-gray-900 focus:bg-gray-900 flex items-center justify-center"
              onClick={() => setImageAdd(true)}
            ></button>
          )}
          <button
            title={isPreview ? 'Unpreview' : 'Preview'}
            className={`text-lg sm:text0xl lg:text-2xl text-gray-300 mr-2 lg:h-12 h-10 rounded font-bold flex items-center justify-center px-2 ${
              isPreview
                ? 'bg-gray-900 hover:bg-gray-700 focus:bg-gray-700'
                : 'bg-gray-700 hover:bg-gray-900 focus:bg-gray-900'
            }`}
            onClick={() => setIsPreview((prev) => !prev)}
          >
            Preview
          </button>
        </div>

        {!imageAdd ? (
          !isPreview ? (
            <textarea
              className="w-full lg:my-0 my-2 rounded-lg sm:text-sm text-xs bg-gray-900 text-gray-300 p-4 placeholder-gray-500 overflow-y-scroll"
              value={content}
              placeholder="Write something..."
              onChange={(e) => setContent(e.target.value)}
              style={{
                height: '30rem',
                minHeight: '20rem',
                maxHeight: '40rem',
              }}
            />
          ) : (
            <div
              className="w-full lg:my-0 my-2 rounded-lg sm:text-sm text-xs bg-gray-700 text-gray-300 p-4 overflow-y-scroll"
              style={{
                height: '30rem',
                minHeight: '20rem',
                maxHeight: '40rem',
              }}
            >
              {sliderImages.length > 0 && (
                <div className="w-full flex justify-center">
                  <div className="lg:w-3/5 w-5/6 mb-2">
                    <Slider {...settings}>
                      {sliderImages.map((im, i) => (
                        <img
                          src={`${UPLOADSURL}/${im}`}
                          alt={`slider-${i}`}
                          key={`slider-${i}`}
                          className="sm:h-80 h-60 object-scale-down"
                        />
                      ))}
                    </Slider>
                  </div>
                </div>
              )}

              <Parser content={content} />
            </div>
          )
        ) : (
          <div
            className="w-full sm:my-0 my-2 rounded-lg sm:text-sm text-xs bg-gray-900 text-gray-300 p-4 placeholder-gray-500 flex flex-col justify-around"
            style={{ height: '30rem' }}
          >
            <div className="sm:text-xl text-lg font-sans tracking-wider text-blue-300 w-full text-center ">
              Click on an image to insert it
            </div>
            <div className="w-full flex items-center overflow-x-scroll h-1/2">
              {links.map((l, i) => (
                <button
                  className="flex-shrink-0 flex-grow-0 lg:w-48 lg:h-48 w-40 h-40 border-2 border-gray-900 hover:border-blue-200 focus:border-blue-200"
                  onClick={() => {
                    setContent(
                      (prev) => prev + `\n![](${UPLOADSURL}/${l.link})`
                    );
                    setImageAdd(false);
                  }}
                >
                  <img
                    key={l.linkID}
                    title={l.link}
                    src={`${UPLOADSURL}/${l.link}`}
                    alt="not available"
                    className={`w-full h-full object-scale-down ${
                      i < links.length - 1 && 'lg:mr-2 mr-1'
                    } `}
                  />
                </button>
              ))}
            </div>
            <div className="w-full flex items-center justify-around">
              <input
                type="file"
                title="Upload a new image"
                id="image"
                name="image"
                accept=".jpg,.jpeg,.png,.svg,.gif,.bmp"
                className="lg:w-2/5 w-9/20 bg-blue-300 text-blue-900 hover:bg-blue-400 focus:bg-blue-400 rounded-lg p-4 text-sm sm:text-base lg:text-xl overflow-hidden"
                onChange={(e) => {
                  e.persist();
                  alert.info('Uploading...');
                  uploadImage(e, false, true);
                }}
              />
              <button
                className="sm:w-2/5 w-9/20 bg-red-300 text-red-900 hover:bg-red-400 focus:bg-red-400 rounded-lg p-4 text-lg lg:text-xl font-bold tracking-wide"
                onClick={() => setImageAdd(false)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-gray-800 flex sm:flex-row flex-col justify-around items-center mt-4 mb-4">
        <button
          className={`w-5/6 sm:w-1/3 lg:w-1/4 p-2 tracking-wide font-sans sm:text-lg text-sm rounded-lg bg-green-400 ${
            checkValid()
              ? 'hover:bg-green-500 focus:bg-green-500'
              : 'opacity-50'
          }`}
          onClick={() => (checkValid() ? savePost() : null)}
        >
          Save
        </button>

        <button
          className="w-5/6 sm:w-1/3 lg:w-1/4 p-2 tracking-wide font-sans sm:text-lg text-sm rounded-lg bg-red-400 hover:bg-red-500 focus:bg-red-500 sm:mt-0 mt-2"
          onClick={() => reset()}
        >
          Discard
        </button>
      </div>
    </div>
  );
}
