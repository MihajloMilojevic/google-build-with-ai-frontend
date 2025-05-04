import { useEffect, useState } from "react";
import { API_URL, SHOULD_FETCH_ME } from "../CONSTANTS";
import { useNavigate, Link } from "react-router-dom";
import formatTimestamp from "../utils/formatData";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  async function FetchPosts() {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      const code = response.status;
      const data = await response.json();
      if (!response.ok) {
        return {
          error: new Error(data.message || "Дошло је до грешке при учитавању података."),
          data: null,
          code,
        };
      }
      return { error: null, data, code };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { error, data: null, code: 500 };
    }
  }

  useEffect(() => {
    (async () => {
      const { error, data, code } = await FetchPosts();
      if (error) {
        setError(error.message);
        setLoading(false);
        if (code === 401 && SHOULD_FETCH_ME) {
          navigate("/auth");
        }
      } else {
        setPosts(data.posts);
        setLoading(false);
      }
    })();
  }, []);

  const handleAddPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Грешка при креирању објаве.");
      }
      setPosts([data.post, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowModal(false);
      setError(null);
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">📌 Објаве</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          ➕ Нова објава
        </button>
      </div>

      {loading && <p className="text-gray-500">Учитавање...</p>}

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-4 shadow">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post, i) => (
          <Link
            to={`/posts/${post.id}`}
            key={i}
            className="block bg-white p-5 rounded-lg shadow hover:shadow-md transition border hover:border-blue-400"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{post.title}</h2>
            <p className="text-sm text-gray-500">
              Објавио <span className="text-blue-800 font-semibold">{"@" + post.name}</span> • {formatTimestamp(post.created_at)}
            </p>
          </Link>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800">Креирај објаву</h2>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Наслов"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <textarea
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Садржај"
              rows={4}
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Одустани
              </button>
              <button
                onClick={handleAddPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Објави
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
