import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import ImageUploader from './ImageUploader';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (imageUrl, file) => {
    setImage(imageUrl); // Use the server URL
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please write something to post');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await postAPI.createPost({
        text: text.trim(),
        image: image // This will now be the server URL
      });

      onPostCreated(response.data.post);
      setText('');
      setImage('');
      setImageFile(null);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {text.length}/1000
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Image (Optional)
              </label>
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                placeholder="Click or drag to upload image"
                previewClassName="w-full h-48"
                className="mb-2"
              />
            </div>
            
            {image && (
              <div className="mt-2">
                <img
                  src={image}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg"
                  onError={() => setImage('')}
                />
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Posting as {user?.username}
              </div>
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  loading || !text.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
