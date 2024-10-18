import React, { useState ,useEffect} from 'react';
import NewsCard from './DisplayNews';

const NewsAndMedia = () => {
  const [activeNewsView, setActiveNewsView] = useState(0);
  const [newsData, setNewsData] = useState([]); 
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    // Fetch the news data from the backend (replace the URL with your API endpoint)
    fetch('/admin-panel/news',{
      method:"GET",
      headers: {
        'Authorization': `Bearer ${token}`, // Include token
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setNews(data.news); // Assuming the data comes in the shape { news: [...] }
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
  const [thumbnail, setThumbnail] = useState(null); // New state for image file

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNews({
      ...news,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]); // Set the selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('thumbnail', thumbnail); // Append the image file
    formData.append('headline', news.headline);
    formData.append('shortNews', news.shortNews);
    formData.append('date', news.date);
    formData.append('link', news.link);
    formData.append('showOnHomepage', news.showOnHomepage);
    formData.append('showOnNewspage', news.showOnNewspage);

    try {
      const response = await fetch('/admin-panel/news', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Include token
        },
        body: formData, // Send form data with the file
      });

      if (response.ok) {
        console.log('News uploaded successfully!');
        alert('News uploaded successfully!');
      } else {
        console.error('Error uploading news');
        alert('Error uploading news');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('Error submitting the form');
    }
  };

  return (
    <>
      <div className="flex w-full justify-between">
        <button
          onClick={() => setActiveNewsView(0)}
          className={`w-[50%] bg-${activeNewsView == 0 ? 'blue-500' : 'blue-300'} py-[10px] hover:bg-blue-500 rounded-sm`}
        >
          View News
        </button>
        <button
          onClick={() => setActiveNewsView(1)}
          className={`w-[50%] bg-${activeNewsView == 1 ? 'blue-500' : 'blue-400'} py-[10px] hover:bg-blue-500 rounded-sm`}
        >
          Upload News
        </button>
      </div>

      {activeNewsView == 1 ? (
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
              <label className="text-gray-700 font-semibold" htmlFor="showOnHomepage">
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
              <label className="text-gray-700 font-semibold" htmlFor="showOnNewspage">
                Show on News Page
              </label>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Upload News
              </button>
            </div>
          </form>
        </div>
      ) :  <NewsCard news={news} />} 
    </>
  );
};

export default NewsAndMedia;
