import { useState } from 'react';
import descriptions from './assets/description.json';

function App() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Hanya file JPG, JPEG, atau PNG yang diperbolehkan.');
      setImage(null);
      setPrediction(null);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('gambar', file);
      const res = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal upload gambar');
        setImage(null);
        setPrediction(null);
      } else {
        setImage(data.url);
        setPrediction(data.prediction);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat upload gambar');
      setImage(null);
      setPrediction(null);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setImage(null);
    setError('');
    setPrediction(null);
  };

  const descriptionData = prediction ? descriptions.find((d) => d.name === prediction.label) : null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 bg-[#D68B4F] text-white py-4 rounded-2xl">Klasifikasi Buah Kurma</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[550px]">
          {/* 1. Upload Gambar */}
          <div className="flex gap-5 flex-col justify-between bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#D68B4F] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
              <h2 className="text-xl font-medium ml-4">Upload Gambar</h2>
            </div>
            <div className="w-full h-px bg-gray-200"></div>
            <div className="h-full flex flex-col items-center justify-center">
              {!image ? (
                <>
                  <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <label
                      className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 cursor-pointer"
                      htmlFor="fileInput"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </label>
                    <p className="text-gray-500">Pilih atau Taruh Gambar</p>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    {loading && <p className="text-blue-500 text-sm mt-2">Mengupload gambar...</p>}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="w-36 aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                    <img src={image} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                  <button
                    onClick={handleCancel}
                    className="mt-2 px-6 py-2 bg-red-500/80 text-white rounded-lg cursor-pointer hover:bg-red-500/90 transition-all text-sm"
                  >
                    Batalkan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Hasil Klasifikasi */}
          <div className="flex gap-5 flex-col justify-between bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#D68B4F] rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
              <h2 className="text-xl font-medium ml-4">Hasil Klasifikasi</h2>
            </div>
            <div className="w-full h-px bg-gray-200"></div>
            <div className="flex flex-col gap-4 h-full">
              {!prediction || !descriptionData ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-6">
                  <p className="text-center text-gray-400">Belum ada gambar yang diupload</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{descriptionData.name}</h3>
                    <p className="text-[#D68B4F] font-medium">Kemiripan: {(prediction.score * 100).toFixed(2)}%</p>
                  </div>
                  <div className="bg-[#FFF3E8] w-full rounded-lg h-54 flex items-center justify-center">
                    <img src={descriptionData.image} alt={descriptionData.name} className="w-full rounded-lg object-contain" />
                  </div>
                  <p className="text-start text-gray-600 text-sm">{descriptionData.description}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
