import React from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../CONSTANTS";
import formatTimestamp from "../utils/formatData";

export default function SinglePostPage() {
    const { id } = useParams();
    const [post, setPost] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);
    const [newComment, setNewComment] = React.useState({ content: '', post_id: id, comment_id: null });
    const [modalTitle, setModalTitle] = React.useState("Додај коментар");

    React.useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`${API_URL}/api/posts/${id}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setPost(data.post);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    function openNewCommentModal() {
        setShowModal(true);
        setModalTitle("Додај коментар");
        setNewComment({ ...newComment, comment_id: null });
    }

    function openReplyCommentModal(name, comment_id) {
        setShowModal(true);
        setModalTitle("Одговори на коментар @" + name);
        setNewComment({ ...newComment, comment_id });
    }

    async function handleAddComment() {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newComment),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Дошло је до грешке при креирању коментара.");
            }
            setPost((prevPost) => ({
                ...prevPost,
                comments: data.comments,
            }));
            setNewComment({ content: '', post_id: id, comment_id: null });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setShowModal(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            {/* Error message */}
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded shadow-md mb-4">
                    <p>{error}</p>
                </div>
            )}

            {/* Post Content */}
            {post && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900">{post.title}</h2>
                    <p className="mt-4 text-lg text-gray-700">{post.content}</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Објавио <span className="text-blue-900 font-semibold">{"@" + post.name}</span> • {formatTimestamp(post.created_at)}
                    </p>
                </div>
            )}

            {/* Comments Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Коментари: </h1>
                <button
                    onClick={openNewCommentModal}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Остави коментар
                </button>
            </div>

            {post?.comments?.map((comment, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col space-y-2">
                    <div className="flex items-start space-x-4">
                        <p className="text-md text-gray-900">
                            {comment.comment_id && <span className="text-red-500">{"Одговор за @" + post.comments.find((c, i) => c.id == comment.comment_id)?.name + ": "}</span>}
                            {comment.content}
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Објавио <span className="text-blue-900 font-semibold">{"@" + comment.name}</span> • {formatTimestamp(comment.created_at)}
                    </div>
                    <button onClick={() => openReplyCommentModal(comment.name, comment.id)} className="ml-4 mt-2 text-sm font-semibold text-blue-600 hover:underline">
                        Одговори
                    </button>
                </div>
            ))}

            {/* Modal for Adding/Replying to Comment */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-8 rounded-xl w-full max-w-md space-y-6 shadow-2xl">
                        <h2 className="text-2xl font-semibold">{modalTitle}</h2>
                        <textarea
                            className="w-full p-4 border rounded-lg text-lg"
                            placeholder="Садржај коментара"
                            rows={4}
                            value={newComment.content}
                            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                        ></textarea>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                Одустани
                            </button>
                            <button
                                onClick={handleAddComment}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                            >
                                Коментариши
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
