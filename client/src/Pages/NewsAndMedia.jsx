import React, { useState, useEffect } from 'react';
import NewsCard from './DisplayNews';

const NewsAndMedia = () => {
  const [activeNewsView, setActiveNewsView] = useState(0); // 0: View, 1: Upload, 2: Edit
  const [newsData, setNewsData] = useState([]); 
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNewsId, SetSelectedNewsId] = useState(false);
  const [editNewsId, setEditNewsId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('http://localhost:8000/admin-panel/news', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Include token
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setNewsData(data.news); // Assuming the response structure is { news: [...] }
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
      });
  }, []);

  const [news, setNews] = useState({
    headline: '',
    shortNews: '',
    date: '',
    link: '',
    showOnHomepage: false,
    showOnNewspage: false,
  });
  const [thumbnail, setThumbnail] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNews({
      ...news,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    const formData = new FormData();
    formData.append('thumbnail', thumbnail);
    formData.append('headline', news.headline);
    formData.append('shortNews', news.shortNews);
    formData.append('date', news.date);
    formData.append('link', news.link);
    formData.append('showOnHomepage', news.showOnHomepage);
    formData.append('showOnNewspage', news.showOnNewspage);

    try {
      const response = await fetch('http://localhost:8000/admin-panel/news', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Include token
        },
        body: formData, // Send form data with the file
      });

      if (response.ok) {
        alert('News uploaded successfully!');
      } else {
        alert('Error uploading news');
      }
    } catch (error) {
      alert('Error submitting the form');
    }
  };
const changeToDefault=()=>{
 setActiveNewsView(1);
 setNews({
  headline: '',
  shortNews: '',
  date: '',
  link: '',
  showOnHomepage: false,
  showOnNewspage: false,
})
}
  const handleEdit = (newsItem) => {
    setNews({
      headline: newsItem.headline,
      shortNews: newsItem.shortNews,
      id:newsItem.id,
      date: newsItem.date,
      link: newsItem.link,
      showOnHomepage: newsItem.showOnHomepage,
      showOnNewspage: newsItem.showOnNewspage,
    });
    setIsEditing(true);
    setActiveNewsView(2); // Edit mode
    setEditNewsId(newsItem.id);
  };

const handleEditSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('thumbnail', thumbnail);
  formData.append('id', news.id);
  formData.append('headline', news.headline);
  formData.append('shortNews', news.shortNews);
  formData.append('date', news.date);
  formData.append('link', news.link);
  formData.append('showOnHomepage', news.showOnHomepage);
  formData.append('showOnNewspage', news.showOnNewspage);

  try {
    const response = await fetch(`http://localhost:8000/admin-panel/news/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      alert('News updated successfully!');
      setIsEditing(false);

      // Update the specific news item in the state
      setNewsData((prev) => 
        prev.map((item) => 
          item.id === news.id 
            ? { 
                ...item, 
                thumbnail, 
                headline: news.headline, 
                shortNews: news.shortNews, 
                date: news.date, 
                link: news.link, 
                showOnHomepage: news.showOnHomepage, 
                showOnNewspage: news.showOnNewspage 
              }
            : item
        )
      );

      setActiveNewsView(0); // Switch back to view mode
    } else {
      alert('Error updating news');
    }
  } catch (error) {
    alert('Error submitting the form');
  }
};


  const handleDelete = async (newsId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this news?');
    if (confirmDelete) {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`http://localhost:8000/admin-panel/news/${newsId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setNewsData(newsData.filter((item) => item.id !== newsId));
          alert('News deleted successfully!');
        } else {
          alert('Error deleting news');
        }
      } catch (error) {
        alert('Error deleting news');
      }
    }
  };

  return (
    <>
      <div className="flex w-full justify-between">
        <button
          onClick={() => setActiveNewsView(0)}
          className={`w-[50%] bg-${activeNewsView === 0 ? 'blue-500' : 'blue-300'} py-[10px] hover:bg-blue-500 rounded-sm`}
        >
          View News
        </button>
        <button
          onClick={() =>  changeToDefault(1) }
          className={`w-[50%] bg-${activeNewsView === 1 ? 'blue-500' : 'blue-400'} py-[10px] hover:bg-blue-500 rounded-sm`}
        >
          Upload News
        </button>
      </div>

      {activeNewsView === 1 ? (
        <div className="w-[80%] mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
          <h1 className="text-2xl font-bold mb-6 text-center">Upload News</h1>
          <form onSubmit={handleSubmit}>
            {/* Thumbnail upload */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="thumbnail">
                Thumbnail Image
              </label>
              <input
                type="file"
                name="thumbnail"
                id="thumbnail"
                onChange={handleThumbnailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept="image/*"
                required
              />
            </div>

            {/* Other fields */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="headline">
                Headline
              </label>
              <input
                type="text"
                name="headline"
                id="headline"
                value={news.headline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter headline"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="shortNews">
                Short News
              </label>
              <textarea
                name="shortNews"
                id="shortNews"
                value={news.shortNews}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter short news description"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={news.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="link">
                Article Link
              </label>
              <input
                type="url"
                name="link"
                id="link"
                value={news.link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/news-article"
                required
              />
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="showOnHomepage"
                id="showOnHomepage"
                checked={news.showOnHomepage}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="showOnHomepage" className="text-gray-700 font-semibold">
                Show on Homepage
              </label>
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="showOnNewspage"
                id="showOnNewspage"
                checked={news.showOnNewspage}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="showOnNewspage" className="text-gray-700 font-semibold">
                Show on News Page
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <NewsCard news={newsData} handleDelete={handleDelete} handelEdit={handleEdit}/>
      )}

      {/* Edit Form */}
      {activeNewsView === 2 && (
        <div className="w-[80%] mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
          <h1 className="text-2xl font-bold mb-6 text-center">Edit News</h1>
          <form onSubmit={handleEditSubmit}>
            {/* Thumbnail upload */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="thumbnail">
                Thumbnail Image
              </label>
              <input
                type="file"
                // value={news.thumbnail}
                name="thumbnail"
                id="thumbnail"
                onChange={handleThumbnailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept="image/*"
              />
            </div>

            {/* Other fields */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="headline">
                Headline
              </label>
              <input
                type="text"
                name="headline"
                id="headline"
                value={news.headline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter headline"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="shortNews">
                Short News
              </label>
              <textarea
                name="shortNews"
                id="shortNews"
                value={news.shortNews}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter short news description"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={news.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="link">
                Article Link
              </label>
              <input
                type="url"
                name="link"
                id="link"
                value={news.link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/news-article"
                required
              />
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="showOnHomepage"
                id="showOnHomepage"
                checked={news.showOnHomepage}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="showOnHomepage" className="text-gray-700 font-semibold">
                Show on Homepage
              </label>
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="showOnNewspage"
                id="showOnNewspage"
                checked={news.showOnNewspage}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="showOnNewspage" className="text-gray-700 font-semibold">
                Show on News Page
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Update News
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default NewsAndMedia;
