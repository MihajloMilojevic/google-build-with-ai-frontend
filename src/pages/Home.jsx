import { useEffect, useState } from "react";
import {API_URL, SHOULD_FETCH_ME} from "../CONSTANTS"
import { data, useNavigate } from "react-router-dom";
import formatTimestamp from "../utils/formatData";
import { Link } from "react-router-dom";

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
                return {error: new Error(data.message || "Дошло је до грешке при учитавању података."), data: null, code};
            }
            return {error: null, data, code};
        } 
        catch (error) {
            console.error("Error fetching data:", error);
            return {error, data: null, code: 500};
        }
    }

    useEffect(() => {
        (async () => {
            const {error, data, code} = await FetchPosts();
            if (error) {
                setError(error);
                setLoading(false);
                if (code === 401 && SHOULD_FETCH_ME) {
                    navigate("/auth");
                }
            } else {
                setPosts(data.posts);
                setLoading(false);
            }
        })()
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
                throw new Error(data.message || "Дошло је до грешке при креирању поста.");
            }
            setPosts([data.post, ...posts]);
            setNewPost({ title: '', content: '' });
            setShowModal(false);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setLoading(false);
        }
      };

    return (
        <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Објаве:</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Нова објава
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {error != null && (
          <div className="bg-red-100 text-red-700 p-4 rounded shadow">
            <p>{error}</p>
          </div>
        )}
        {posts.map((post, i) => (
          <Link to={`/posts/${post.id}`} key={i}  className="bg-white p-4 rounded shadow" style={{display: "block"}}>
            {/* <div> */}
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">
                Објавио <span className="text-blue-900 font-semibold">{"@" + post.name}</span> • {formatTimestamp(post.created_at)}
              </p>
            {/* </div> */}
          </Link>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-bold">Креирај објаву</h2>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Наслов"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Садржај"
              rows={4}
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounde@d hover:bg-gray-100"
              >
                Одустани
              </button>
              <button
                onClick={handleAddPost}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
